package com.gara.modules.support.controller;

import com.gara.dto.NotificationDTO;
import com.gara.entity.Notification;
import com.gara.entity.User;
import com.gara.modules.identity.service.UserService;
import com.gara.modules.notification.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public NotificationController(NotificationRepository notificationRepository, UserService userService) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(@AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        List<String> userRoles = user.getRoles().stream()
                .map(com.gara.entity.Role::getName)
                .toList();

        List<Notification> notifications = notificationRepository.findUnreadByUserOrRoles(
                user.getId(),
                userRoles,
                org.springframework.data.domain.PageRequest.of(0, 50));

        List<NotificationDTO> dtos = notifications.stream()
                .map(notif -> NotificationDTO.builder()
                        .id(notif.getId())
                        .userId(notif.getUserId())
                        .role(notif.getRole())
                        .title(notif.getTitle())
                        .content(notif.getContent())
                        .type(notif.getType())
                        .link(notif.getLink())
                        .isRead(notif.getIsRead())
                        .createdAt(notif.getCreatedAt())
                        .build())
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        List<String> userRoles = user.getRoles().stream()
                .map(com.gara.entity.Role::getName)
                .toList();
        
        System.out.println("[Notification] Marking all as read for user: " + user.getId() + ", roles: " + userRoles);
        notificationRepository.markAllAsRead(user.getId(), userRoles);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/read")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> markAsRead(@PathVariable Integer id) {
        System.out.println("[Notification] Marking as read ID: " + id);
        Notification notif = notificationRepository.findById(id).orElse(null);
        if (notif != null) {
            notif.setIsRead(true);
            notificationRepository.save(notif);
            System.out.println("[Notification] SUCCESS: Marked ID " + id + " as read.");
        } else {
            System.err.println("[Notification] FAILED: Notification ID " + id + " not found!");
        }
        return ResponseEntity.ok().build();
    }
}
