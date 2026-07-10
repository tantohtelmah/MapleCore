package com.maplecore.banking.common.exception;

public class InvalidTransactionException extends MapleCoreException {

    public InvalidTransactionException(String message) {
        super(message, "INVALID_TRANSACTION");
    }

    public InvalidTransactionException(String message, String errorCode) {
        super(message, errorCode);
    }
}
