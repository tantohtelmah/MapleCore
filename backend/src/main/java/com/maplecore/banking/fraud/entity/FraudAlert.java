package com.maplecore.banking.fraud.entity;

import com.maplecore.banking.common.entity.BaseEntity;
import com.maplecore.banking.transaction.entity.Transaction;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "fraud_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudAlert extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FraudAlertStatus status = FraudAlertStatus.OPEN;

    @Column(name = "triggered_rules", nullable = false, length = 500)
    private String triggeredRules; // Comma separated list of rule names

    @Column(length = 500)
    private String notes;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;
}
