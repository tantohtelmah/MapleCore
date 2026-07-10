package com.maplecore.banking.notification.controller;

import com.maplecore.banking.notification.entity.Notification;
import com.maplecore.banking.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getMyNotifications(authentication.getName()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(Authentication authentication, @PathVariable Long id) {
        notificationService.markAsRead(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        return ResponseEntity.ok(notificationService.countUnread(authentication.getName()));
    }
}
