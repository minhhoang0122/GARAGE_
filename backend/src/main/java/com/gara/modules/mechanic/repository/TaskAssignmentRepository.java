package com.gara.modules.mechanic.repository;

import com.gara.entity.TaskAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Integer> {
    List<TaskAssignment> findByChiTietDonHangId(Integer orderItemId);

    List<TaskAssignment> findByChiTietDonHangIdIn(java.util.Collection<Integer> orderItemIds);

    // Optimized: Calculate Mechanic Performance in DB
    @org.springframework.data.jpa.repository.Query("SELECT new map(t.tho.id as mechanicId, t.tho.hoTen as mechanicName, COUNT(t) as taskCount, SUM(i.thanhTien * t.phanTramCong / 100) as revenue) "
            +
            "FROM TaskAssignment t " +
            "JOIN t.chiTietDonHang i " +
            "JOIN i.donHangSuaChua r " +
            "WHERE r.trangThai IN ('HOAN_THANH', 'DONG') " +
            "AND (CASE WHEN r.ngayThanhToan IS NOT NULL THEN r.ngayThanhToan ELSE r.ngayTao END) BETWEEN :start AND :end "
            +
            "GROUP BY t.tho.id, t.tho.hoTen " +
            "ORDER BY SUM(i.thanhTien * t.phanTramCong / 100) DESC")
    List<java.util.Map<String, Object>> getMechanicPerformanceStats(
            @org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
            @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);
}
