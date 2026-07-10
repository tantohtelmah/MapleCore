package com.maplecore.banking.beneficiary.entity;

import com.maplecore.banking.common.entity.BaseEntity;
import com.maplecore.banking.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "beneficiaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Beneficiary extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private String name;

    @Column(name = "account_number", nullable = false, length = 20)
    private String accountNumber;

    @Column(length = 50)
    private String nickname;
}
