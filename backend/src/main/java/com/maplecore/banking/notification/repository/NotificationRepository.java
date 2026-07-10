package com.maplecore.banking.notification.repository;

import com.maplecore.banking.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserEmailOrderByCreatedDateDesc(String email);
    long countByUserEmailAndReadFalse(String email);
}
