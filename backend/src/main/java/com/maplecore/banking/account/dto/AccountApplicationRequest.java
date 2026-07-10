package com.maplecore.banking.account.dto;

import com.maplecore.banking.account.entity.AccountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AccountApplicationRequest(
        @NotNull(message = "Account type is required")
        AccountType accountType,

        @DecimalMin(value = "0.00", message = "Initial deposit cannot be negative")
        BigDecimal initialDeposit
) {}
