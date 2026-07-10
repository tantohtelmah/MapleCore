package com.maplecore.banking.fraud.service.rules;

import com.maplecore.banking.account.entity.Account;
import com.maplecore.banking.customer.entity.Customer;
import com.maplecore.banking.transaction.entity.TransactionType;

import java.math.BigDecimal;

public record FraudContext(
        Customer customer,
        Account sourceAccount,
        Account destinationAccount,
        BigDecimal amount,
        TransactionType transactionType,
        int recentTransactionCount,
        boolean isFailedLoginAttempt,
        int failedLoginCount
) {}
