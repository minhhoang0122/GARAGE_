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
import java.util.stream.Collectors;

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
                .collect(Collectors.toList());

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
