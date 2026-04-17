package com.gara.modules.support.websocket;

import com.gara.entity.User;
import com.gara.modules.identity.service.UserService;
import com.gara.modules.support.service.RealtimeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Listener lắng nghe các sự kiện kết nối/ngắt kết nối của STOMP.
 * Giúp cập nhật trạng thái Online/Offline của người dùng một cách tự động.
 */
@Component
public class PresenceEventListener {

    private static final Logger log = LoggerFactory.getLogger(PresenceEventListener.class);
    private final RealtimeService realtimeService;
    private final UserService userService;

    public PresenceEventListener(RealtimeService realtimeService, UserService userService) {
        this.realtimeService = realtimeService;
        this.userService = userService;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        
        if (principal != null) {
            String sessionId = headerAccessor.getSessionId();
            try {
                Integer userId = Integer.parseInt(principal.getName());
                log.debug("STOMP Connected: User {} with Session {}", userId, sessionId);
                realtimeService.onSessionConnected(sessionId, userId);
            } catch (NumberFormatException e) {
                log.warn("STOMP Connected with non-integer principal: {}", principal.getName());
            }
        }
    }

    @EventListener
    public void handleWebSocketSubscribeListener(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = headerAccessor.getDestination();
        Principal principal = headerAccessor.getUser();

        // Nới lỏng kiểm tra destination để tương thích với các broker khác nhau
        if (principal != null && destination != null && 
            (destination.contains("/queue/notifications") || destination.contains("/topic/presence"))) {
            try {
                Integer userId = Integer.parseInt(principal.getName());
                log.info("User {} subscribed to {}, triggering initial directory sync", userId, destination);
                sendInitialStatus(userId);
            } catch (NumberFormatException e) {
                log.warn("STOMP Subscribe with non-integer principal: {}", principal.getName());
            }
        }
    }

    private void sendInitialStatus(Integer userId) {
        try {
            // Đợi 300ms để đảm bảo RealtimeService đã cập nhật xong activeSessions từ SessionConnectedEvent
            // VÀ Spring Messaging đã sẵn sàng định tuyến tin nhắn 'user specific'
            Thread.sleep(300); 
            
            List<User> allStaffRaw = userService.getStaffOnly();
            Set<Integer> onlineIds = realtimeService.getOnlineUserIds();
            
            log.debug("Syncing directory for user {}. Online IDs: {}", userId, onlineIds);

            List<Map<String, Object>> staffDirectory = allStaffRaw.stream()
                    .map(u -> {
                        Map<String, Object> meta = mapUserToMetadata(u);
                        meta.put("isOnline", onlineIds.contains(u.getId()));
                        return meta;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> dataPayload = new HashMap<>();
            dataPayload.put("staff", staffDirectory);
            
            // Sử dụng RealtimeService để đảm bảo đúng format {event, data}
            realtimeService.send(userId, "directory_sync", dataPayload);
            log.info("Successfully sent directory_sync to user {} with {} staff members", userId, staffDirectory.size());
        } catch (Exception e) {
            log.error("Failed to send initial directory sync to user {}", userId, e);
        }
    }

    private Map<String, Object> mapUserToMetadata(User user) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("id", user.getId());
        meta.put("name", user.getFullName());
        meta.put("avatar", user.getAvatar());
        meta.put("vaiTro", user.getRoles().isEmpty() ? "N/A" : user.getRoles().iterator().next().getName());
        return meta;
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        log.debug("STOMP Disconnected: Session {}", sessionId);
        realtimeService.onSessionDisconnected(sessionId);
    }
}
