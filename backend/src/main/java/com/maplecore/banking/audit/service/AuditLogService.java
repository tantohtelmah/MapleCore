package com.maplecore.banking.audit.service;

import com.maplecore.banking.audit.entity.AuditLog;
import com.maplecore.banking.audit.repository.AuditLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    @Transactional
    public void log(String actor, String action, String resourceType, String resourceId,
                    String status, String ipAddress, String correlationId, String metadata) {
        
        String corrId = correlationId != null ? correlationId : UUID.randomUUID().toString();

        AuditLog auditLog = AuditLog.builder()
                .actor(actor)
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .status(status)
                .ipAddress(ipAddress)
                .correlationId(corrId)
                .metadata(metadata)
                .build();

        auditLogRepository.save(auditLog);
        log.info("Audit log written asynchronously: Actor: {}, Action: {}, Resource: {}, Correlation ID: {}",
                actor, action, resourceType, corrId);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }
}
