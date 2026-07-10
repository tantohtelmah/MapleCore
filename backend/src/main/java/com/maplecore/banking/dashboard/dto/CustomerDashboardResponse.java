package com.maplecore.banking.dashboard.dto;

import com.maplecore.banking.account.dto.AccountResponse;
import com.maplecore.banking.transaction.dto.TransactionResponse;

import java.math.BigDecimal;
import java.util.List;

public record CustomerDashboardResponse(
        BigDecimal totalBalance,
        List<AccountResponse> accounts,
        List<TransactionResponse> recentTransactions,
        long unreadNotificationsCount
) {}
