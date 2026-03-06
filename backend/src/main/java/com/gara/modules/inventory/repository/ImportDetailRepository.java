package com.gara.modules.inventory.repository;

import com.gara.entity.ImportDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportDetailRepository extends JpaRepository<ImportDetail, Integer> {

    // Find batches with remaining quantity > 0, sorted by Import Date Ascending
    // (FIFO)
    // Also handle null soLuongConLai as full quantity for backward compatibility
    // logic (if needed)
    // But for now we assume they are initialized. If null, we treat as 0 or full?
    // Let's assume initialized.
    @Query("SELECT d FROM ImportDetail d JOIN d.phieuNhap n WHERE d.hangHoa.id = :productId AND d.soLuongConLai > 0 ORDER BY n.ngayNhap ASC")
    List<ImportDetail> findAvailableBatches(Integer productId);

    List<ImportDetail> findAllByHangHoaId(Integer productId);
}
