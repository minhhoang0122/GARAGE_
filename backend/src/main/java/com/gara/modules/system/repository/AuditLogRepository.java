package com.gara.modules.system.repository;

import com.gara.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {
    List<AuditLog> findByTableNameAndRecordId(String tableName, Integer recordId);

    List<AuditLog> findAllByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.user ORDER BY a.createdAt DESC")
    List<AuditLog> findAllWithUser();

    // Optimized: Find Return logs by Product ID content match
    @org.springframework.data.jpa.repository.Query("SELECT a FROM AuditLog a WHERE a.tableName = 'Warehouse' AND a.action = 'RETURN' AND a.newData LIKE %:pattern%")
    List<AuditLog> findReturnLogsByProduct(@org.springframework.data.repository.query.Param("pattern") String pattern);
}
