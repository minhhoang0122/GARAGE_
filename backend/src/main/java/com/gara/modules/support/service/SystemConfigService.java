package com.gara.modules.support.service;

import com.gara.modules.identity.service.UserService;
import com.gara.entity.SystemConfig;
import com.gara.modules.system.repository.SystemConfigRepository;
import com.gara.modules.system.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SystemConfigService {
    private final AuditLogRepository auditLogRepository;
    private final UserService userService;
    private final SystemConfigRepository systemConfigRepository;

    public SystemConfigService(AuditLogRepository auditLogRepository,
            UserService userService,
            SystemConfigRepository systemConfigRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userService = userService;
        this.systemConfigRepository = systemConfigRepository;
    }

    public Map<String, String> getAllConfigs() {
        return systemConfigRepository.findAll().stream()
                .collect(Collectors.toMap(SystemConfig::getConfigKey, SystemConfig::getConfigValue));
    }

    public void updateConfigs(Map<String, String> configs) {
        StringBuilder changes = new StringBuilder();

        List<SystemConfig> entities = configs.entrySet().stream()
                .map(entry -> {
                    SystemConfig config = systemConfigRepository.findById(entry.getKey())
                            .orElse(new SystemConfig(entry.getKey(), "", ""));

                    if (!config.getConfigValue().equals(entry.getValue())) {
                        changes.append(entry.getKey()).append(": ").append(config.getConfigValue()).append(" -> ")
                                .append(entry.getValue()).append("\n");
                    }

                    config.setConfigValue(entry.getValue());
                    return config;
                })
                .toList();
        systemConfigRepository.saveAll(entities);

        // Audit Log
        if (changes.length() > 0) {
            try {
                com.gara.entity.User currentUser = userService.getCurrentUser();
                auditLogRepository.save(com.gara.entity.AuditLog.builder()
                        .bang("SYSTEM_CONFIG")
                        .banGhiId(0)
                        .hanhDong("UPDATE")
                        .nguoiThucHien(currentUser)
                        .duLieuMoi(changes.toString())
                        .lyDo("Cập nhật cấu hình hệ thống")
                        .ngayTao(java.time.LocalDateTime.now())
                        .build());
            } catch (Exception e) {
                // Ignore audit error to not block config update
                System.err.println("Failed to save audit log: " + e.getMessage());
            }
        }
    }

    // Helper to get specific config
    public String getConfig(String key, String defaultValue) {
        return systemConfigRepository.findById(key)
                .map(SystemConfig::getConfigValue)
                .orElse(defaultValue);
    }
}
