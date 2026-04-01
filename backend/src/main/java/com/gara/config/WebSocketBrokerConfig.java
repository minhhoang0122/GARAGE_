package com.gara.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Cấu hình STOMP Message Broker cho hệ thống Real-time.
 * Sử dụng SockJS để cung cấp khả năng Fallback (tự động chuyển sang HTTP Long Polling)
 * giúp duy trì kết nối ổn định trên các môi trường Proxy như Render/Vercel.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketBrokerConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Kích hoạt Simple Broker để xử lý các tin nhắn Pub/Sub
        // /topic: Dành cho broadcast (mọi người cùng nhận)
        // /queue: Dành cho tin nhắn cá nhân (chỉ 1 người nhận)
        // /user: Prefix đặc biệt của Spring để gửi tin nhắn 1-1
        config.enableSimpleBroker("/topic", "/queue", "/user");

        // Prefix cho các tin nhắn từ Client gửi lên Server (@MessageMapping)
        config.setApplicationDestinationPrefixes("/app");

        // Prefix dành cho việc gửi tin nhắn riêng cho từng User
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Đăng ký endpoint kết nối chính
        registry.addEndpoint("/api/garage-ws")
                .setAllowedOriginPatterns("*") // Cho phép Cross-Origin (CORS)
                .withSockJS(); // Kích hoạt SockJS Fallback
    }
}
