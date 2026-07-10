package com.maplecore.banking.common.exception;

public class ResourceNotFoundException extends MapleCoreException {

    public ResourceNotFoundException(String message) {
        super(message, "RESOURCE_NOT_FOUND");
    }
}
