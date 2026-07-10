package com.maplecore.banking.common.exception;

public class InsufficientFundsException extends MapleCoreException {

    public InsufficientFundsException(String message) {
        super(message, "INSUFFICIENT_FUNDS");
    }
}
