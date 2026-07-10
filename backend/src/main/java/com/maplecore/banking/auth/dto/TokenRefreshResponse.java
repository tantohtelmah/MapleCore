package com.maplecore.banking.auth.dto;

public record TokenRefreshResponse(
        String accessToken,
        String refreshToken
) {}
