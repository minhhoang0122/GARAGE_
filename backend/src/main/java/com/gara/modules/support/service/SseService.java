package com.gara.modules.support.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.scheduling.annotation.Scheduled;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseService {

    // Lưu trữ các emitter theo userId. 
    // Một user có thể mở nhiều tab, nhưng tạm thời ta hỗ trợ 1 emitter chính hoặc danh sách.
    private final Map<Integer, SseEmitter> emitters = new ConcurrentHashMap<>();

    @Scheduled(fixedRate = 30000)
    public void sendHeartbeat() {
        emitters.forEach((userId, emitter) -> {
            try {
                // Gửi comment rỗng để giữ kết nối (Heartbeat)
                emitter.send(SseEmitter.event().comment("ping"));
            } catch (IOException e) {
                emitters.remove(userId);
            }
        });
    }

    public SseEmitter subscribe(Integer userId) {
        SseEmitter emitter = new SseEmitter(24 * 60 * 60 * 1000L); // Timeout 24h

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError((e) -> emitters.remove(userId));

        emitters.put(userId, emitter);
        
        // Gửi event chào mừng để thiết lập kết nối
        try {
            emitter.send(SseEmitter.event().name("connected").data("SSE Connected for user " + userId));
        } catch (IOException e) {
            emitters.remove(userId);
        }
        
        return emitter;
    }

    public void send(Integer userId, String eventName, Object data) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (IOException e) {
                emitters.remove(userId);
            }
        }
    }

    /**
     * Gửi cho tất cả người dùng (vd: thông báo hệ thống)
     */
    public void broadcast(String eventName, Object data) {
        emitters.forEach((userId, emitter) -> {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (IOException e) {
                emitters.remove(userId);
            }
        });
    }
}
