package com.gara.modules.support.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * HandshakeInterceptor để trích xuất token từ URL query parameters.
 * Vì SockJS đôi khi không gửi được Authorization header trong handshake,
 * ta dùng query param 'token' làm fallback.
 */
@Component
public class AuthHandshakeInterceptor implements HandshakeInterceptor {

    private static final Logger log = LoggerFactory.getLogger(AuthHandshakeInterceptor.class);

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                  WebSocketHandler wsHandler, Map<String, Object> attributes) {
        
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            String token = servletRequest.getServletRequest().getParameter("token");
            
            if (token != null && !token.isEmpty()) {
                log.debug("Found token in handshake query parameter");
                attributes.put("token", token);
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // No action needed after handshake
    }
}
