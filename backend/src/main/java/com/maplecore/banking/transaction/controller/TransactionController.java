package com.maplecore.banking.transaction.controller;

import com.maplecore.banking.transaction.dto.*;
import com.maplecore.banking.transaction.entity.Transaction;
import com.maplecore.banking.transaction.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/deposits")
    public ResponseEntity<TransactionResponse> deposit(@Valid @RequestBody DepositRequest request) {
        return ResponseEntity.ok(transactionService.deposit(request));
    }

    @PostMapping("/withdrawals")
    public ResponseEntity<TransactionResponse> withdraw(@Valid @RequestBody WithdrawalRequest request) {
        return ResponseEntity.ok(transactionService.withdraw(request));
    }

    @PostMapping("/transfers")
    public ResponseEntity<TransactionResponse> transfer(
            Authentication authentication,
            @Valid @RequestBody TransferRequest request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey) {
        return ResponseEntity.ok(transactionService.transfer(authentication.getName(), request, idempotencyKey));
    }

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getHistory(
            Authentication authentication,
            @PageableDefault(size = 10, sort = "createdDate") Pageable pageable) {
        
        Page<TransactionResponse> history = transactionService.getHistory(authentication.getName(), pageable)
                .map(tx -> new TransactionResponse(
                        tx.getId(),
                        tx.getReferenceNumber(),
                        tx.getSourceAccount() != null ? tx.getSourceAccount().getMaskedAccountNumber() : null,
                        tx.getDestinationAccount() != null ? tx.getDestinationAccount().getMaskedAccountNumber() : null,
                        tx.getAmount(),
                        tx.getTransactionType().name(),
                        tx.getStatus().name(),
                        tx.getDescription(),
                        tx.getCreatedDate()
                ));
        return ResponseEntity.ok(history);
    }
}
