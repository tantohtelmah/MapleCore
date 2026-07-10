package com.maplecore.banking.fraud.service.rules;

import com.maplecore.banking.transaction.entity.TransactionType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class HighValueTransferRule implements FraudRule {

    private static final BigDecimal HIGH_VALUE_THRESHOLD = new BigDecimal("10000.00");

    @Override
    public FraudRuleResult evaluate(FraudContext context) {
        if (context.transactionType() == TransactionType.TRANSFER && 
                context.amount().compareTo(HIGH_VALUE_THRESHOLD) >= 0) {
            return new FraudRuleResult(
                    true,
                    "HIGH_VALUE_TRANSFER",
                    "Transfer amount of " + context.amount() + " CAD meets or exceeds threshold of " + HIGH_VALUE_THRESHOLD + " CAD."
            );
        }
        return new FraudRuleResult(false, "HIGH_VALUE_TRANSFER", "Passed threshold validation.");
    }
}
