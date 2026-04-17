package com.gara.modules.support.websocket;

import com.gara.modules.identity.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Interceptor để xử lý xác thực JWT cho các kết nối STOMP.
 * Nó trích xuất Token từ header 'Authorization' hoặc query parameter 'token' trong frame CONNECT.
 */
@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(WebSocketAuthInterceptor.class);
    private final JwtUtil jwtUtil;

    public WebSocketAuthInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = null;
            String source = "NONE";

            // 1. Tìm token trong Header 'Authorization' (Bearer ...)
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                source = "Authorization Header";
            }

            // 2. Nếu không có ở header, tìm trong session attributes (handshake param)
            if (token == null && accessor.getSessionAttributes() != null) {
                token = (String) accessor.getSessionAttributes().get("token");
                if (token != null) {
                    source = "Handshake Parameter (token)";
                }
            }

            // 3. Fallback: Native header 'token'
            if (token == null) {
                token = accessor.getFirstNativeHeader("token");
                if (token != null) {
                    source = "Native Header (token)";
                }
            }
            
            if (token != null) {
                if (jwtUtil.isTokenValid(token)) {
                    if (!jwtUtil.isTokenExpired(token)) {
                        Integer userId = jwtUtil.extractUserId(token);
                        if (userId != null) {
                            log.info("WebSocket Authenticated: User {} via {}", userId, source);
                            
                            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                    userId.toString(),
                                    null,
                                    List.of()
                            );
                            accessor.setUser(auth);
                        }
                    } else {
                        log.warn("WebSocket Auth Failed: Token EXPIRED from {}", source);
                    }
                } else {
                    log.warn("WebSocket Auth Failed: Token INVALID from {}", source);
                }
            } else {
                log.warn("WebSocket Connection Attempt: NO TOKEN found");
            }
        }

        return message;
    }
}
