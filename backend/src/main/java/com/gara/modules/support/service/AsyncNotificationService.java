package com.gara.modules.support.service;

import com.gara.entity.Notification;
import com.gara.modules.notification.repository.NotificationRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AsyncNotificationService {

    private final NotificationRepository notificationRepository;

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
            // Trong tương lai nếu có WebSocket (Socket.io) thì gọi ở dưới dòng này
            // websocketService.sendToUser(notif.getNguoiNhanId(), notif);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi Notification bất đồng bộ: " + e.getMessage());
        }
    }
}
