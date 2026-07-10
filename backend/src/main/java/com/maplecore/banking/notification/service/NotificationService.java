package com.maplecore.banking.notification.service;

import com.maplecore.banking.common.exception.ResourceNotFoundException;
import com.maplecore.banking.common.exception.UnauthorizedAccessException;
import com.maplecore.banking.notification.entity.Notification;
import com.maplecore.banking.notification.repository.NotificationRepository;
import com.maplecore.banking.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Async
    @Transactional
    public void sendNotification(User user, String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .read(false)
                .build();
        notificationRepository.save(notification);
        log.info("Notification dispatched asynchronously to User: {}. Title: {}", user.getEmail(), title);
    }

    @Transactional(readOnly = true)
    public List<Notification> getMyNotifications(String email) {
        return notificationRepository.findByUserEmailOrderByCreatedDateDesc(email);
    }

    @Transactional
    public void markAsRead(String email, Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));

        if (!notification.getUser().getEmail().equals(email)) {
            throw new UnauthorizedAccessException("You cannot modify this notification.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public long countUnread(String email) {
        return notificationRepository.countByUserEmailAndReadFalse(email);
    }
}
