package com.maplecore.banking.transaction.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record TransactionResponse(
        Long id,
        String referenceNumber,
        String sourceAccountNumber, // masked
        String destinationAccountNumber, // masked
        BigDecimal amount,
        String transactionType,
        String status,
        String description,
        Instant createdDate
) {}
