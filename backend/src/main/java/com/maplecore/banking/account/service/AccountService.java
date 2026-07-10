package com.maplecore.banking.account.service;

import com.maplecore.banking.account.dto.AccountApplicationRequest;
import com.maplecore.banking.account.dto.AccountResponse;
import com.maplecore.banking.account.entity.Account;
import com.maplecore.banking.account.entity.AccountStatus;
import com.maplecore.banking.account.entity.AccountType;
import com.maplecore.banking.account.repository.AccountRepository;
import com.maplecore.banking.common.exception.InvalidTransactionException;
import com.maplecore.banking.common.exception.ResourceNotFoundException;
import com.maplecore.banking.common.exception.UnauthorizedAccessException;
import com.maplecore.banking.customer.entity.Customer;
import com.maplecore.banking.customer.entity.CustomerStatus;
import com.maplecore.banking.customer.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final SecureRandom random = new SecureRandom();

    public AccountService(AccountRepository accountRepository, CustomerRepository customerRepository) {
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional
    public AccountResponse applyForAccount(String email, AccountApplicationRequest request) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Complete profile details before applying for accounts."));

        if (customer.getStatus() != CustomerStatus.ACTIVE) {
            throw new InvalidTransactionException("Identity verification (KYC) must be approved before opening accounts.");
        }

        BigDecimal initialBalance = request.initialDeposit() != null ? request.initialDeposit() : BigDecimal.ZERO;
        initialBalance = initialBalance.setScale(2, BigDecimal.ROUND_HALF_UP);

        // Pre-create account in PENDING status, temporary placeholder number
        Account account = Account.builder()
                .accountNumber("PENDING-" + System.currentTimeMillis())
                .accountType(request.accountType())
                .balance(initialBalance)
                .status(AccountStatus.PENDING)
                .currency("CAD")
                .build();
        account.addHolder(customer);

        Account savedAccount = accountRepository.save(account);
        return mapToResponse(savedAccount);
    }

    @Transactional
    public AccountResponse approveAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account application not found."));

        if (account.getStatus() != AccountStatus.PENDING) {
            throw new InvalidTransactionException("Only PENDING accounts can be approved.");
        }

        String accountNumber = generateUniqueAccountNumber(account.getAccountType());
        account.setAccountNumber(accountNumber);
        account.setStatus(AccountStatus.ACTIVE);

        Account approvedAccount = accountRepository.save(account);
        return mapToResponse(approvedAccount);
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getMyAccounts(String email) {
        return accountRepository.findByHoldersUserEmail(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountDetails(String email, Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found."));

        // Check if the user owns this account
        boolean isOwner = account.getHolders().stream()
                .anyMatch(customer -> customer.getUser().getEmail().equals(email));

        if (!isOwner) {
            throw new UnauthorizedAccessException("You are not authorized to view this account.");
        }

        return mapToResponse(account);
    }

    @Transactional
    public AccountResponse freezeAccount(Long accountId) {
        return updateStatus(accountId, AccountStatus.FROZEN);
    }

    @Transactional
    public AccountResponse unfreezeAccount(Long accountId) {
        return updateStatus(accountId, AccountStatus.ACTIVE);
    }

    @Transactional
    public AccountResponse closeAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found."));

        if (account.getBalance().compareTo(BigDecimal.ZERO) != 0) {
            throw new InvalidTransactionException("Account balance must be exactly 0.00 to close it.");
        }

        return updateStatus(accountId, AccountStatus.CLOSED);
    }

    private AccountResponse updateStatus(Long accountId, AccountStatus newStatus) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found."));

        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new InvalidTransactionException("Closed accounts are archived and cannot change status.");
        }

        account.setStatus(newStatus);
        Account savedAccount = accountRepository.save(account);
        return mapToResponse(savedAccount);
    }

    private String generateUniqueAccountNumber(AccountType type) {
        String prefix = switch (type) {
            case CHEQUING -> "100";
            case SAVINGS -> "200";
            case BUSINESS -> "300";
        };

        String number;
        do {
            int randomPart = 1000000 + random.nextInt(9000000); // 7 random digits
            number = prefix + randomPart;
        } while (accountRepository.findByAccountNumber(number).isPresent());

        return number;
    }

    private AccountResponse mapToResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getMaskedAccountNumber(),
                account.getAccountNumber(),
                account.getAccountType().name(),
                account.getBalance(),
                account.getStatus().name(),
                account.getCurrency(),
                account.getCreatedDate()
        );
    }
}
