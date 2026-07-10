package com.maplecore.banking.account.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record AccountResponse(
        Long id,
        String accountNumber, // masked, e.g. "******1234"
        String rawAccountNumber, // raw number
        String accountType,
        BigDecimal balance,
        String status,
        String currency,
        Instant createdDate
) {}
