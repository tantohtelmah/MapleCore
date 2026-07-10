package com.maplecore.banking.customer.repository;

import com.maplecore.banking.customer.entity.KycRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KycRecordRepository extends JpaRepository<KycRecord, Long> {
    Optional<KycRecord> findByCustomerId(Long customerId);
}
