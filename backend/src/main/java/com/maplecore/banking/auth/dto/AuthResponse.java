package com.maplecore.banking.auth.dto;

import java.util.Set;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        Long userId,
        String email,
        Set<String> roles
) {}
