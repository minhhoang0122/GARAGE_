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
}
