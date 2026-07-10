package com.maplecore.banking.transaction.entity;

import com.maplecore.banking.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "idempotency_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdempotencyRecord extends BaseEntity {

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 100)
    private String idempotencyKey;

    @Column(name = "response_body", nullable = false, length = 2000)
    private String responseBody;

    @Column(name = "created_time", nullable = false)
    @Builder.Default
    private Instant createdTime = Instant.now();
}
