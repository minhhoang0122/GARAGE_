package com.gara.modules.reception.repository;

import com.gara.entity.Reception;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
// Added for the new projection

public interface ReceptionRepository extends JpaRepository<Reception, Integer> {

        // Optimized: Eager fetch to avoid N+1 in SaleService.getStats()
        @org.springframework.data.jpa.repository.Query("SELECT r FROM Reception r " +
                        "LEFT JOIN FETCH r.xe x " +
                        "LEFT JOIN FETCH x.khachHang kh " +
                        "WHERE r.donHangSuaChua IS NULL AND r.ngayGio > :date " +
                        "ORDER BY r.ngayGio DESC")
        List<Reception> findByDonHangSuaChuaIsNullAndNgayGioAfterOrderByNgayGioDesc(
                        @org.springframework.data.repository.query.Param("date") LocalDateTime date);

        long countByDonHangSuaChuaIsNullAndNgayGioAfter(LocalDateTime date);

        List<Reception> findByXeBienSoOrderByNgayGioDesc(String bienSo);

        @org.springframework.data.jpa.repository.Query("SELECT " +
                        "r.id, r.ngayGio, x.bienSo, kh.hoTen, kh.soDienThoai, x.nhanHieu, x.model, o.id, o.trangThai, r.hinhAnh "
                        +
                        "FROM Reception r " +
                        "JOIN r.xe x " +
                        "JOIN x.khachHang kh " +
                        "LEFT JOIN r.donHangSuaChua o " +
                        "ORDER BY r.ngayGio DESC")
        List<Object[]> findAllReceptionsRaw(org.springframework.data.domain.Pageable pageable);

        @org.springframework.data.jpa.repository.Query("SELECT r FROM Reception r " +
                        "LEFT JOIN FETCH r.xe x " +
                        "LEFT JOIN FETCH x.khachHang kh " +
                        "LEFT JOIN FETCH r.donHangSuaChua o " +
                        "WHERE r.id = :id")
        java.util.Optional<Reception> findByIdWithDetails(
                        @org.springframework.data.repository.query.Param("id") Integer id);

        @org.springframework.data.jpa.repository.Query("SELECT r FROM Reception r " +
                        "LEFT JOIN FETCH r.xe x " +
                        "LEFT JOIN FETCH x.khachHang kh " +
                        "LEFT JOIN FETCH r.donHangSuaChua o " +
                        "WHERE r.yeuCauSoBo LIKE '%ĐẶT LỊCH ONLINE%' " +
                        "ORDER BY r.ngayGio DESC")
        List<Reception> findAllBookings();
}
