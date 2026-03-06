package com.gara.modules.support.controller;

import com.gara.modules.support.service.SystemConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class SystemConfigController {
    private final SystemConfigService systemConfigService;

    public SystemConfigController(SystemConfigService systemConfigService) {
        this.systemConfigService = systemConfigService;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> getAllConfigs() {
        return ResponseEntity.ok(systemConfigService.getAllConfigs());
    }

    @PostMapping
    public ResponseEntity<?> updateConfigs(@RequestBody Map<String, String> configs) {
        systemConfigService.updateConfigs(configs);
        return ResponseEntity.ok(Map.of("message", "Cập nhật cấu hình thành công"));
    }
}
