package com.gara.modules.support.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.scheduling.annotation.Scheduled;
import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicLong;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SseService {
    private static final Logger log = LoggerFactory.getLogger(SseService.class);
    
    // emitters: userId -> SseEmitter
    private final Map<Integer, SseEmitter> emitters = new ConcurrentHashMap<>();
    
    // topicSubscriptions: topicName -> Set of userIds
    private final Map<String, Set<Integer>> topicSubscriptions = new ConcurrentHashMap<>();
    
    // Basic Event ID for Last-Event-ID support (Stateless for now, but provides increments)
    private final AtomicLong eventIdCounter = new AtomicLong(0);

    @Scheduled(fixedRate = 30000)
    public void sendHeartbeat() {
        emitters.forEach((userId, emitter) -> {
            try {
                emitter.send(SseEmitter.event().comment("ping"));
            } catch (Exception e) {
                // Heartbeat fails often when client is gone, cleanup silently
                cleanupUser(userId);
            }
        });
    }

    public SseEmitter subscribe(Integer userId) {
        // Timeout 24h. In production, this should be tuned based on ingress/proxy settings.
        SseEmitter emitter = new SseEmitter(24 * 60 * 60 * 1000L); 

        emitter.onCompletion(() -> cleanupUser(userId));
        emitter.onTimeout(() -> cleanupUser(userId));
        emitter.onError((e) -> cleanupUser(userId));

        emitters.put(userId, emitter);
        
        try {
            emitter.send(SseEmitter.event()
                .name("connected")
                .id(String.valueOf(eventIdCounter.incrementAndGet()))
                .data("SSE Connected for user " + userId));
        } catch (IOException e) {
            cleanupUser(userId);
        }
        
        return emitter;
    }

    public synchronized void subscribeToTopic(Integer userId, String topic) {
        topicSubscriptions.computeIfAbsent(topic, k -> new CopyOnWriteArraySet<>()).add(userId);
        log.debug("User {} subscribed to topic: {}", userId, topic);
    }

    public synchronized void unsubscribeFromTopic(Integer userId, String topic) {
        Set<Integer> subs = topicSubscriptions.get(topic);
        if (subs != null) {
            subs.remove(userId);
            if (subs.isEmpty()) {
                topicSubscriptions.remove(topic);
            }
        }
    }

    private void cleanupUser(Integer userId) {
        if (emitters.containsKey(userId)) {
            emitters.remove(userId);
            // Remove from all topics
            topicSubscriptions.values().forEach(set -> set.remove(userId));
            log.debug("Cleanup SSE connection for user: {}", userId);
        }
    }

    public void send(Integer userId, String eventName, Object data) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                    .name(eventName)
                    .id(String.valueOf(eventIdCounter.incrementAndGet()))
                    .data(data));
            } catch (IOException e) {
                // Connection aborted/broken pipe - expected
                cleanupUser(userId);
            } catch (Exception e) {
                log.error("Error sending SSE to user {}: {}", userId, e.getMessage());
                cleanupUser(userId);
            }
        }
    }

    /**
     * Gửi cho đúng những người đang quan tâm đến Topic này
     */
    public void broadcastToTopic(String topic, String eventName, Object data) {
        Set<Integer> userIds = topicSubscriptions.get(topic);
        if (userIds == null || userIds.isEmpty()) return;

        String id = String.valueOf(eventIdCounter.incrementAndGet());
        userIds.forEach(userId -> {
            SseEmitter emitter = emitters.get(userId);
            if (emitter != null) {
                try {
                    emitter.send(SseEmitter.event()
                        .name(eventName)
                        .id(id)
                        .data(data));
                } catch (Exception e) {
                    cleanupUser(userId);
                }
            }
        });
    }

    /**
     * Gửi cho tất cả người dùng (vd: thông báo hệ thống)
     */
    public void broadcast(String eventName, Object data) {
        String id = String.valueOf(eventIdCounter.incrementAndGet());
        emitters.forEach((userId, emitter) -> {
            try {
                emitter.send(SseEmitter.event()
                    .name(eventName)
                    .id(id)
                    .data(data));
            } catch (Exception e) {
                cleanupUser(userId);
            }
        });
    }
}
