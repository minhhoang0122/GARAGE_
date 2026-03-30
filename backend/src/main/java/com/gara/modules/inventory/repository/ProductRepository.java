package com.gara.modules.inventory.repository;

import com.gara.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    Optional<Product> findBySku(String sku);

    List<Product> findByNameContainingIgnoreCase(String keyword);

    List<Product> findBySkuContainingOrNameContaining(String sku, String name);

    @Query("SELECT p FROM Product p WHERE p.isService = false AND p.stockQuantity <= p.minStockLevel")
    List<Product> findLowStockProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.isService = false AND p.stockQuantity <= p.minStockLevel")
    long countLowStockProducts();

    List<Product> findByIsService(Boolean isService);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") Integer id);

    // Optimized: Calculate total inventory value in DB
    @Query("SELECT COALESCE(SUM(p.costPrice * p.stockQuantity), 0) FROM Product p WHERE p.isService = false")
    java.math.BigDecimal sumInventoryValue();

    // Optimized: Get products with pagination (default 50)
    @Query("SELECT p FROM Product p ORDER BY p.name ASC")
    List<Product> findProductsPaginated(org.springframework.data.domain.Pageable pageable);

    default List<Product> findProductsPaginated() {
        return findProductsPaginated(org.springframework.data.domain.PageRequest.of(0, 50));
    }

    List<Product> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(String name, String sku);
}
