package com.maplecore.banking.customer.controller;

import com.maplecore.banking.customer.dto.*;
import com.maplecore.banking.customer.entity.CustomerStatus;
import com.maplecore.banking.customer.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/me")
    public ResponseEntity<CustomerProfileResponse> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(customerService.getProfile(authentication.getName()));
    }

    @PatchMapping("/me")
    public ResponseEntity<CustomerProfileResponse> updateMyProfile(
            Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(customerService.updateProfile(authentication.getName(), request));
    }

    @PostMapping("/me/kyc")
    public ResponseEntity<Void> submitMyKyc(
            Authentication authentication, @Valid @RequestBody KycSubmissionRequest request) {
        customerService.submitKyc(authentication.getName(), request);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/{customerId}/kyc/review")
    @PreAuthorize("hasAnyRole('ROLE_BANK_EMPLOYEE', 'ROLE_COMPLIANCE_OFFICER')")
    public ResponseEntity<Void> reviewCustomerKyc(
            @PathVariable Long customerId,
            @Valid @RequestBody KycReviewRequest request,
            Authentication authentication) {
        customerService.reviewKyc(customerId, request, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{customerId}/status")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_BANK_EMPLOYEE')")
    public ResponseEntity<Void> changeCustomerStatus(
            @PathVariable Long customerId,
            @RequestParam CustomerStatus status) {
        customerService.updateCustomerStatus(customerId, status);
        return ResponseEntity.noContent().build();
    }
}
