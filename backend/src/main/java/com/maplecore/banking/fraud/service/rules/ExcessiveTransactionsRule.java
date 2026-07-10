package com.maplecore.banking.fraud.service.rules;

import org.springframework.stereotype.Component;

@Component
public class ExcessiveTransactionsRule implements FraudRule {

    private static final int MAX_TRANSACTIONS_LIMIT = 3;

    @Override
    public FraudRuleResult evaluate(FraudContext context) {
        if (context.recentTransactionCount() >= MAX_TRANSACTIONS_LIMIT) {
            return new FraudRuleResult(
                    true,
                    "EXCESSIVE_VELOCITY",
                    "Customer has executed " + context.recentTransactionCount() + " transfers recently, triggering velocity check limit (" + MAX_TRANSACTIONS_LIMIT + ")."
            );
        }
        return new FraudRuleResult(false, "EXCESSIVE_VELOCITY", "Passed velocity check.");
    }
}
