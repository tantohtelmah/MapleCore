package com.maplecore.banking.transaction.repository;

import com.maplecore.banking.transaction.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t WHERE t.sourceAccount.id IN (SELECT a.id FROM Account a JOIN a.holders h WHERE h.user.email = :email) " +
           "OR t.destinationAccount.id IN (SELECT a.id FROM Account a JOIN a.holders h WHERE h.user.email = :email)")
    Page<Transaction> findMyTransactions(String email, Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t JOIN t.sourceAccount a JOIN a.holders h " +
           "WHERE h.id = :customerId AND t.transactionType = 'TRANSFER' " +
           "AND t.status = 'COMPLETED' AND t.createdDate >= :startOfDay")
    BigDecimal sumTransferredToday(Long customerId, Instant startOfDay);

    @Query("SELECT COUNT(t) FROM Transaction t JOIN t.sourceAccount a JOIN a.holders h " +
           "WHERE h.id = :customerId AND t.transactionType = 'TRANSFER' " +
           "AND t.status = 'COMPLETED' AND t.createdDate >= :since")
    long countRecentTransfers(Long customerId, Instant since);
}
