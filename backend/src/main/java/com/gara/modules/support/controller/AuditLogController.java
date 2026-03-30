package com.gara.modules.support.controller;

import com.gara.modules.system.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/audit-logs")
public class AuditLogController {

    private static final Logger log = LoggerFactory.getLogger(AuditLogController.class);
    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAuditLogs() {
        try {
            List<Map<String, Object>> logs = auditLogRepository.findAllWithUser().stream()
                    .limit(200) // Limit for performance
                    .map(log -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", log.getId());
                        m.put("table", log.getTableName() != null ? log.getTableName() : "");
                        m.put("recordId", log.getRecordId());
                        m.put("action", log.getAction() != null ? log.getAction() : "");
                        m.put("oldData", log.getOldData());
                        m.put("newData", log.getNewData());
                        m.put("reason", log.getReason());
                        m.put("timestamp", log.getCreatedAt());
                        m.put("user",
                                log.getUser() != null ? log.getUser().getFullName() : "System");
                        return m;
                    })
                    .toList();
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error loading audit logs", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Lỗi khi tải nhật ký: " + e.getMessage()));
        }
    }
}
