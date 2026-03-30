package com.gara.modules.inventory.repository;

import com.gara.entity.ExportNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ExportNoteRepository extends JpaRepository<ExportNote, Integer> {
    long countByExportDateAfter(LocalDateTime date);

    Optional<ExportNote> findTopByRepairOrderIdOrderByExportDateDesc(Integer orderId);

    // N+1 FIX: Eager load details for export history
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT e FROM ExportNote e " +
            "LEFT JOIN FETCH e.exportDetails d " +
            "LEFT JOIN FETCH d.product " +
            "LEFT JOIN FETCH e.repairOrder r " +
            "LEFT JOIN FETCH r.reception rpt " +
            "LEFT JOIN FETCH rpt.vehicle v " +
            "LEFT JOIN FETCH e.creator " +
            "ORDER BY e.exportDate DESC")
    java.util.List<ExportNote> findAllWithDetails();
}
