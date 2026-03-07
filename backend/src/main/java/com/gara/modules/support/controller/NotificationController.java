package com.gara.modules.support.controller;

import com.gara.entity.Notification;
import com.gara.entity.User;
import com.gara.modules.notification.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal User user) {
        List<String> userRoles = user.getRoles().stream()
                .map(com.gara.entity.Role::getName)
                .toList();

        return ResponseEntity.ok(notificationRepository.findUnreadByUserOrRoles(
                user.getId(),
                userRoles,
                org.springframework.data.domain.PageRequest.of(0, 50)));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal User user) {
        List<String> userRoles = user.getRoles().stream()
                .map(com.gara.entity.Role::getName)
                .toList();
        notificationRepository.markAllAsRead(user.getId(), userRoles);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Integer id) {
        Notification notif = notificationRepository.findById(id).orElse(null);
        if (notif != null) {
            notif.setIsRead(true);
            notificationRepository.save(notif);
        }
        return ResponseEntity.ok().build();
    }
}
