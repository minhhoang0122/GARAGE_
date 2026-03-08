package com.gara.modules.inventory.repository;

import com.gara.entity.ExportNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ExportNoteRepository extends JpaRepository<ExportNote, Integer> {
    long countByNgayXuatAfter(LocalDateTime date);

    Optional<ExportNote> findTopByDonHangSuaChuaIdOrderByNgayXuatDesc(Integer orderId);

    // N+1 FIX: Eager load details for export history
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT e FROM ExportNote e " +
            "LEFT JOIN FETCH e.chiTietXuatKho d " +
            "LEFT JOIN FETCH d.hangHoa " +
            "LEFT JOIN FETCH e.donHangSuaChua r " +
            "LEFT JOIN FETCH r.phieuTiepNhan ptn " +
            "LEFT JOIN FETCH ptn.xe " +
            "LEFT JOIN FETCH e.nguoiTao " +
            "ORDER BY e.ngayXuat DESC")
    java.util.List<ExportNote> findAllWithDetails();
}
