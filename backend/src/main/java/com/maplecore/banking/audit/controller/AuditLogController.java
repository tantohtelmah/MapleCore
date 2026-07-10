package com.maplecore.banking.audit.controller;

import com.maplecore.banking.audit.entity.AuditLog;
import com.maplecore.banking.audit.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/audit-logs")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_COMPLIANCE_OFFICER')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<Page<AuditLog>> getLogs(
            @PageableDefault(size = 20, sort = "createdDate") Pageable pageable) {
        return ResponseEntity.ok(auditLogService.getLogs(pageable));
    }
}
