package com.gara.modules.service.repository;

import com.gara.entity.RepairOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface RepairOrderRepository extends JpaRepository<RepairOrder, Integer> {

        List<RepairOrder> findByTrangThaiIn(List<String> trangThaiList);

        // Optimized: Ordered multi-status query
        List<RepairOrder> findByTrangThaiInOrderByNgayTaoDesc(List<String> trangThaiList);

        long countByTrangThaiIn(List<String> statuses);

        List<RepairOrder> findByTrangThai(String trangThai);

        // Optimized: Use count instead of fetching list
        long countByTrangThai(String trangThai);

        // FIX: Eager load details for Export Logic to avoid N+1 or Lazy issues
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.chiTietDonHang i " +
                        "LEFT JOIN FETCH i.hangHoa h " +
                        "WHERE r.trangThai IN :statuses " +
                        "ORDER BY r.ngayTao DESC")
        List<RepairOrder> findWithDetailsByStatusIn(
                        @org.springframework.data.repository.query.Param("statuses") List<String> statuses);

        List<RepairOrder> findByTrangThaiOrderByNgayTaoDesc(String trangThai);

        // Optimized: Fetch items and products for history
        // Optimized: Fetch items and products for history
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.chiTietDonHang i " +
                        "LEFT JOIN FETCH i.hangHoa h " +
                        "WHERE r.phieuTiepNhan.xe.bienSo = :plate " +
                        "ORDER BY r.ngayTao DESC")
        List<RepairOrder> findTop5ByPhieuTiepNhan_Xe_BienSoOrderByNgayTaoDesc(
                        @org.springframework.data.repository.query.Param("plate") String plate,
                        org.springframework.data.domain.Pageable pageable);

        default List<RepairOrder> findTop5ByPhieuTiepNhan_Xe_BienSoOrderByNgayTaoDesc(String plate) {
                return findTop5ByPhieuTiepNhan_Xe_BienSoOrderByNgayTaoDesc(plate,
                                org.springframework.data.domain.PageRequest.of(0, 5));
        }

        // Optimized: Get top 5 recent orders. We don't JOIN FETCH xe here to avoid
        // conversion issues if JPA misbehaves.
        // We'll load related entities in the service layer as needed.
        @Query("SELECT r FROM RepairOrder r " +
                        "ORDER BY r.ngayTao DESC")
        List<RepairOrder> findTop5ByOrderByNgayTaoDesc(org.springframework.data.domain.Pageable pageable);

        default List<RepairOrder> findTop5ByOrderByNgayTaoDesc() {
                return findTop5ByOrderByNgayTaoDesc(org.springframework.data.domain.PageRequest.of(0, 5));
        }

        // Optimized: Eager fetch relations to avoid N+1 problem
        @Query("SELECT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.phieuTiepNhan ptn " +
                        "LEFT JOIN FETCH ptn.xe x " +
                        "LEFT JOIN FETCH x.khachHang kh " +
                        "WHERE r.trangThai IN ('CHO_SUA_CHUA', 'DANG_SUA', 'DA_DUYET', 'CHO_KH_DUYET') " +
                        "ORDER BY r.ngayTao DESC")
        List<RepairOrder> findJobsForMechanic();

        // Optimized: Eager fetch for payment display
        @Query("SELECT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.phieuTiepNhan ptn " +
                        "LEFT JOIN FETCH ptn.xe x " +
                        "LEFT JOIN FETCH x.khachHang kh " +
                        "WHERE r.trangThai = 'CHO_THANH_TOAN' " +
                        "ORDER BY r.ngayTao DESC")
        List<RepairOrder> findOrdersAwaitingPayment();

        java.util.Optional<RepairOrder> findByPhieuTiepNhanId(Integer receptionId);

        @Query("SELECT new com.gara.dto.DebtDTO(c.id, c.hoTen, c.soDienThoai, SUM(r.congNo), COUNT(r)) " +
                        "FROM RepairOrder r " +
                        "JOIN r.phieuTiepNhan.xe.khachHang c " +
                        "WHERE r.congNo > 0 " +
                        "GROUP BY c.id, c.hoTen, c.soDienThoai")
        List<com.gara.dto.DebtDTO> findCustomersWithDebt();

        // Get all orders for a customer with optimized fetching
        @Query("SELECT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.phieuTiepNhan ptn " +
                        "LEFT JOIN FETCH ptn.xe x " +
                        "WHERE x.khachHang.id = :customerId " +
                        "ORDER BY r.ngayTao DESC")
        List<RepairOrder> findByCustomerId(Integer customerId);

        // Optimized: Filter completed orders by date range (using NgayThanhToan or
        // NgayTao)
        // Optimized: Filter completed orders by date range with Eager Loading to
        // prevent N+1
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.chiTietDonHang i " +
                        "LEFT JOIN FETCH i.phanCongTho pct " +
                        "LEFT JOIN FETCH pct.tho " +
                        "WHERE (CASE WHEN r.ngayThanhToan IS NOT NULL THEN r.ngayThanhToan ELSE r.ngayTao END) " +
                        "BETWEEN :start AND :end " +
                        "AND r.trangThai IN ('HOAN_THANH', 'DONG')")
        List<RepairOrder> findCompletedOrdersBetween(
                        @org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
                        @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

        // Optimized: Get receptions for inspection with eager loading (avoid N+1)
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.phieuTiepNhan ptn " +
                        "LEFT JOIN FETCH ptn.xe x " +
                        "LEFT JOIN FETCH x.khachHang kh " +
                        "LEFT JOIN FETCH r.chiTietDonHang " +
                        "WHERE r.trangThai IN ('TIEP_NHAN', 'CHO_CHAN_DOAN') " +
                        "ORDER BY r.ngayTao DESC")
        List<RepairOrder> findOrdersForInspection();

        // Optimized: Get all orders with eager loading for Sale list (limit 100)
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.phieuTiepNhan ptn " +
                        "LEFT JOIN FETCH ptn.xe x " +
                        "LEFT JOIN FETCH x.khachHang kh " +
                        "ORDER BY r.ngayTao DESC")
        List<RepairOrder> findAllOrdersOptimized(org.springframework.data.domain.Pageable pageable);

        default List<RepairOrder> findAllOrdersOptimized() {
                return findAllOrdersOptimized(org.springframework.data.domain.PageRequest.of(0, 100));
        }

        // Optimized: Get orders that have passed inspection (History for Diagnostic
        // Mechanic)
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.phieuTiepNhan ptn " +
                        "LEFT JOIN FETCH ptn.xe x " +
                        "LEFT JOIN FETCH x.khachHang kh " +
                        "WHERE r.trangThai NOT IN ('TIEP_NHAN', 'CHO_CHAN_DOAN', 'HUY') " +
                        "ORDER BY r.ngayTao DESC")
        List<RepairOrder> findOrdersPostInspection(org.springframework.data.domain.Pageable pageable);

        default List<RepairOrder> findOrdersPostInspection() {
                return findOrdersPostInspection(org.springframework.data.domain.PageRequest.of(0, 50));
        }

        // Personalized History for Diagnostic Mechanic (Include Active QC Jobs)
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.phieuTiepNhan ptn " +
                        "LEFT JOIN FETCH ptn.xe x " +
                        "LEFT JOIN FETCH x.khachHang kh " +
                        "WHERE (r.trangThai NOT IN ('TIEP_NHAN', 'CHO_CHAN_DOAN', 'HUY') " +
                        "OR r.trangThai = 'CHO_KCS') " +
                        "AND r.thoChanDoan.id = :mechanicId " +
                        "ORDER BY r.ngayTao DESC")
        List<RepairOrder> findHistoryByDiagnosticMechanic(
                        @org.springframework.data.repository.query.Param("mechanicId") Integer mechanicId,
                        org.springframework.data.domain.Pageable pageable);

        // Personalized History for Repair Mechanic
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.phieuTiepNhan ptn " +
                        "LEFT JOIN FETCH ptn.xe x " +
                        "LEFT JOIN FETCH x.khachHang kh " +
                        "WHERE r.trangThai IN ('CHO_THANH_TOAN', 'HOAN_THANH', 'DONG') " +
                        "AND r.thoPhanCong.id = :mechanicId " +
                        "ORDER BY r.ngayTao DESC")
        List<RepairOrder> findRepairHistoryByMechanic(
                        @org.springframework.data.repository.query.Param("mechanicId") Integer mechanicId,
                        org.springframework.data.domain.Pageable pageable);

        List<RepairOrder> findByPhieuTiepNhan_Xe_BienSoAndTrangThaiIn(String plate, List<String> statuses);

        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "JOIN r.chiTietDonHang i " +
                        "JOIN i.hangHoa h " +
                        "WHERE r.trangThai IN ('HOAN_THANH', 'DONG') " +
                        "AND h.baoHanhSoThang > 0 " +
                        "AND FUNCTION('DATEADD', month, h.baoHanhSoThang, r.ngayTao) > CURRENT_TIMESTAMP")
        List<RepairOrder> findOrdersWithActiveWarranty();

        @Query(value = "SELECT COUNT(DISTINCT i.id) " +
                        "FROM don_hang_sua_chua r " +
                        "JOIN chi_tiet_don_hang i ON r.id = i.don_hang_sua_chua_id " +
                        "JOIN hang_hoa h ON i.hang_hoa_id = h.id " +
                        "JOIN phieu_tiep_nhan ptn ON r.phieu_tiep_nhan_id = ptn.id " +
                        "JOIN xe x ON ptn.xe_bien_so = x.bien_so " +
                        "WHERE x.bien_so = :plate " +
                        "AND r.trang_thai IN ('HOAN_THANH', 'DONG') " +
                        "AND h.bao_hanh_so_thang > 0 " +
                        "AND (r.ngay_tao + (h.bao_hanh_so_thang || ' month')::interval) > CURRENT_TIMESTAMP", nativeQuery = true)
        long countActiveWarrantiesByPlate(@org.springframework.data.repository.query.Param("plate") String plate);
}
