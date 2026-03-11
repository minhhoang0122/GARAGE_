package com.gara.modules.support.service;

import com.gara.modules.identity.service.UserService;
import com.gara.entity.SystemConfig;
import com.gara.modules.system.repository.SystemConfigRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SystemConfigService {
    private final com.gara.modules.support.service.AsyncAuditService asyncAuditService;
    private final UserService userService;
    private final SystemConfigRepository systemConfigRepository;

    public SystemConfigService(com.gara.modules.support.service.AsyncAuditService asyncAuditService,
            UserService userService,
            SystemConfigRepository systemConfigRepository) {
        this.asyncAuditService = asyncAuditService;
        this.userService = userService;
        this.systemConfigRepository = systemConfigRepository;
    }

    @Cacheable("systemConfig")
    public Map<String, String> getAllConfigs() {
        return systemConfigRepository.findAll().stream()
                .collect(Collectors.toMap(SystemConfig::getConfigKey, SystemConfig::getConfigValue));
    }

    @CacheEvict(value = "systemConfig", allEntries = true)
    @PreAuthorize("hasRole('ADMIN')")
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

        // Async Audit Log
        if (changes.length() > 0) {
            try {
                com.gara.entity.User currentUser = userService.getCurrentUser();
                asyncAuditService.logAsync(com.gara.entity.AuditLog.builder()
                        .bang("SYSTEM_CONFIG")
                        .banGhiId(0)
                        .hanhDong("UPDATE")
                        .nguoiThucHienId(currentUser.getId())
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
    @Cacheable(value = "systemConfig", key = "#key")
    public String getConfig(String key, String defaultValue) {
        return systemConfigRepository.findById(key)
                .map(SystemConfig::getConfigValue)
                .orElse(defaultValue);
    }
}
