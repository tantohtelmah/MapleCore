package com.maplecore.banking.common.exception;

import lombok.Getter;

@Getter
public class MapleCoreException extends RuntimeException {
    
    private final String errorCode;

    public MapleCoreException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public MapleCoreException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
}
