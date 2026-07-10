package com.maplecore.banking.customer.dto;

import com.maplecore.banking.common.entity.Address;

public record CustomerProfileResponse(
        Long customerId,
        Long userId,
        String email,
        String firstName,
        String lastName,
        String phoneNumber,
        Address address,
        String status,
        String kycStatus
) {}
