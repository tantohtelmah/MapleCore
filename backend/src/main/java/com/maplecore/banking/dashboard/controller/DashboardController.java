package com.maplecore.banking.dashboard.controller;

import com.maplecore.banking.dashboard.dto.CustomerDashboardResponse;
import com.maplecore.banking.dashboard.dto.OperationsDashboardResponse;
import com.maplecore.banking.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/customer")
    public ResponseEntity<CustomerDashboardResponse> getCustomerDashboard(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getCustomerDashboard(authentication.getName()));
    }

    @GetMapping("/operations")
    @PreAuthorize("hasAnyRole('ROLE_BANK_EMPLOYEE', 'ROLE_COMPLIANCE_OFFICER', 'ROLE_ADMIN')")
    public ResponseEntity<OperationsDashboardResponse> getOperationsDashboard() {
        return ResponseEntity.ok(dashboardService.getOperationsDashboard());
    }
}
