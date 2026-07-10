package com.maplecore.banking.transaction.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.maplecore.banking.account.entity.Account;
import com.maplecore.banking.account.entity.AccountStatus;
import com.maplecore.banking.account.repository.AccountRepository;
import com.maplecore.banking.common.exception.*;
import com.maplecore.banking.customer.entity.Customer;
import com.maplecore.banking.customer.repository.CustomerRepository;
import com.maplecore.banking.transaction.dto.*;
import com.maplecore.banking.transaction.entity.IdempotencyRecord;
import com.maplecore.banking.transaction.entity.Transaction;
import com.maplecore.banking.transaction.entity.TransactionStatus;
import com.maplecore.banking.transaction.entity.TransactionType;
import com.maplecore.banking.transaction.repository.IdempotencyRecordRepository;
import com.maplecore.banking.transaction.repository.TransactionRepository;
import com.maplecore.banking.fraud.service.FraudService;
import com.maplecore.banking.fraud.service.rules.FraudContext;
import com.maplecore.banking.fraud.service.rules.FraudRuleResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
public class TransactionService {

    private static final BigDecimal DAILY_TRANSFER_LIMIT = new BigDecimal("5000.00");

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final IdempotencyRecordRepository idempotencyRecordRepository;
    private final FraudService fraudService;
    private final ObjectMapper objectMapper;

    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              CustomerRepository customerRepository,
                              IdempotencyRecordRepository idempotencyRecordRepository,
                              FraudService fraudService) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.idempotencyRecordRepository = idempotencyRecordRepository;
        this.fraudService = fraudService;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.findAndRegisterModules();
    }

    @Transactional
    public TransactionResponse deposit(DepositRequest request) {
        String destNo = request.destinationAccountNumber();
        
        // Lock destination account
        Account destAccount = accountRepository.findByAccountNumberWithLock(destNo)
                .orElseThrow(() -> new ResourceNotFoundException("Destination account not found."));

        validateAccountActive(destAccount);

        BigDecimal depositAmount = request.amount().setScale(2, BigDecimal.ROUND_HALF_UP);
        destAccount.setBalance(destAccount.getBalance().add(depositAmount));
        accountRepository.save(destAccount);

        Transaction transaction = Transaction.builder()
                .referenceNumber("TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .destinationAccount(destAccount)
                .amount(depositAmount)
                .transactionType(TransactionType.DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .description(request.description() != null ? request.description() : "Deposit")
                .build();

        Transaction savedTx = transactionRepository.save(transaction);
        return mapToResponse(savedTx);
    }

    @Transactional
    public TransactionResponse withdraw(WithdrawalRequest request) {
        String sourceNo = request.sourceAccountNumber();

        // Lock source account
        Account sourceAccount = accountRepository.findByAccountNumberWithLock(sourceNo)
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found."));

        validateAccountActive(sourceAccount);

        BigDecimal withdrawAmount = request.amount().setScale(2, BigDecimal.ROUND_HALF_UP);
        if (sourceAccount.getBalance().compareTo(withdrawAmount) < 0) {
            throw new InsufficientFundsException("Insufficient funds in account: " + sourceNo);
        }

        sourceAccount.setBalance(sourceAccount.getBalance().subtract(withdrawAmount));
        accountRepository.save(sourceAccount);

        Transaction transaction = Transaction.builder()
                .referenceNumber("TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .sourceAccount(sourceAccount)
                .amount(withdrawAmount)
                .transactionType(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.COMPLETED)
                .description(request.description() != null ? request.description() : "Withdrawal")
                .build();

        Transaction savedTx = transactionRepository.save(transaction);
        return mapToResponse(savedTx);
    }

    @Transactional
    public TransactionResponse transfer(String email, TransferRequest request, String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<IdempotencyRecord> record = idempotencyRecordRepository.findByIdempotencyKey(idempotencyKey);
            if (record.isPresent()) {
                try {
                    return objectMapper.readValue(record.get().getResponseBody(), TransactionResponse.class);
                } catch (JsonProcessingException e) {
                    throw new MapleCoreException("Idempotency parsing error", "INTERNAL_SERVER_ERROR", e);
                }
            }
        }

        String sourceNo = request.sourceAccountNumber();
        String destNo = request.destinationAccountNumber();

        if (sourceNo.equals(destNo)) {
            throw new InvalidTransactionException("Cannot transfer funds to the same account.");
        }

        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found."));

        // Deadlock Prevention: Sort account numbers alphabetically to always lock in the same order
        String firstLock = sourceNo;
        String secondLock = destNo;
        if (sourceNo.compareTo(destNo) > 0) {
            firstLock = destNo;
            secondLock = sourceNo;
        }

        Account lockedFirst = accountRepository.findByAccountNumberWithLock(firstLock)
                .orElseThrow(() -> new ResourceNotFoundException("Account " + firstLock + " not found."));
        Account lockedSecond = accountRepository.findByAccountNumberWithLock(secondLock)
                .orElseThrow(() -> new ResourceNotFoundException("Account " + secondLock + " not found."));

        // Re-resolve source and destination from locks
        Account sourceAccount = sourceNo.equals(firstLock) ? lockedFirst : lockedSecond;
        Account destAccount = destNo.equals(firstLock) ? lockedFirst : lockedSecond;

        // Check ownership of source account
        boolean isOwner = sourceAccount.getHolders().stream()
                .anyMatch(h -> h.getId().equals(customer.getId()));
        if (!isOwner) {
            throw new UnauthorizedAccessException("You are not authorized to transfer from this account.");
        }

        validateAccountActive(sourceAccount);
        validateAccountActive(destAccount);

        BigDecimal transferAmount = request.amount().setScale(2, BigDecimal.ROUND_HALF_UP);

        // Limit Check
        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        BigDecimal todaySum = transactionRepository.sumTransferredToday(customer.getId(), startOfDay);
        if (todaySum.add(transferAmount).compareTo(DAILY_TRANSFER_LIMIT) > 0) {
            throw new AccountLimitExceededException("Daily transfer limit of " + DAILY_TRANSFER_LIMIT + " CAD exceeded.");
        }

        // Balance Check
        if (sourceAccount.getBalance().compareTo(transferAmount) < 0) {
            throw new InsufficientFundsException("Insufficient funds in account: " + sourceNo);
        }

        // Fraud Check
        Instant limitWindow = Instant.now().minus(5, ChronoUnit.MINUTES);
        long recentCount = transactionRepository.countRecentTransfers(customer.getId(), limitWindow);

        FraudContext fraudContext = new FraudContext(
                customer,
                sourceAccount,
                destAccount,
                transferAmount,
                TransactionType.TRANSFER,
                (int) recentCount,
                false,
                0
        );

        FraudRuleResult fraudResult = fraudService.evaluateContext(fraudContext);
        if (fraudResult.isFlagged()) {
            Transaction transaction = Transaction.builder()
                    .referenceNumber("TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .sourceAccount(sourceAccount)
                    .destinationAccount(destAccount)
                    .amount(transferAmount)
                    .transactionType(TransactionType.TRANSFER)
                    .status(TransactionStatus.FLAGGED)
                    .description(request.description() != null ? request.description() : "Transfer (Held)")
                    .build();

            Transaction savedTx = transactionRepository.save(transaction);
            fraudService.createAlert(savedTx, fraudResult.ruleName(), fraudResult.reason());
            TransactionResponse response = mapToResponse(savedTx);

            // Save Idempotency response if key exists
            cacheIdempotency(idempotencyKey, response);

            return response;
        }

        // Apply mutations
        sourceAccount.setBalance(sourceAccount.getBalance().subtract(transferAmount));
        destAccount.setBalance(destAccount.getBalance().add(transferAmount));

        accountRepository.save(sourceAccount);
        accountRepository.save(destAccount);

        Transaction transaction = Transaction.builder()
                .referenceNumber("TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .sourceAccount(sourceAccount)
                .destinationAccount(destAccount)
                .amount(transferAmount)
                .transactionType(TransactionType.TRANSFER)
                .status(TransactionStatus.COMPLETED)
                .description(request.description() != null ? request.description() : "Transfer")
                .build();

        Transaction savedTx = transactionRepository.save(transaction);
        TransactionResponse response = mapToResponse(savedTx);

        // Save Idempotency response if key exists
        cacheIdempotency(idempotencyKey, response);

        return response;
    }

    private void cacheIdempotency(String idempotencyKey, TransactionResponse response) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            try {
                String responseBody = objectMapper.writeValueAsString(response);
                IdempotencyRecord record = IdempotencyRecord.builder()
                        .idempotencyKey(idempotencyKey)
                        .responseBody(responseBody)
                        .build();
                idempotencyRecordRepository.save(record);
            } catch (JsonProcessingException e) {
                // Log and proceed
            }
        }
    }

    @Transactional(readOnly = true)
    public Page<Transaction> getHistory(String email, Pageable pageable) {
        return transactionRepository.findMyTransactions(email, pageable);
    }

    private void validateAccountActive(Account account) {
        if (account.getStatus() == AccountStatus.FROZEN) {
            throw new InvalidTransactionException("Transaction rejected: Account " + account.getAccountNumber() + " is FROZEN.");
        }
        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new InvalidTransactionException("Transaction rejected: Account " + account.getAccountNumber() + " is CLOSED.");
        }
        if (account.getStatus() == AccountStatus.PENDING) {
            throw new InvalidTransactionException("Transaction rejected: Account " + account.getAccountNumber() + " is pending approval.");
        }
    }

    private TransactionResponse mapToResponse(Transaction tx) {
        return new TransactionResponse(
                tx.getId(),
                tx.getReferenceNumber(),
                tx.getSourceAccount() != null ? tx.getSourceAccount().getMaskedAccountNumber() : null,
                tx.getDestinationAccount() != null ? tx.getDestinationAccount().getMaskedAccountNumber() : null,
                tx.getAmount(),
                tx.getTransactionType().name(),
                tx.getStatus().name(),
                tx.getDescription(),
                tx.getCreatedDate()
        );
    }
}
