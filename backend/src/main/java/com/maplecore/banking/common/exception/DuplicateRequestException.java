package com.maplecore.banking.common.exception;

public class DuplicateRequestException extends MapleCoreException {

    public DuplicateRequestException(String message) {
        super(message, "DUPLICATE_REQUEST");
    }
}
