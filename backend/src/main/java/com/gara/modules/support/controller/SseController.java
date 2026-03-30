package com.gara.modules.support.controller;

import com.gara.modules.support.service.SseService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/sse")
public class SseController {

    private final SseService sseService;

    public SseController(SseService sseService) {
        this.sseService = sseService;
    }

    /**
     * Endpoint để client (browser) kết nối SSE.
     * Xác thực được thực hiện qua JwtAuthFilter bằng parameter 'token' trong URL.
     */
    @GetMapping("/stream")
    public SseEmitter stream(@AuthenticationPrincipal Object principal) {
        if (!(principal instanceof Integer)) {
            throw new RuntimeException("Unauthorized for SSE connection");
        }
        
        Integer userId = (Integer) principal;
        return sseService.subscribe(userId);
    }

    @PostMapping("/subscribe/{topic}")
    public ResponseEntity<?> subscribeToTopic(@AuthenticationPrincipal Object principal, @PathVariable String topic) {
        if (!(principal instanceof Integer)) return ResponseEntity.status(401).build();
        sseService.subscribeToTopic((Integer) principal, topic);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unsubscribe/{topic}")
    public ResponseEntity<?> unsubscribeFromTopic(@AuthenticationPrincipal Object principal, @PathVariable String topic) {
        if (!(principal instanceof Integer)) return ResponseEntity.status(401).build();
        sseService.unsubscribeFromTopic((Integer) principal, topic);
        return ResponseEntity.ok().build();
    }
}
