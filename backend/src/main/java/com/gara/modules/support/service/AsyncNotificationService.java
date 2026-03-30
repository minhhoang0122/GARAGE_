package com.gara.modules.support.service;

import com.gara.dto.NotificationDTO;
import com.gara.entity.Notification;
import com.gara.modules.notification.repository.NotificationRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;

@Service
public class AsyncNotificationService {

    private final NotificationRepository notificationRepository;
    private final SseService sseService;
    private final Map<String, LocalDateTime> sentLog = new ConcurrentHashMap<>();

    public AsyncNotificationService(NotificationRepository notificationRepository, SseService sseService) {
        this.notificationRepository = notificationRepository;
        this.sseService = sseService;
    }

    /**
     * Ghi thông báo bất đồng bộ để tốc độ tạo đơn không bị nghẽn
     */
    @Async
    public void pushAsync(Notification notif) {
        try {
            notificationRepository.save(notif);
            
            // Push to SSE using DTO
            NotificationDTO dto = mapToDTO(notif);
            if (notif.getUserId() != null) {
                sseService.send(notif.getUserId(), "notification", dto);
            } else if (notif.getRole() != null) {
                sseService.broadcastToTopic("role:" + notif.getRole(), "notification", dto);
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi Notification bất đồng bộ: " + e.getMessage());
        }
    }

    /**
     * Gửi thông báo có kiểm tra trùng lặp (Idempotency) trong vòng 1 phút
     */
    @Async
    public void pushUniqueAsync(Notification notif) {
        // Chỉ apply deduplication cho user cụ thể, role-based thì nên gửi để đảm bảo (hoặc window ngắn hơn)
        String key = (notif.getUserId() != null ? "USER_" + notif.getUserId() : "ROLE_" + notif.getRole()) + ":" + notif.getTitle();
        LocalDateTime now = LocalDateTime.now();

        // 1. Memory Check (Atomic) - Giảm xuống 10s cho role-based để nhạy hơn
        int window = (notif.getUserId() != null) ? 30 : 10;
        if (sentLog.containsKey(key) && sentLog.get(key).isAfter(now.minusSeconds(window))) {
            return;
        }
        sentLog.put(key, now);

        try {
            // 2. DB Check (Fallback for scale/restart)
            LocalDateTime checkSince = now.minusSeconds(window);
            List<Notification> duplicates;
            
            if (notif.getUserId() != null) {
                duplicates = notificationRepository.findDuplicateUnreadByUser(
                        notif.getUserId(),
                        notif.getTitle(),
                        notif.getContent(),
                        checkSince);
            } else {
                duplicates = notificationRepository.findDuplicateUnreadByRole(
                        notif.getRole(),
                        notif.getTitle(),
                        notif.getContent(),
                        checkSince);
            }

            if (duplicates.isEmpty()) {
                notificationRepository.save(notif);
                
                // Push to SSE using DTO
                NotificationDTO dto = mapToDTO(notif);
                if (notif.getUserId() != null) {
                    sseService.send(notif.getUserId(), "notification", dto);
                } else if (notif.getRole() != null) {
                    sseService.broadcastToTopic("role:" + notif.getRole(), "notification", dto);
                }
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi Notification Unique bất đồng bộ: " + e.getMessage());
        } finally {
            // Cleanup old logs periodically
            if (sentLog.size() > 1000) sentLog.clear();
        }
    }

    private NotificationDTO mapToDTO(Notification notif) {
        return NotificationDTO.builder()
                .id(notif.getId())
                .userId(notif.getUserId())
                .role(notif.getRole())
                .title(notif.getTitle())
                .content(notif.getContent())
                .type(notif.getType())
                .link(notif.getLink())
                .isRead(notif.getIsRead())
                .createdAt(notif.getCreatedAt())
                .build();
    }
}
