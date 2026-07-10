package com.maplecore.banking.audit.entity;

import com.maplecore.banking.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog extends BaseEntity {

    @Column(nullable = false)
    private String actor; // e.g. user email or "SYSTEM"

    @Column(nullable = false)
    private String action; // e.g. LOGIN, CREATE_ACCOUNT, TRANSFER_COMPLETED

    @Column(name = "resource_type", nullable = false)
    private String resourceType; // e.g. USER, ACCOUNT, TRANSACTION

    @Column(name = "resource_id")
    private String resourceId; // Opaque reference id (e.g. account ID, transaction reference)

    @Column(nullable = false)
    private String status; // SUCCESS, FAILURE

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "correlation_id", nullable = false)
    private String correlationId;

    @Column(length = 1000)
    private String metadata; // Sanitized JSON or extra details string
}
