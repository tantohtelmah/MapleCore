package com.maplecore.banking.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record KycSubmissionRequest(
        @NotBlank(message = "Document type is required")
        String documentType, // PASSPORT, DRIVERS_LICENSE, PR_CARD

        @NotBlank(message = "Document number is required")
        @Size(min = 5, max = 50, message = "Document number must be between 5 and 50 characters")
        String documentNumber
) {}
