package com.maplecore.banking.beneficiary.controller;

import com.maplecore.banking.beneficiary.dto.BeneficiaryRequest;
import com.maplecore.banking.beneficiary.dto.BeneficiaryResponse;
import com.maplecore.banking.beneficiary.service.BeneficiaryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/beneficiaries")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    @PostMapping
    public ResponseEntity<BeneficiaryResponse> addBeneficiary(
            Authentication authentication, @Valid @RequestBody BeneficiaryRequest request) {
        return new ResponseEntity<>(beneficiaryService.addBeneficiary(authentication.getName(), request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BeneficiaryResponse>> getBeneficiaries(Authentication authentication) {
        return ResponseEntity.ok(beneficiaryService.getBeneficiaries(authentication.getName()));
    }

    @PutMapping("/{id}/nickname")
    public ResponseEntity<BeneficiaryResponse> updateNickname(
            Authentication authentication, @PathVariable Long id, @RequestParam String nickname) {
        return ResponseEntity.ok(beneficiaryService.updateNickname(authentication.getName(), id, nickname));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBeneficiary(Authentication authentication, @PathVariable Long id) {
        beneficiaryService.deleteBeneficiary(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
