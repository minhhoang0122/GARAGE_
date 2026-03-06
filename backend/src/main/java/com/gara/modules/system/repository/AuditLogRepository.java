package com.gara.modules.system.repository;

import com.gara.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {
    List<AuditLog> findByBangAndBanGhiId(String bang, Integer banGhiId);

    List<AuditLog> findAllByOrderByNgayTaoDesc();

    @org.springframework.data.jpa.repository.Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.nguoiThucHien ORDER BY a.ngayTao DESC")
    List<AuditLog> findAllWithUser();

    // Optimized: Find Return logs by Product ID content match
    @org.springframework.data.jpa.repository.Query("SELECT a FROM AuditLog a WHERE a.bang = 'Warehouse' AND a.hanhDong = 'RETURN' AND a.duLieuMoi LIKE %:pattern%")
    List<AuditLog> findReturnLogsByProduct(@org.springframework.data.repository.query.Param("pattern") String pattern);
}
