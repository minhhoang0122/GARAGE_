package com.gara.modules.inventory.repository;

import com.gara.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    Optional<Product> findByMaHang(String maHang);

    List<Product> findByTenHangContainingIgnoreCase(String keyword);

    List<Product> findByMaHangContainingOrTenHangContaining(String maHang, String tenHang);

    @Query("SELECT p FROM Product p WHERE p.laDichVu = false AND p.soLuongTon <= p.dinhMucTonToiThieu")
    List<Product> findLowStockProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.laDichVu = false AND p.soLuongTon <= p.dinhMucTonToiThieu")
    long countLowStockProducts();

    List<Product> findByLaDichVu(Boolean laDichVu);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") Integer id);

    // Optimized: Calculate total inventory value in DB
    @Query("SELECT COALESCE(SUM(p.giaVon * p.soLuongTon), 0) FROM Product p WHERE p.laDichVu = false")
    java.math.BigDecimal sumInventoryValue();

    // Optimized: Get products with pagination (default 50)
    @Query("SELECT p FROM Product p ORDER BY p.tenHang ASC")
    List<Product> findProductsPaginated(org.springframework.data.domain.Pageable pageable);

    default List<Product> findProductsPaginated() {
        return findProductsPaginated(org.springframework.data.domain.PageRequest.of(0, 50));
    }
}
