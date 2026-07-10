package com.maplecore.banking.common.exception;

public class AccountLimitExceededException extends MapleCoreException {

    public AccountLimitExceededException(String message) {
        super(message, "LIMIT_EXCEEDED");
    }
}
