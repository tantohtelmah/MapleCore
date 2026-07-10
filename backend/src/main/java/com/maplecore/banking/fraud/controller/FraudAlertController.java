package com.maplecore.banking.fraud.controller;

import com.maplecore.banking.fraud.entity.FraudAlert;
import com.maplecore.banking.fraud.entity.FraudAlertStatus;
import com.maplecore.banking.fraud.service.FraudService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fraud-alerts")
@PreAuthorize("hasAnyRole('ROLE_BANK_EMPLOYEE', 'ROLE_COMPLIANCE_OFFICER')")
public class FraudAlertController {

    private final FraudService fraudService;

    public FraudAlertController(FraudService fraudService) {
        this.fraudService = fraudService;
    }

    @GetMapping
    public ResponseEntity<List<FraudAlert>> getOpenAlerts() {
        return ResponseEntity.ok(fraudService.getOpenAlerts());
    }

    @PostMapping("/{alertId}/review")
    public ResponseEntity<Void> reviewAlert(
            @PathVariable Long alertId,
            @RequestParam FraudAlertStatus action,
            @RequestParam String notes,
            Authentication authentication) {
        fraudService.reviewAlert(alertId, action, notes, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
