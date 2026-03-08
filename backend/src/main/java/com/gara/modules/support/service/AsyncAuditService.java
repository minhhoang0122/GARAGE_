package com.gara.modules.support.service;

import com.gara.entity.AuditLog;
import com.gara.modules.system.repository.AuditLogRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AsyncAuditService {

    private final AuditLogRepository auditLogRepository;

    public AsyncAuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Ghi nhật ký hệ thống bất đồng bộ (không làm chậm tốc độ xử lý của mạch chính
     * API)
     */
    @Async
    public void logAsync(AuditLog log) {
        try {
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Chỉ log ra console, tuyệt đối không quăng exception làm sập API chính
            System.err.println("Lỗi khi ghi AuditLog bất đồng bộ: " + e.getMessage());
        }
    }
}
