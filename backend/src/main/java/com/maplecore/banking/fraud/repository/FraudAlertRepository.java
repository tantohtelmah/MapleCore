package com.maplecore.banking.fraud.repository;

import com.maplecore.banking.fraud.entity.FraudAlert;
import com.maplecore.banking.fraud.entity.FraudAlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, Long> {
    List<FraudAlert> findByStatus(FraudAlertStatus status);
}
