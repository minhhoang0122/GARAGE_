package com.gara.modules.support.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Service quản lý Real-time Messaging (bao gồm SSE legacy và STOMP mới).
 */
@Service
public class SseService {
    private static final Logger log = LoggerFactory.getLogger(SseService.class);
    
    private final SimpMessagingTemplate messagingTemplate;
    
    // Quản lý SSE Emitters (Legacy)
    private final Map<Integer, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();
    private final AtomicLong counter = new AtomicLong(0);

    // Quản lý Online Status (STOMP)
    // Key: SessionId, Value: UserId
    private final Map<String, Integer> activeSessions = new ConcurrentHashMap<>();
    
    public SseService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Phương thức subscribe dành cho legacy SSE.
     */
    public SseEmitter subscribe(Integer userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        
        this.emitters.computeIfAbsent(userId, k -> new CopyOnWriteArraySet<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError((e) -> removeEmitter(userId, emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("init")
                    .data(Map.of("message", "Connected to Garage Realtime (SSE Legacy)")));
        } catch (IOException e) {
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    private void removeEmitter(Integer userId, SseEmitter emitter) {
        Set<SseEmitter> userEmitters = this.emitters.get(userId);
        if (userEmitters != null) {
            userEmitters.remove(emitter);
            if (userEmitters.isEmpty()) {
                this.emitters.remove(userId);
            }
        }
    }

    /**
     * Gửi thông báo đến 1 user cụ thể (Hỗ trợ cả SSE và STOMP).
     */
    public void send(Integer userId, String event, Object data) {
        // 1. Gửi qua STOMP (Khuyên dùng)
        try {
            messagingTemplate.convertAndSendToUser(
                userId.toString(), 
                "/queue/notifications", 
                Map.of("event", event, "data", data)
            );
        } catch (Exception e) {
            log.error("Failed to send STOMP message to user {}", userId, e);
        }

        // 2. Gửi qua SSE (Legacy - fallback)
        Set<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters != null) {
            userEmitters.forEach(emitter -> {
                try {
                    emitter.send(SseEmitter.event()
                            .id(String.valueOf(counter.incrementAndGet()))
                            .name(event)
                            .data(data));
                } catch (IOException e) {
                    removeEmitter(userId, emitter);
                }
            });
        }
    }

    /**
     * Broadcast thông báo đến tất cả các topic (Hỗ trợ cả SSE và STOMP).
     */
    public void broadcast(String event, Object data) {
        // 1. Gửi qua STOMP Topic chung
        try {
            messagingTemplate.convertAndSend("/topic/global", Map.of("event", event, "data", data));
        } catch (Exception e) {
            log.error("Failed to broadcast STOMP message", e);
        }

        // 2. Gửi qua SSE cho tất cả user (Legacy)
        emitters.forEach((userId, userEmitters) -> {
            userEmitters.forEach(emitter -> {
                try {
                    emitter.send(SseEmitter.event()
                            .id(String.valueOf(counter.incrementAndGet()))
                            .name(event)
                            .data(data));
                } catch (IOException e) {
                    removeEmitter(userId, emitter);
                }
            });
        });
    }

    /**
     * Bridge method: Broadcast thông báo đến 1 topic cụ thể.
     * Tương tự như broadcast chung nhưng gửi qua topic động.
     */
    public void broadcastToTopic(String topic, Object data) {
        broadcastToTopic(topic, "update", data);
    }

    public void broadcastToTopic(String topic, String event, Object data) {
        // 1. Gửi qua STOMP Topic động
        try {
            messagingTemplate.convertAndSend("/topic/" + topic, Map.of("event", event, "data", data));
        } catch (Exception e) {
            log.error("Failed to broadcast STOMP to topic {}", topic, e);
        }

        // 2. Với SSE (Legacy), chúng ta không có khái niệm topic cho User cụ thể nên sẽ broadcast cho tất cả emitter 
        // có lắng nghe event tương ứng (mặc dù SSE legacy trong hệ thống này không lọc theo topic phía Server).
        // Phía Client SSE sẽ lọc event theo string name.
        broadcast(event, data);
    }

    /**
     * Bridge method: Legacy subscribe to topic (No-op in STOMP as client handles it).
     */
    public void subscribeToTopic(Integer userId, String topic) {
        log.debug("User {} requested legacy subscribe to topic {}.", userId, topic);
    }

    /**
     * Bridge method: Legacy unsubscribe from topic (No-op in STOMP).
     */
    public void unsubscribeFromTopic(Integer userId, String topic) {
        log.debug("User {} requested legacy unsubscribe from topic {}.", userId, topic);
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

    /**
     * Heartbeat để giữ kết nối SSE (Legacy) không bị timeout bởi Proxy.
     */
    @Scheduled(fixedDelay = 30000)
    public void heartbeat() {
        emitters.values().forEach(userEmitters -> {
            userEmitters.forEach(emitter -> {
                try {
                    emitter.send(SseEmitter.event().name("ping").data("heartbeat"));
                } catch (IOException e) {
                    // Cleaner by callback
                }
            });
        });
    }
}
