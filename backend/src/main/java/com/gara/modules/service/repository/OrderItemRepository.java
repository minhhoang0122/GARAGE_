package com.gara.modules.service.repository;

import com.gara.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    // Optimized: Fetch items with products eagerly
    @Query("SELECT i FROM OrderItem i " +
            "JOIN FETCH i.hangHoa h " +
            "WHERE i.donHangSuaChua.id = :orderId AND h.laDichVu = false")
    List<OrderItem> findByRepairOrderIdAndIsServiceFalse(@Param("orderId") Integer orderId);

    @Query("SELECT i FROM OrderItem i " +
           "JOIN FETCH i.donHangSuaChua dh " +
           "LEFT JOIN FETCH dh.nguoiPhuTrach " +
           "LEFT JOIN FETCH i.hangHoa " +
           "WHERE i.id = :id")
    java.util.Optional<OrderItem> findByIdWithFullDetails(@Param("id") Integer id);

    // Optimized: Calculate Total Order Value in DB (excluding Rejected items)
    @Query("SELECT COALESCE(SUM(i.thanhTien), 0) FROM OrderItem i WHERE i.donHangSuaChua.id = :orderId AND i.trangThai != 'KHACH_TU_CHOI'")
    java.math.BigDecimal sumTotalForOrder(@Param("orderId") Integer orderId);

    // Standard JPA Method for fetching items by Order ID
    List<OrderItem> findByDonHangSuaChuaId(Integer orderId);

    // Bug 136 Fix: Count Warranty Items
    @Query("SELECT COUNT(i) FROM OrderItem i WHERE i.trangThai LIKE '%WARRANTY%'")
    long countWarrantyItems();

    // New for Supplemental Quote Approval Workflow
    List<OrderItem> findByTrangThai(com.gara.entity.enums.ItemStatus trangThai);
}
