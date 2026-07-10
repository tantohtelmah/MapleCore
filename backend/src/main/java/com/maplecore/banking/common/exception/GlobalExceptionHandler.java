package com.maplecore.banking.common.exception;

import com.maplecore.banking.common.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getErrorCode(), ex.getMessage(), request, null);
    }

    @ExceptionHandler(InsufficientFundsException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientFundsException(
            InsufficientFundsException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getErrorCode(), ex.getMessage(), request, null);
    }

    @ExceptionHandler(InvalidTransactionException.class)
    public ResponseEntity<ErrorResponse> handleInvalidTransactionException(
            InvalidTransactionException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getErrorCode(), ex.getMessage(), request, null);
    }

    @ExceptionHandler(AccountLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleAccountLimitExceededException(
            AccountLimitExceededException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getErrorCode(), ex.getMessage(), request, null);
    }

    @ExceptionHandler(DuplicateRequestException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateRequestException(
            DuplicateRequestException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.CONFLICT, ex.getErrorCode(), ex.getMessage(), request, null);
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedAccessException(
            UnauthorizedAccessException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getErrorCode(), ex.getMessage(), request, null);
    }

    @ExceptionHandler(MapleCoreException.class)
    public ResponseEntity<ErrorResponse> handleMapleCoreException(
            MapleCoreException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getErrorCode(), ex.getMessage(), request, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access is denied.", request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return buildResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "One or more fields are invalid.", request, errors);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        String correlationId = UUID.randomUUID().toString();
        log.error("Unhandled exception occurred. Correlation ID: {}. Message: {}", correlationId, ex.getMessage(), ex);
        
        ErrorResponse errorResponse = new ErrorResponse(
                Instant.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred. Please contact support.",
                request.getRequestURI(),
                correlationId,
                null
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<ErrorResponse> buildResponse(
            HttpStatus status, String error, String message, HttpServletRequest request, Map<String, String> fieldErrors) {
        String correlationId = UUID.randomUUID().toString();
        log.warn("API Exception. Status: {}, Error: {}, Correlation ID: {}, Path: {}, Message: {}",
                status.value(), error, correlationId, request.getRequestURI(), message);

        ErrorResponse errorResponse = new ErrorResponse(
                Instant.now(),
                status.value(),
                error,
                message,
                request.getRequestURI(),
                correlationId,
                fieldErrors
        );
        return new ResponseEntity<>(errorResponse, status);
    }
}
