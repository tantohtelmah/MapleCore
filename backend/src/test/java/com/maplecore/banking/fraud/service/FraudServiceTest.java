package com.maplecore.banking.fraud.service;

import com.maplecore.banking.account.entity.Account;
import com.maplecore.banking.account.entity.AccountStatus;
import com.maplecore.banking.account.repository.AccountRepository;
import com.maplecore.banking.customer.entity.Customer;
import com.maplecore.banking.fraud.entity.FraudAlert;
import com.maplecore.banking.fraud.entity.FraudAlertStatus;
import com.maplecore.banking.fraud.repository.FraudAlertRepository;
import com.maplecore.banking.fraud.service.rules.*;
import com.maplecore.banking.transaction.entity.Transaction;
import com.maplecore.banking.transaction.entity.TransactionStatus;
import com.maplecore.banking.transaction.entity.TransactionType;
import com.maplecore.banking.transaction.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
class FraudServiceTest {

    @Mock
    private FraudAlertRepository fraudAlertRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    private FraudService fraudService;

    private Customer testCustomer;
    private Account sourceAccount;
    private Account destAccount;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        // Strategy injections
        FraudRule rule1 = new HighValueTransferRule();
        FraudRule rule2 = new ExcessiveTransactionsRule();
        
        fraudService = new FraudService(
                List.of(rule1, rule2),
                fraudAlertRepository,
                transactionRepository,
                accountRepository
        );

        testCustomer = Customer.builder().firstName("John").lastName("Doe").build();
        testCustomer.setId(10L);

        sourceAccount = Account.builder()
                .accountNumber("1001111111")
                .balance(new BigDecimal("1000.00"))
                .status(AccountStatus.ACTIVE)
                .build();
        sourceAccount.setId(100L);

        destAccount = Account.builder()
                .accountNumber("2002222222")
                .balance(new BigDecimal("50.00"))
                .status(AccountStatus.ACTIVE)
                .build();
        destAccount.setId(200L);

        testTransaction = Transaction.builder()
                .referenceNumber("TX-FLAG")
                .sourceAccount(sourceAccount)
                .destinationAccount(destAccount)
                .amount(new BigDecimal("150.00"))
                .transactionType(TransactionType.TRANSFER)
                .status(TransactionStatus.FLAGGED)
                .build();
        testTransaction.setId(999L);
    }

    @Test
    void whenEvaluatingHighValueContext_thenFlagsHighValueRule() {
        FraudContext context = new FraudContext(
                testCustomer, sourceAccount, destAccount,
                new BigDecimal("12000.00"), TransactionType.TRANSFER,
                0, false, 0
        );

        FraudRuleResult result = fraudService.evaluateContext(context);

        assertThat(result.isFlagged()).isTrue();
        assertThat(result.ruleName()).contains("HIGH_VALUE_TRANSFER");
    }

    @Test
    void whenEvaluatingVelocityContext_thenFlagsVelocityRule() {
        FraudContext context = new FraudContext(
                testCustomer, sourceAccount, destAccount,
                new BigDecimal("10.00"), TransactionType.TRANSFER,
                4, false, 0
        );

        FraudRuleResult result = fraudService.evaluateContext(context);

        assertThat(result.isFlagged()).isTrue();
        assertThat(result.ruleName()).contains("EXCESSIVE_VELOCITY");
    }

    @Test
    void whenReviewingAlertCleared_thenBalancesMutateAndTransactionCompletes() {
        FraudAlert alert = FraudAlert.builder().transaction(testTransaction).status(FraudAlertStatus.OPEN).build();
        alert.setId(888L);

        Mockito.when(fraudAlertRepository.findById(888L)).thenReturn(Optional.of(alert));
        Mockito.when(accountRepository.findByAccountNumberWithLock("1001111111")).thenReturn(Optional.of(sourceAccount));
        Mockito.when(accountRepository.findByAccountNumberWithLock("2002222222")).thenReturn(Optional.of(destAccount));

        fraudService.reviewAlert(888L, FraudAlertStatus.CLEARED, "Audited and verified", "employee@maple.ca");

        assertThat(alert.getStatus()).isEqualTo(FraudAlertStatus.CLEARED);
        assertThat(testTransaction.getStatus()).isEqualTo(TransactionStatus.COMPLETED);
        assertThat(sourceAccount.getBalance()).isEqualByComparingTo("850.00");
        assertThat(destAccount.getBalance()).isEqualByComparingTo("200.00");
    }
}
