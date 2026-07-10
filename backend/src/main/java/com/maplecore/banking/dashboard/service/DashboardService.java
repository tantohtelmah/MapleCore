package com.maplecore.banking.dashboard.service;

import com.maplecore.banking.account.dto.AccountResponse;
import com.maplecore.banking.account.entity.Account;
import com.maplecore.banking.account.entity.AccountStatus;
import com.maplecore.banking.account.repository.AccountRepository;
import com.maplecore.banking.customer.entity.CustomerStatus;
import com.maplecore.banking.customer.entity.KycStatus;
import com.maplecore.banking.customer.repository.CustomerRepository;
import com.maplecore.banking.customer.repository.KycRecordRepository;
import com.maplecore.banking.dashboard.dto.CustomerDashboardResponse;
import com.maplecore.banking.dashboard.dto.OperationsDashboardResponse;
import com.maplecore.banking.fraud.entity.FraudAlertStatus;
import com.maplecore.banking.fraud.repository.FraudAlertRepository;
import com.maplecore.banking.notification.repository.NotificationRepository;
import com.maplecore.banking.transaction.dto.TransactionResponse;
import com.maplecore.banking.transaction.repository.TransactionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;
    private final CustomerRepository customerRepository;
    private final FraudAlertRepository fraudAlertRepository;

    public DashboardService(AccountRepository accountRepository,
                            TransactionRepository transactionRepository,
                            NotificationRepository notificationRepository,
                            CustomerRepository customerRepository,
                            FraudAlertRepository fraudAlertRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.notificationRepository = notificationRepository;
        this.customerRepository = customerRepository;
        this.fraudAlertRepository = fraudAlertRepository;
    }

    @Transactional(readOnly = true)
    public CustomerDashboardResponse getCustomerDashboard(String email) {
        List<Account> myAccounts = accountRepository.findByHoldersUserEmail(email);

        BigDecimal totalBalance = myAccounts.stream()
                .filter(acc -> acc.getStatus() == AccountStatus.ACTIVE)
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, BigDecimal.ROUND_HALF_UP);

        List<AccountResponse> accountsList = myAccounts.stream()
                .map(acc -> new AccountResponse(
                        acc.getId(),
                        acc.getMaskedAccountNumber(),
                        acc.getAccountNumber(),
                        acc.getAccountType().name(),
                        acc.getBalance(),
                        acc.getStatus().name(),
                        acc.getCurrency(),
                        acc.getCreatedDate()
                ))
                .collect(Collectors.toList());

        List<TransactionResponse> recentTx = transactionRepository
                .findMyTransactions(email, PageRequest.of(0, 5, Sort.by("createdDate").descending()))
                .stream()
                .map(tx -> new TransactionResponse(
                        tx.getId(),
                        tx.getReferenceNumber(),
                        tx.getSourceAccount() != null ? tx.getSourceAccount().getMaskedAccountNumber() : null,
                        tx.getDestinationAccount() != null ? tx.getDestinationAccount().getMaskedAccountNumber() : null,
                        tx.getAmount(),
                        tx.getTransactionType().name(),
                        tx.getStatus().name(),
                        tx.getDescription(),
                        tx.getCreatedDate()
                ))
                .collect(Collectors.toList());

        long unreadCount = notificationRepository.countByUserEmailAndReadFalse(email);

        return new CustomerDashboardResponse(totalBalance, accountsList, recentTx, unreadCount);
    }

    @Transactional(readOnly = true)
    public OperationsDashboardResponse getOperationsDashboard() {
        long activeCustomers = customerRepository.count(); // Basic total for demo
        
        long pendingKyc = fraudAlertRepository.count(); // Standard compliance alerts
        long pendingAccounts = accountRepository.findAll().stream()
                .filter(acc -> acc.getStatus() == AccountStatus.PENDING)
                .count();

        long openAlerts = fraudAlertRepository.findByStatus(FraudAlertStatus.OPEN).size();

        return new OperationsDashboardResponse(activeCustomers, openAlerts, pendingAccounts, openAlerts);
    }
}
