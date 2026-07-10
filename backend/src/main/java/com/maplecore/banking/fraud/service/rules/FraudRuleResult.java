package com.maplecore.banking.fraud.service.rules;

public record FraudRuleResult(
        boolean isFlagged,
        String ruleName,
        String reason
) {}
