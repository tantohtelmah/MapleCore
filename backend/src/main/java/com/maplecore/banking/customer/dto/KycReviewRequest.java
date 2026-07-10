package com.maplecore.banking.customer.dto;

import com.maplecore.banking.customer.entity.KycStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record KycReviewRequest(
        @NotNull(message = "Review status is required")
        KycStatus status, // Can be VERIFIED or REJECTED

        @Size(max = 250, message = "Notes must not exceed 250 characters")
        String notes
) {}
