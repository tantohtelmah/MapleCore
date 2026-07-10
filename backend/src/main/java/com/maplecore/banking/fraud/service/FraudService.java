package com.maplecore.banking.fraud.service;

import com.maplecore.banking.account.entity.Account;
import com.maplecore.banking.account.repository.AccountRepository;
import com.maplecore.banking.common.exception.InsufficientFundsException;
import com.maplecore.banking.common.exception.InvalidTransactionException;
import com.maplecore.banking.common.exception.ResourceNotFoundException;
import com.maplecore.banking.fraud.entity.FraudAlert;
import com.maplecore.banking.fraud.entity.FraudAlertStatus;
import com.maplecore.banking.fraud.repository.FraudAlertRepository;
import com.maplecore.banking.fraud.service.rules.FraudContext;
import com.maplecore.banking.fraud.service.rules.FraudRule;
import com.maplecore.banking.fraud.service.rules.FraudRuleResult;
import com.maplecore.banking.transaction.entity.Transaction;
import com.maplecore.banking.transaction.entity.TransactionStatus;
import com.maplecore.banking.transaction.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FraudService {

    private final List<FraudRule> rules;
    private final FraudAlertRepository fraudAlertRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public FraudService(List<FraudRule> rules,
                        FraudAlertRepository fraudAlertRepository,
                        TransactionRepository transactionRepository,
                        AccountRepository accountRepository) {
        this.rules = rules;
        this.fraudAlertRepository = fraudAlertRepository;
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    public FraudRuleResult evaluateContext(FraudContext context) {
        List<FraudRuleResult> flaggedResults = rules.stream()
                .map(rule -> rule.evaluate(context))
                .filter(FraudRuleResult::isFlagged)
                .collect(Collectors.toList());

        if (!flaggedResults.isEmpty()) {
            String ruleNames = flaggedResults.stream()
                    .map(FraudRuleResult::ruleName)
                    .collect(Collectors.joining(","));
            String reasons = flaggedResults.stream()
                    .map(FraudRuleResult::reason)
                    .collect(Collectors.joining("; "));
            return new FraudRuleResult(true, ruleNames, reasons);
        }

        return new FraudRuleResult(false, "NONE", "Passed all security validations.");
    }

    @Transactional
    public void createAlert(Transaction transaction, String triggeredRules, String notes) {
        FraudAlert alert = FraudAlert.builder()
                .transaction(transaction)
                .triggeredRules(triggeredRules)
                .status(FraudAlertStatus.OPEN)
                .notes(notes)
                .build();
        fraudAlertRepository.save(alert);
    }

    @Transactional(readOnly = true)
    public List<FraudAlert> getOpenAlerts() {
        return fraudAlertRepository.findByStatus(FraudAlertStatus.OPEN);
    }

    @Transactional
    public void reviewAlert(Long alertId, FraudAlertStatus action, String notes, String reviewerEmail) {
        FraudAlert alert = fraudAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Fraud alert not found."));

        if (alert.getStatus() != FraudAlertStatus.OPEN) {
            throw new InvalidTransactionException("This fraud alert has already been reviewed.");
        }

        Transaction transaction = alert.getTransaction();
        if (action == FraudAlertStatus.CLEARED) {
            // Execute the held transaction atomically!
            Account source = transaction.getSourceAccount();
            Account dest = transaction.getDestinationAccount();

            // Lock accounts in alphabetical order to prevent deadlocks
            String firstLock = source.getAccountNumber();
            String secondLock = dest.getAccountNumber();
            if (firstLock.compareTo(secondLock) > 0) {
                firstLock = dest.getAccountNumber();
                secondLock = source.getAccountNumber();
            }

            Account lockedFirst = accountRepository.findByAccountNumberWithLock(firstLock).get();
            Account lockedSecond = accountRepository.findByAccountNumberWithLock(secondLock).get();

            Account actualSource = source.getAccountNumber().equals(firstLock) ? lockedFirst : lockedSecond;
            Account actualDest = dest.getAccountNumber().equals(firstLock) ? lockedFirst : lockedSecond;

            BigDecimal amount = transaction.getAmount();
            if (actualSource.getBalance().compareTo(amount) < 0) {
                transaction.setStatus(TransactionStatus.FAILED);
                transactionRepository.save(transaction);
                alert.setStatus(FraudAlertStatus.ESCALATED);
                alert.setNotes("Verification cleared but source account has insufficient funds. Status failed.");
            } else {
                actualSource.setBalance(actualSource.getBalance().subtract(amount));
                actualDest.setBalance(actualDest.getBalance().add(amount));
                accountRepository.save(actualSource);
                accountRepository.save(actualDest);

                transaction.setStatus(TransactionStatus.COMPLETED);
                transactionRepository.save(transaction);

                alert.setStatus(FraudAlertStatus.CLEARED);
                alert.setNotes(notes);
            }
        } else {
            // Reject the transaction
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);

            alert.setStatus(action);
            alert.setNotes(notes);
        }

        alert.setReviewedAt(Instant.now());
        alert.setReviewedBy(reviewerEmail);
        fraudAlertRepository.save(alert);
    }
}
