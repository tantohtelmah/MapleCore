package com.maplecore.banking.beneficiary.dto;

public record BeneficiaryResponse(
        Long id,
        String name,
        String accountNumber, // masked
        String rawAccountNumber,
        String nickname
) {}
