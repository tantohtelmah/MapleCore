package com.maplecore.banking.account.controller;

import com.maplecore.banking.account.dto.AccountApplicationRequest;
import com.maplecore.banking.account.dto.AccountResponse;
import com.maplecore.banking.account.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/applications")
    public ResponseEntity<AccountResponse> applyForAccount(
            Authentication authentication, @Valid @RequestBody AccountApplicationRequest request) {
        return new ResponseEntity<>(accountService.applyForAccount(authentication.getName(), request), HttpStatus.CREATED);
    }

    @PostMapping("/{accountId}/approve")
    @PreAuthorize("hasRole('ROLE_BANK_EMPLOYEE')")
    public ResponseEntity<AccountResponse> approveAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(accountService.approveAccount(accountId));
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getMyAccounts(Authentication authentication) {
        return ResponseEntity.ok(accountService.getMyAccounts(authentication.getName()));
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<AccountResponse> getAccountDetails(
            Authentication authentication, @PathVariable Long accountId) {
        return ResponseEntity.ok(accountService.getAccountDetails(authentication.getName(), accountId));
    }

    @PostMapping("/{accountId}/freeze")
    @PreAuthorize("hasRole('ROLE_BANK_EMPLOYEE')")
    public ResponseEntity<AccountResponse> freezeAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(accountService.freezeAccount(accountId));
    }

    @PostMapping("/{accountId}/unfreeze")
    @PreAuthorize("hasRole('ROLE_BANK_EMPLOYEE')")
    public ResponseEntity<AccountResponse> unfreezeAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(accountService.unfreezeAccount(accountId));
    }

    @PostMapping("/{accountId}/close")
    public ResponseEntity<AccountResponse> closeAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(accountService.closeAccount(accountId));
    }
}
