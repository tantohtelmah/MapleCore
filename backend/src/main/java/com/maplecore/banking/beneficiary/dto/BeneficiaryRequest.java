package com.maplecore.banking.beneficiary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BeneficiaryRequest(
        @NotBlank(message = "Beneficiary name is required")
        @Size(max = 100, message = "Name must not exceed 100 characters")
        String name,

        @NotBlank(message = "Account number is required")
        @Size(min = 5, max = 20, message = "Account number must be between 5 and 20 digits")
        String accountNumber,

        @Size(max = 50, message = "Nickname must not exceed 50 characters")
        String nickname
) {}
