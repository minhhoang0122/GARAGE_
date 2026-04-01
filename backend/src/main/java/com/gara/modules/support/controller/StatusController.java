package com.gara.modules.support.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

/**
 * Controller phục vụ việc kiểm tra trạng thái hệ thống (Health Check).
 * Được sử dụng bởi các dịch vụ Ping (như UptimeRobot) để giữ Render không ngủ đông.
 */
@RestController
@RequestMapping("/api/status")
public class StatusController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "message", "Garage Management System is active");
    }
}
