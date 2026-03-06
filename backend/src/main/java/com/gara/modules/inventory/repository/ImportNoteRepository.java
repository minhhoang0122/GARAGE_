package com.gara.modules.inventory.repository;

import com.gara.entity.ImportNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImportNoteRepository extends JpaRepository<ImportNote, Integer> {
        long countByNgayNhapAfter(java.time.LocalDateTime date);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "chiTietNhap", "chiTietNhap.hangHoa",
                        "nguoiNhap" })
        @org.springframework.data.jpa.repository.Query("SELECT n FROM ImportNote n WHERE n.id = :id")
        java.util.Optional<ImportNote> findByIdWithDetails(
                        @org.springframework.data.repository.query.Param("id") Integer id);

        java.util.List<ImportNote> findByTrangThai(String trangThai);
}
