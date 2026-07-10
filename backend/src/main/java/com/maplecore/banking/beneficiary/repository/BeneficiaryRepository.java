package com.maplecore.banking.beneficiary.repository;

import com.maplecore.banking.beneficiary.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findByCustomerId(Long customerId);
    List<Beneficiary> findByCustomerUserEmail(String email);
    boolean existsByCustomerIdAndAccountNumber(Long customerId, String accountNumber);
}
