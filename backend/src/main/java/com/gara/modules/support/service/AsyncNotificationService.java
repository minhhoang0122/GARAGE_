package com.gara.modules.support.service;

import com.gara.entity.Notification;
import com.gara.modules.notification.repository.NotificationRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AsyncNotificationService {

    private final NotificationRepository notificationRepository;
    private final java.util.Map<String, java.time.LocalDateTime> sentLog = new java.util.concurrent.ConcurrentHashMap<>();

    public AsyncNotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Ghi thông báo bất đồng bộ để tốc độ tạo đơn không bị nghẽn
     */
    @Async
    public void pushAsync(Notification notif) {
        try {
            notificationRepository.save(notif);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi Notification bất đồng bộ: " + e.getMessage());
        }
    }

    /**
     * Gửi thông báo có kiểm tra trùng lặp (Idempotency) trong vòng 1 phút
     */
    @Async
    public void pushUniqueAsync(Notification notif) {
        String key = (notif.getUserId() != null ? notif.getUserId() : notif.getRole()) + ":" + notif.getTitle();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        // 1. Memory Check (Atomic)
        if (sentLog.containsKey(key) && sentLog.get(key).isAfter(now.minusSeconds(30))) {
            return;
        }
        sentLog.put(key, now);

        try {
            // 2. DB Check (Fallback for scale/restart)
            java.time.LocalDateTime oneMinuteAgo = now.minusMinutes(1);
            var duplicates = notificationRepository.findDuplicateUnread(
                    notif.getUserId(),
                    notif.getRole(),
                    notif.getTitle(),
                    notif.getContent(),
                    oneMinuteAgo);

            if (duplicates.isEmpty()) {
                notificationRepository.save(notif);
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi Notification Unique bất đồng bộ: " + e.getMessage());
        } finally {
            // Cleanup old logs periodically (simple way for now)
            if (sentLog.size() > 1000) sentLog.clear();
        }
    }
}
