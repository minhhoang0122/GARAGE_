package com.gara.modules.service.repository;

import com.gara.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    // Optimized: Fetch items with products eagerly
    @Query("SELECT i FROM OrderItem i " +
            "JOIN FETCH i.product h " +
            "WHERE i.repairOrder.id = :orderId AND h.isService = false")
    List<OrderItem> findByRepairOrderIdAndIsServiceFalse(@Param("orderId") Integer orderId);

    @Query("SELECT i FROM OrderItem i " +
           "JOIN FETCH i.repairOrder dh " +
           "LEFT JOIN FETCH dh.serviceAdvisor " +
           "LEFT JOIN FETCH i.product " +
           "WHERE i.id = :id")
    java.util.Optional<OrderItem> findByIdWithFullDetails(@Param("id") Integer id);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM OrderItem i WHERE i.id = :id")
    java.util.Optional<OrderItem> findByIdWithLock(@Param("id") Integer id);

    // Optimized: Calculate Total Order Value in DB (excluding Rejected items)
    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM OrderItem i WHERE i.repairOrder.id = :orderId AND i.status != com.gara.entity.enums.ItemStatus.CUSTOMER_REJECTED")
    java.math.BigDecimal sumTotalForOrder(@Param("orderId") Integer orderId);

    // Standard JPA Method for fetching items by Order ID
    List<OrderItem> findByRepairOrderId(Integer orderId);

    // Bug 136 Fix: Count Warranty Items
    @Query("SELECT COUNT(i) FROM OrderItem i WHERE i.isWarranty = true")
    long countWarrantyItems();

    // New for Supplemental Quote Approval Workflow
    List<OrderItem> findByStatus(com.gara.entity.enums.ItemStatus status);
}
