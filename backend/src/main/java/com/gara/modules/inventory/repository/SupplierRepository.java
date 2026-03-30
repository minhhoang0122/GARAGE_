package com.gara.modules.inventory.repository;

import com.gara.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    Optional<Supplier> findBySupplierCode(String supplierCode);
    List<Supplier> findByActiveTrue();
    List<Supplier> findByNameContainingIgnoreCase(String name);
}
