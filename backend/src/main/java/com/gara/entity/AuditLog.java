package com.gara.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_logs_table_name", columnList = "table_name"),
    @Index(name = "idx_audit_logs_record_id", columnList = "record_id")
})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "table_name", length = 50, nullable = false)
    private String tableName;

    @Column(name = "record_id", nullable = false)
    private Integer recordId;

    @Column(name = "action", length = 20, nullable = false)
    private String action; // INSERT, UPDATE, DELETE

    @Column(name = "old_data", columnDefinition = "TEXT")
    private String oldData;

    @Column(name = "new_data", columnDefinition = "TEXT")
    private String newData;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Foreign Keys - allow direct ID insertion
    @Column(name = "user_id")
    private Integer userId;

    // Relations (read-only for display)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public AuditLog() {
    }

    public AuditLog(Integer id, String tableName, Integer recordId, String action, String oldData, String newData,
            String reason, LocalDateTime createdAt, Integer userId, User user) {
        this.id = id;
        this.tableName = tableName;
        this.recordId = recordId;
        this.action = action;
        this.oldData = oldData;
        this.newData = newData;
        this.reason = reason;
        this.createdAt = createdAt;
        this.userId = userId;
        this.user = user;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTableName() { return tableName; }
    public void setTableName(String tableName) { this.tableName = tableName; }

    public Integer getRecordId() { return recordId; }
    public void setRecordId(Integer recordId) { this.recordId = recordId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getOldData() { return oldData; }
    public void setOldData(String oldData) { this.oldData = oldData; }

    public String getNewData() { return newData; }
    public void setNewData(String newData) { this.newData = newData; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public static AuditLogBuilder builder() {
        return new AuditLogBuilder();
    }

    public static class AuditLogBuilder {
        private Integer id;
        private String tableName;
        private Integer recordId;
        private String action;
        private String oldData;
        private String newData;
        private String reason;
        private LocalDateTime createdAt;
        private Integer userId;
        private User user;

        AuditLogBuilder() {
        }

        public AuditLogBuilder id(Integer id) { this.id = id; return this; }
        public AuditLogBuilder tableName(String tableName) { this.tableName = tableName; return this; }
        public AuditLogBuilder recordId(Integer recordId) { this.recordId = recordId; return this; }
        public AuditLogBuilder action(String action) { this.action = action; return this; }
        public AuditLogBuilder oldData(String oldData) { this.oldData = oldData; return this; }
        public AuditLogBuilder newData(String newData) { this.newData = newData; return this; }
        public AuditLogBuilder reason(String reason) { this.reason = reason; return this; }
        public AuditLogBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public AuditLogBuilder userId(Integer userId) { this.userId = userId; return this; }
        public AuditLogBuilder user(User user) { this.user = user; return this; }

        public AuditLog build() {
            return new AuditLog(id, tableName, recordId, action, oldData, newData, reason, createdAt, userId, user);
        }
    }
}
