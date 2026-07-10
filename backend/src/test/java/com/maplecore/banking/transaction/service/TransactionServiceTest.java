package com.maplecore.banking.transaction.service;

import com.maplecore.banking.account.entity.Account;
import com.maplecore.banking.account.entity.AccountStatus;
import com.maplecore.banking.account.entity.AccountType;
import com.maplecore.banking.account.repository.AccountRepository;
import com.maplecore.banking.common.exception.AccountLimitExceededException;
import com.maplecore.banking.common.exception.InsufficientFundsException;
import com.maplecore.banking.customer.entity.Customer;
import com.maplecore.banking.customer.repository.CustomerRepository;
import com.maplecore.banking.transaction.dto.DepositRequest;
import com.maplecore.banking.transaction.dto.TransactionResponse;
import com.maplecore.banking.transaction.dto.TransferRequest;
import com.maplecore.banking.transaction.dto.WithdrawalRequest;
import com.maplecore.banking.transaction.entity.IdempotencyRecord;
import com.maplecore.banking.transaction.entity.Transaction;
import com.maplecore.banking.transaction.repository.IdempotencyRecordRepository;
import com.maplecore.banking.transaction.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private IdempotencyRecordRepository idempotencyRecordRepository;

    @InjectMocks
    private TransactionService transactionService;

    private Customer testCustomer;
    private Account sourceAccount;
    private Account destAccount;

    @BeforeEach
    void setUp() {
        testCustomer = Customer.builder().firstName("John").lastName("Doe").build();
        testCustomer.setId(10L);

        sourceAccount = Account.builder()
                .accountNumber("1001111111")
                .accountType(AccountType.CHEQUING)
                .balance(new BigDecimal("1000.00"))
                .status(AccountStatus.ACTIVE)
                .build();
        sourceAccount.setId(100L);
        sourceAccount.addHolder(testCustomer);

        destAccount = Account.builder()
                .accountNumber("2002222222")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("50.00"))
                .status(AccountStatus.ACTIVE)
                .build();
        destAccount.setId(200L);
        destAccount.addHolder(testCustomer);
    }

    @Test
    void whenDepositing_thenBalanceIncreases() {
        DepositRequest request = new DepositRequest("2002222222", new BigDecimal("100.00"), "ATM Deposit");

        Mockito.when(accountRepository.findByAccountNumberWithLock("2002222222")).thenReturn(Optional.of(destAccount));
        Mockito.when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionResponse response = transactionService.deposit(request);

        assertThat(response.status()).isEqualTo("COMPLETED");
        assertThat(destAccount.getBalance()).isEqualByComparingTo("150.00");
    }

    @Test
    void whenWithdrawingWithLowBalance_thenThrowsException() {
        WithdrawalRequest request = new WithdrawalRequest("1001111111", new BigDecimal("1500.00"), "ATM Cash");

        Mockito.when(accountRepository.findByAccountNumberWithLock("1001111111")).thenReturn(Optional.of(sourceAccount));

        assertThatThrownBy(() -> transactionService.withdraw(request))
                .isInstanceOf(InsufficientFundsException.class)
                .hasMessageContaining("Insufficient funds");
    }

    @Test
    void whenTransferringExceedingDailyLimit_thenThrowsException() {
        TransferRequest request = new TransferRequest("1001111111", "2002222222", new BigDecimal("6000.00"), "Rent");

        Mockito.when(customerRepository.findByUserEmail("john.doe@maple.ca")).thenReturn(Optional.of(testCustomer));
        Mockito.when(accountRepository.findByAccountNumberWithLock("1001111111")).thenReturn(Optional.of(sourceAccount));
        Mockito.when(accountRepository.findByAccountNumberWithLock("2002222222")).thenReturn(Optional.of(destAccount));
        Mockito.when(transactionRepository.sumTransferredToday(eq(10L), any(Instant.class))).thenReturn(BigDecimal.ZERO);

        assertThatThrownBy(() -> transactionService.transfer("john.doe@maple.ca", request, null))
                .isInstanceOf(AccountLimitExceededException.class)
                .hasMessageContaining("exceeded");
    }

    @Test
    void whenTransferringSucceeds_thenBalancesMutateAtomically() {
        TransferRequest request = new TransferRequest("1001111111", "2002222222", new BigDecimal("200.00"), "Split");

        Mockito.when(customerRepository.findByUserEmail("john.doe@maple.ca")).thenReturn(Optional.of(testCustomer));
        Mockito.when(accountRepository.findByAccountNumberWithLock("1001111111")).thenReturn(Optional.of(sourceAccount));
        Mockito.when(accountRepository.findByAccountNumberWithLock("2002222222")).thenReturn(Optional.of(destAccount));
        Mockito.when(transactionRepository.sumTransferredToday(eq(10L), any(Instant.class))).thenReturn(BigDecimal.ZERO);
        Mockito.when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionResponse response = transactionService.transfer("john.doe@maple.ca", request, null);

        assertThat(response.status()).isEqualTo("COMPLETED");
        assertThat(sourceAccount.getBalance()).isEqualByComparingTo("800.00");
        assertThat(destAccount.getBalance()).isEqualByComparingTo("250.00");
    }

    @Test
    void whenTransferringRetriedWithSameIdempotencyKey_thenReturnsCachedResponse() {
        TransferRequest request = new TransferRequest("1001111111", "2002222222", new BigDecimal("10.00"), "Retry");
        String key = "test-uuid-123456";
        String cachedJson = "{\"id\":999,\"referenceNumber\":\"TX-CACHED\",\"sourceAccountNumber\":\"******1111\",\"destinationAccountNumber\":\"******2222\",\"amount\":10.00,\"transactionType\":\"TRANSFER\",\"status\":\"COMPLETED\",\"description\":\"Retry\"}";

        IdempotencyRecord record = IdempotencyRecord.builder().idempotencyKey(key).responseBody(cachedJson).build();

        Mockito.when(idempotencyRecordRepository.findByIdempotencyKey(key)).thenReturn(Optional.of(record));

        TransactionResponse response = transactionService.transfer("john.doe@maple.ca", request, key);

        assertThat(response.referenceNumber()).isEqualTo("TX-CACHED");
        assertThat(response.amount()).isEqualByComparingTo("10.00");
    }
}
