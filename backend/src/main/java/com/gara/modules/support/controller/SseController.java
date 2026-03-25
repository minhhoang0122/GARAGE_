package com.gara.modules.support.controller;

import com.gara.modules.support.service.SseService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

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
}
