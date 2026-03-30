package com.gara.modules.inventory.repository;

import com.gara.entity.ImportNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImportNoteRepository extends JpaRepository<ImportNote, Integer> {
        long countByImportDateAfter(java.time.LocalDateTime date);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "importDetails", "importDetails.product",
                        "creator" })
        @org.springframework.data.jpa.repository.Query("SELECT n FROM ImportNote n WHERE n.id = :id")
        java.util.Optional<ImportNote> findByIdWithDetails(
                        @org.springframework.data.repository.query.Param("id") Integer id);

        java.util.List<ImportNote> findByStatus(String status);
}
