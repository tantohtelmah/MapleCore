package com.maplecore.banking.account.service;

import com.maplecore.banking.account.dto.AccountApplicationRequest;
import com.maplecore.banking.account.dto.AccountResponse;
import com.maplecore.banking.account.entity.Account;
import com.maplecore.banking.account.entity.AccountStatus;
import com.maplecore.banking.account.entity.AccountType;
import com.maplecore.banking.account.repository.AccountRepository;
import com.maplecore.banking.common.exception.InvalidTransactionException;
import com.maplecore.banking.common.exception.ResourceNotFoundException;
import com.maplecore.banking.customer.entity.Customer;
import com.maplecore.banking.customer.entity.CustomerStatus;
import com.maplecore.banking.customer.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private AccountService accountService;

    private Customer testCustomer;
    private Account testAccount;

    @BeforeEach
    void setUp() {
        testCustomer = Customer.builder()
                .firstName("John")
                .lastName("Doe")
                .status(CustomerStatus.ACTIVE)
                .build();
        testCustomer.setId(10L);

        testAccount = Account.builder()
                .accountNumber("PENDING-12345")
                .accountType(AccountType.CHEQUING)
                .balance(BigDecimal.ZERO.setScale(2))
                .status(AccountStatus.PENDING)
                .build();
        testAccount.setId(100L);
        testAccount.addHolder(testCustomer);
    }

    @Test
    void whenCustomerNotKycActive_thenApplyingThrowsException() {
        testCustomer.setStatus(CustomerStatus.PENDING_KYC);
        AccountApplicationRequest request = new AccountApplicationRequest(AccountType.CHEQUING, BigDecimal.ZERO);

        Mockito.when(customerRepository.findByUserEmail("john.doe@maple.ca")).thenReturn(Optional.of(testCustomer));

        assertThatThrownBy(() -> accountService.applyForAccount("john.doe@maple.ca", request))
                .isInstanceOf(InvalidTransactionException.class)
                .hasMessageContaining("KYC must be approved");
    }

    @Test
    void whenCustomerKycActive_thenApplyingSucceeds() {
        AccountApplicationRequest request = new AccountApplicationRequest(AccountType.CHEQUING, BigDecimal.TEN);

        Mockito.when(customerRepository.findByUserEmail("john.doe@maple.ca")).thenReturn(Optional.of(testCustomer));
        Mockito.when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        AccountResponse response = accountService.applyForAccount("john.doe@maple.ca", request);

        assertThat(response.status()).isEqualTo("PENDING");
    }

    @Test
    void whenApprovingPendingAccount_thenGeneratesUniqueNumberAndActivates() {
        Mockito.when(accountRepository.findById(100L)).thenReturn(Optional.of(testAccount));
        Mockito.when(accountRepository.findByAccountNumber(any(String.class))).thenReturn(Optional.empty());
        Mockito.when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        AccountResponse response = accountService.approveAccount(100L);

        assertThat(response.status()).isEqualTo("ACTIVE");
        assertThat(response.rawAccountNumber()).startsWith("100"); // Chequing prefix
        assertThat(response.rawAccountNumber().length()).isEqualTo(10);
    }

    @Test
    void whenClosingAccountWithBalance_thenThrowsException() {
        testAccount.setStatus(AccountStatus.ACTIVE);
        testAccount.setBalance(BigDecimal.TEN);

        Mockito.when(accountRepository.findById(100L)).thenReturn(Optional.of(testAccount));

        assertThatThrownBy(() -> accountService.closeAccount(100L))
                .isInstanceOf(InvalidTransactionException.class)
                .hasMessageContaining("balance must be exactly 0.00");
    }

    @Test
    void whenClosingAccountWithZeroBalance_thenSucceeds() {
        testAccount.setStatus(AccountStatus.ACTIVE);
        testAccount.setBalance(BigDecimal.ZERO.setScale(2));

        Mockito.when(accountRepository.findById(100L)).thenReturn(Optional.of(testAccount));
        Mockito.when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        AccountResponse response = accountService.closeAccount(100L);

        assertThat(response.status()).isEqualTo("CLOSED");
    }
}
