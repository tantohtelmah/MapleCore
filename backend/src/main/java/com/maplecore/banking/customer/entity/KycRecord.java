package com.maplecore.banking.customer.entity;

import com.maplecore.banking.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "kyc_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycRecord extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", referencedColumnName = "id", nullable = false)
    private Customer customer;

    @Column(name = "document_type", nullable = false)
    private String documentType; // e.g. PASSPORT, DRIVERS_LICENSE, PR_CARD

    @Column(name = "document_number", nullable = false)
    private String documentNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private KycStatus status = KycStatus.PENDING_REVIEW;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "reviewed_by")
    private String reviewedBy; // email of employee/compliance officer

    @Column(name = "notes", length = 500)
    private String notes;
}
