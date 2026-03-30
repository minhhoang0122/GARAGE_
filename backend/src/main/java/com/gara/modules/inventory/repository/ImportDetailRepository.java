package com.gara.modules.inventory.repository;

import com.gara.entity.ImportDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportDetailRepository extends JpaRepository<ImportDetail, Integer> {

    // Find batches with remaining quantity > 0, sorted by Import Date Ascending (FIFO)
    @Query("SELECT d FROM ImportDetail d JOIN d.importNote n WHERE d.product.id = :productId AND d.remainingQuantity > 0 ORDER BY n.importDate ASC")
    List<ImportDetail> findAvailableBatches(Integer productId);

    @Query("SELECT d FROM ImportDetail d JOIN d.importNote n WHERE d.product.id = :productId ORDER BY n.importDate DESC")
    List<ImportDetail> findAllByProductIdOrderByImportDateDesc(Integer productId);

    List<ImportDetail> findAllByProductId(Integer productId);
}
