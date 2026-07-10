package com.maplecore.banking.account.entity;

import com.maplecore.banking.common.entity.BaseEntity;
import com.maplecore.banking.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account extends BaseEntity {

    @Column(name = "account_number", nullable = false, unique = true, length = 20)
    private String accountNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO.setScale(2);

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AccountStatus status = AccountStatus.PENDING;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "CAD";

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "account_holders",
            joinColumns = @JoinColumn(name = "account_id"),
            inverseJoinColumns = @JoinColumn(name = "customer_id")
    )
    @Builder.Default
    private Set<Customer> holders = new HashSet<>();

    public void addHolder(Customer customer) {
        this.holders.add(customer);
    }

    public String getMaskedAccountNumber() {
        if (accountNumber == null || accountNumber.length() < 4) {
            return "******";
        }
        return "******" + accountNumber.substring(accountNumber.length() - 4);
    }
}
