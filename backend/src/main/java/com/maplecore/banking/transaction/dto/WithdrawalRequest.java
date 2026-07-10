package com.maplecore.banking.transaction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record WithdrawalRequest(
        @NotBlank(message = "Source account number is required")
        String sourceAccountNumber,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Withdrawal amount must be greater than zero")
        BigDecimal amount,

        String description
) {}
