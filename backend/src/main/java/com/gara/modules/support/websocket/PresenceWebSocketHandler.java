package com.gara.modules.support.websocket;

import com.gara.modules.identity.security.JwtUtil;
import com.gara.modules.support.service.SseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.gara.modules.identity.service.UserService;
import com.gara.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.TextMessage;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class PresenceWebSocketHandler extends TextWebSocketHandler {
    private static final Logger log = LoggerFactory.getLogger(PresenceWebSocketHandler.class);
    private final JwtUtil jwtUtil;
    private final SseService sseService;
    private final UserService userService;
    private final ObjectMapper objectMapper;

    // session ID -> userId
    private final Map<String, Integer> activeUsers = new ConcurrentHashMap<>();

    public PresenceWebSocketHandler(JwtUtil jwtUtil, SseService sseService, UserService userService, ObjectMapper objectMapper) {
        this.jwtUtil = jwtUtil;
        this.sseService = sseService;
        this.userService = userService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String query = session.getUri().getQuery();
        String token = extractToken(query);

        if (token != null && jwtUtil.isTokenValid(token)) {
            Integer userId = jwtUtil.extractUserId(token);
            activeUsers.put(session.getId(), userId);
            
            log.info("WebSocket User Connected: {} (Session: {})", userId, session.getId());
            
            // 1. Gửi trạng thái hiện tại ngay lập tức cho người mới kết nối (Rich Metadata)
            sendInitialStatus(session);

            // 2. Thông báo cho toàn bộ hệ thống qua SSE (Rich Metadata)
            Map<String, Object> meta = mapUserToMetadata(userId);
            sseService.broadcast("user_presence", Map.of(
                "userId", userId, 
                "status", "online",
                "meta", meta
            ));
        } else {
            log.warn("WebSocket Connection Rejected: Invalid Token");
            session.close(CloseStatus.NOT_ACCEPTABLE);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Integer userId = activeUsers.remove(session.getId());
        if (userId != null) {
            log.info("WebSocket User Disconnected: {} (Session: {})", userId, session.getId());
            
            // Nếu đây là session cuối cùng của user này
            if (!activeUsers.containsValue(userId)) {
                sseService.broadcast("user_presence", Map.of("userId", userId, "status", "offline"));
            }
        }
    }

    private String extractToken(String query) {
        if (query == null) return null;
        for (String param : query.split("&")) {
            String[] pair = param.split("=");
            if (pair.length == 2 && "token".equals(pair[0])) {
                return pair[1];
            }
        }
        return null;
    }
    
    private void sendInitialStatus(WebSocketSession session) {
        try {
            // Lấy toàn bộ nhân sự (Directory)
            List<User> allStaffRaw = userService.getStaffOnly();
            Set<Integer> onlineIds = getOnlineUserIds();

            List<Map<String, Object>> staffDirectory = allStaffRaw.stream()
                    .map(u -> {
                        Map<String, Object> meta = mapUserToMetadata(u.getId());
                        meta.put("isOnline", onlineIds.contains(u.getId()));
                        return meta;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "directory_sync");
            payload.put("staff", staffDirectory);

            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
        } catch (Exception e) {
            log.error("Failed to send initial directory sync", e);
        }
    }

    private Map<String, Object> mapUserToMetadata(Integer userId) {
        try {
            User user = userService.getUserById(userId);
            Map<String, Object> meta = new HashMap<>();
            meta.put("id", user.getId());
            meta.put("name", user.getFullName());
            meta.put("avatar", user.getAvatar());
            meta.put("vaiTro", user.getRoles().isEmpty() ? "N/A" : user.getRoles().iterator().next().getName());
            return meta;
        } catch (Exception e) {
            return Map.of("id", userId, "hoTen", "Unknown", "vaiTro", "N/A");
        }
    }

    public boolean isUserOnline(Integer userId) {
        return activeUsers.containsValue(userId);
    }

    public Set<Integer> getOnlineUserIds() {
        return new HashSet<>(activeUsers.values());
    }
}
