package com.maplecore.banking.dashboard.dto;

public record OperationsDashboardResponse(
        long activeCustomersCount,
        long pendingKycCount,
        long pendingAccountsCount,
        long flaggedTransactionsCount
) {}
