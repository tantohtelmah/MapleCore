package com.maplecore.banking.fraud.service.rules;

public interface FraudRule {
    FraudRuleResult evaluate(FraudContext context);
}
