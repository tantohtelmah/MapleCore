package com.maplecore.banking.common.exception;

public class UnauthorizedAccessException extends MapleCoreException {

    public UnauthorizedAccessException(String message) {
        super(message, "UNAUTHORIZED_ACCESS");
    }
}
