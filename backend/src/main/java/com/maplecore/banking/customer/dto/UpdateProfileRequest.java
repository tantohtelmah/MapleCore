package com.maplecore.banking.customer.dto;

import com.maplecore.banking.common.entity.Address;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record UpdateProfileRequest(
        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+?1?\\d{10}$", message = "Phone number must be a valid 10-digit Canadian/US number")
        String phoneNumber,

        @NotNull(message = "Address details are required")
        @Valid
        Address address
) {}
