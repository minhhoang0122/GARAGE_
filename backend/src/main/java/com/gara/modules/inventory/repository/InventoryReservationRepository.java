package com.gara.modules.inventory.repository;

import com.gara.entity.InventoryReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, Integer> {

    // Find active reservation for an order
    @Query("SELECT r FROM InventoryReservation r WHERE r.repairOrder.id = :orderId AND r.status = 'ACTIVE'")
    List<InventoryReservation> findActiveByOrderId(@Param("orderId") Integer orderId);

    // Sum reserved quantity for a product (Active & Not Expired)
    @Query("SELECT COALESCE(SUM(r.quantity), 0) FROM InventoryReservation r " +
            "WHERE r.product.id = :productId " +
            "AND r.status = 'ACTIVE' " +
            "AND r.expiryDate >= CURRENT_TIMESTAMP")
    Integer sumReservedQuantity(@Param("productId") Integer productId);

    List<InventoryReservation> findByExpiryDateBeforeAndStatus(java.time.LocalDateTime dateTime, String status);
}
