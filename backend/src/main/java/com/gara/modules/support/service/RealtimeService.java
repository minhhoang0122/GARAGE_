package com.gara.modules.support.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Service quản lý Real-time Messaging dựa trên STOMP/WebSocket.
 * Đã loại bỏ SSE legacy để tối ưu hiệu năng.
 */
@Service
public class RealtimeService {
    private static final Logger log = LoggerFactory.getLogger(RealtimeService.class);
    
    private final SimpMessagingTemplate messagingTemplate;

    // Quản lý Online Status (STOMP)
    // Key: SessionId, Value: UserId
    private final Map<String, Integer> activeSessions = new ConcurrentHashMap<>();
    
    public RealtimeService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Gửi thông báo đến 1 user cụ thể qua STOMP.
     */
    public void send(Integer userId, String event, Object data) {
        try {
            messagingTemplate.convertAndSendToUser(
                userId.toString(), 
                "/queue/notifications", 
                Map.of("event", event, "data", data)
            );
            log.trace("Sent STOMP message to user {}: {}", userId, event);
        } catch (Exception e) {
            log.error("Failed to send STOMP message to user {}", userId, e);
        }
    }

    /**
     * Broadcast thông báo đến tất cả các topic qua STOMP.
     */
    public void broadcast(String event, Object data) {
        try {
            messagingTemplate.convertAndSend("/topic/global", Map.of("event", event, "data", data));
        } catch (Exception e) {
            log.error("Failed to broadcast STOMP message", e);
        }
    }

    /**
     * Broadcast thông báo đến 1 topic cụ thể.
     */
    public void broadcastToTopic(String topic, Object data) {
        broadcastToTopic(topic, "update", data);
    }

    public void broadcastToTopic(String topic, String event, Object data) {
        try {
            messagingTemplate.convertAndSend("/topic/" + topic, Map.of("event", event, "data", data));
        } catch (Exception e) {
            log.error("Failed to broadcast STOMP to topic {}", topic, e);
        }
    }

    // --- Presence Management for STOMP ---

    public void onSessionConnected(String sessionId, Integer userId) {
        activeSessions.put(sessionId, userId);
        log.info("User {} connected via STOMP (Session: {})", userId, sessionId);
        broadcastPresenceUpdate(userId, true);
    }

    public void onSessionDisconnected(String sessionId) {
        Integer userId = activeSessions.remove(sessionId);
        if (userId != null) {
            if (!activeSessions.containsValue(userId)) {
                log.info("User {} is now offline (All sessions closed)", userId);
                broadcastPresenceUpdate(userId, false);
            }
        }
    }

    private void broadcastPresenceUpdate(Integer userId, boolean isOnline) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", userId);
        payload.put("isOnline", isOnline);
        messagingTemplate.convertAndSend("/topic/presence", payload);
    }

    public Set<Integer> getOnlineUserIds() {
        return activeSessions.values().stream().collect(Collectors.toSet());
    }
}
