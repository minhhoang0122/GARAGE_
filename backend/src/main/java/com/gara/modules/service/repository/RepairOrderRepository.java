package com.gara.modules.service.repository;

import com.gara.entity.RepairOrder;
import com.gara.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface RepairOrderRepository extends JpaRepository<RepairOrder, Integer> {

        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.orderItems i " +
                        "LEFT JOIN FETCH i.product " +
                        "LEFT JOIN FETCH r.reception rpt " +
                        "LEFT JOIN FETCH rpt.vehicle v " +
                        "LEFT JOIN FETCH v.customer " +
                        "WHERE r.isWarrantyOrder = true " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findByIsWarrantyOrderTrue();

        List<RepairOrder> findByStatusIn(List<OrderStatus> statusList);

        // Optimized: Ordered multi-status query
        List<RepairOrder> findByStatusInOrderByCreatedAtDesc(List<OrderStatus> statusList);

        long countByStatusIn(List<OrderStatus> statuses);

        List<RepairOrder> findByStatus(OrderStatus status);

        // Optimized: Use count instead of fetching list
        long countByStatus(OrderStatus status);

        // FIX: Eager load details for Export Logic to avoid N+1 or Lazy issues
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.orderItems i " +
                        "LEFT JOIN FETCH i.product h " +
                        "WHERE r.status IN :statuses " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findWithDetailsByStatusIn(
                        @org.springframework.data.repository.query.Param("statuses") List<OrderStatus> statuses);

        List<RepairOrder> findByStatusOrderByCreatedAtDesc(OrderStatus status);

        // Optimized: Fetch items and products for history
        // Optimized: Fetch items and products for history
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.orderItems i " +
                        "LEFT JOIN FETCH i.product h " +
                        "WHERE r.reception.vehicle.licensePlate = :plate " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findTop5ByReception_Vehicle_LicensePlateOrderByCreatedAtDesc(
                        @org.springframework.data.repository.query.Param("plate") String plate,
                        org.springframework.data.domain.Pageable pageable);

        default List<RepairOrder> findTop5ByReception_Vehicle_LicensePlateOrderByCreatedAtDesc(String plate) {
                return findTop5ByReception_Vehicle_LicensePlateOrderByCreatedAtDesc(plate,
                                org.springframework.data.domain.PageRequest.of(0, 5));
        }

        // Optimized: Get top 5 recent orders. We don't JOIN FETCH xe here to avoid
        // conversion issues if JPA misbehaves.
        // We'll load related entities in the service layer as needed.
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.reception rpt " +
                        "LEFT JOIN FETCH rpt.vehicle v " +
                        "LEFT JOIN FETCH v.customer c " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findTop5ByOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);

        default List<RepairOrder> findTop5ByOrderByCreatedAtDesc() {
                return findTop5ByOrderByCreatedAtDesc(org.springframework.data.domain.PageRequest.of(0, 5));
        }

        @Query("SELECT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.reception rpt " +
                        "LEFT JOIN FETCH rpt.vehicle v " +
                        "LEFT JOIN FETCH v.customer c " +
                        "WHERE r.status IN (com.gara.entity.enums.OrderStatus.APPROVED, com.gara.entity.enums.OrderStatus.IN_PROGRESS) " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findJobsForMechanic();

        @Query("SELECT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.reception rpt " +
                        "LEFT JOIN FETCH rpt.vehicle v " +
                        "LEFT JOIN FETCH v.customer c " +
                        "WHERE r.status = com.gara.entity.enums.OrderStatus.WAITING_FOR_PAYMENT " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findOrdersAwaitingPayment();

        @Query("SELECT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.reception rpt " +
                        "LEFT JOIN FETCH rpt.vehicle v " +
                        "LEFT JOIN FETCH v.customer c " +
                        "WHERE r.balanceDue > 0 AND r.status != com.gara.entity.enums.OrderStatus.CANCELLED " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findOrdersWithDebt();

        @Query("SELECT COUNT(r) FROM RepairOrder r WHERE r.balanceDue > 0 AND r.status != com.gara.entity.enums.OrderStatus.CANCELLED")
        long countOrdersWithDebt();

        java.util.Optional<RepairOrder> findByReceptionId(Integer receptionId);

        @Query("SELECT new com.gara.dto.DebtDTO(c.id, c.fullName, c.phone, SUM(r.balanceDue), COUNT(r)) " +
                        "FROM RepairOrder r " +
                        "JOIN r.reception.vehicle.customer c " +
                        "WHERE r.balanceDue > 0 AND r.status NOT IN (com.gara.entity.enums.OrderStatus.CANCELLED, com.gara.entity.enums.OrderStatus.CLOSED) "
                        +
"GROUP BY c.id, c.fullName, c.phone")
        List<com.gara.dto.DebtDTO> findCustomersWithDebt();

        // Bug 34 Remediation: Find orders where Debt > 0 but Status is HUY
        @Query("SELECT r FROM RepairOrder r WHERE r.balanceDue > 0 AND r.status = com.gara.entity.enums.OrderStatus.CANCELLED")
        List<RepairOrder> findZombiedDebt();

        // Get all orders for a customer with optimized fetching
        @Query("SELECT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.reception rpt " +
                        "LEFT JOIN FETCH rpt.vehicle v " +
                        "WHERE v.customer.id = :customerId " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findByCustomerId(Integer customerId);

        // Optimized: Filter completed orders by date range (using NgayThanhToan or
        // NgayTao)
        // Optimized: Filter completed orders by date range with Eager Loading to
        // prevent N+1
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.orderItems i " +
                        "LEFT JOIN FETCH i.taskAssignments pct " +
                        "LEFT JOIN FETCH pct.mechanic " +
                        "WHERE (CASE WHEN r.paidAt IS NOT NULL THEN r.paidAt ELSE r.createdAt END) " +
                        "BETWEEN :start AND :end " +
                        "AND r.status IN (com.gara.entity.enums.OrderStatus.COMPLETED, com.gara.entity.enums.OrderStatus.CLOSED)")
        List<RepairOrder> findCompletedOrdersBetween(
                        @org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
                        @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

        // Optimized: Get receptions for inspection with eager loading (avoid N+1)
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.reception rpt " +
                        "LEFT JOIN FETCH rpt.vehicle v " +
                        "LEFT JOIN FETCH v.customer c " +
                        "LEFT JOIN FETCH r.orderItems " +
                        "WHERE r.status IN (com.gara.entity.enums.OrderStatus.RECEIVED, com.gara.entity.enums.OrderStatus.WAITING_FOR_DIAGNOSIS) " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findOrdersForInspection();

        // Optimized: Get all orders with eager loading for Sale list (limit 100)
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.reception rpt " +
                        "LEFT JOIN FETCH rpt.vehicle v " +
                        "LEFT JOIN FETCH v.customer c " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findAllOrdersOptimized(org.springframework.data.domain.Pageable pageable);

        default List<RepairOrder> findAllOrdersOptimized() {
                return findAllOrdersOptimized(org.springframework.data.domain.PageRequest.of(0, 100));
        }

        // Optimized: Get orders that have passed inspection (History for Diagnostic
        // Mechanic)
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.reception rpt " +
                        "LEFT JOIN FETCH rpt.vehicle v " +
                        "LEFT JOIN FETCH v.customer c " +
                        "WHERE r.status NOT IN (com.gara.entity.enums.OrderStatus.RECEIVED, com.gara.entity.enums.OrderStatus.WAITING_FOR_DIAGNOSIS, com.gara.entity.enums.OrderStatus.CANCELLED) " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findOrdersPostInspection(org.springframework.data.domain.Pageable pageable);

        default List<RepairOrder> findOrdersPostInspection() {
                return findOrdersPostInspection(org.springframework.data.domain.PageRequest.of(0, 50));
        }

        // Personalized History for Diagnostic Mechanic (Include Active QC Jobs)
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.reception rpt " +
                        "LEFT JOIN FETCH rpt.vehicle v " +
                        "LEFT JOIN FETCH v.customer c " +
                        "WHERE (r.status NOT IN (com.gara.entity.enums.OrderStatus.RECEIVED, com.gara.entity.enums.OrderStatus.WAITING_FOR_DIAGNOSIS, com.gara.entity.enums.OrderStatus.CANCELLED) " +
                        "OR r.status = com.gara.entity.enums.OrderStatus.WAITING_FOR_QC) " +
                        "AND r.diagnosticMechanic.id = :mechanicId " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findHistoryByDiagnosticMechanic(
                        @org.springframework.data.repository.query.Param("mechanicId") Integer mechanicId,
                        org.springframework.data.domain.Pageable pageable);

        // Personalized History for Repair Mechanic
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.reception rpt " +
                        "LEFT JOIN FETCH rpt.vehicle v " +
                        "LEFT JOIN FETCH v.customer c " +
                        "WHERE r.status IN (com.gara.entity.enums.OrderStatus.WAITING_FOR_PAYMENT, com.gara.entity.enums.OrderStatus.COMPLETED, com.gara.entity.enums.OrderStatus.CLOSED) " +
                        "AND r.assignedMechanic.id = :mechanicId " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findRepairHistoryByMechanic(
                        @org.springframework.data.repository.query.Param("mechanicId") Integer mechanicId,
                        org.springframework.data.domain.Pageable pageable);

        List<RepairOrder> findByReception_Vehicle_LicensePlateAndStatusIn(String plate, List<OrderStatus> statuses);

        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "JOIN r.orderItems i " +
                        "JOIN i.product h " +
                        "WHERE r.status IN (com.gara.entity.enums.OrderStatus.COMPLETED, com.gara.entity.enums.OrderStatus.CLOSED) " +
                        "AND h.warrantyMonths > 0 " +
                        "AND r.createdAt > CURRENT_TIMESTAMP")
        List<RepairOrder> findOrdersWithActiveWarranty();

        @Query(value = "SELECT COUNT(DISTINCT i.id) " +
                        "FROM repair_orders r " +
                        "JOIN order_items i ON r.id = i.repair_order_id " +
                        "JOIN products h ON i.product_id = h.id " +
                        "JOIN receptions ptn ON r.reception_id = ptn.id " +
                        "JOIN vehicles v ON ptn.license_plate = v.license_plate " +
                        "WHERE v.license_plate = :plate " +
                        "AND r.status IN ('COMPLETED', 'CLOSED') " +
                        "AND h.warranty_months > 0 " +
                        "AND (r.created_at + (h.warranty_months || ' month')::interval) > CURRENT_TIMESTAMP", nativeQuery = true)
        long countActiveWarrantiesByPlate(@org.springframework.data.repository.query.Param("plate") String plate);

        // ===== N+1 FIX: Full detail fetch for single order (used by SaleService,
        // MechanicService, PaymentService) =====
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.orderItems i " +
                        "LEFT JOIN FETCH i.product " +
                        "LEFT JOIN FETCH i.suggestedBy " +
                        "LEFT JOIN FETCH i.mechanic " +
                        "LEFT JOIN FETCH r.reception rpt " +
                        "LEFT JOIN FETCH rpt.vehicle v " +
                        "LEFT JOIN FETCH v.customer " +
                        "LEFT JOIN FETCH r.serviceAdvisor " +
                        "LEFT JOIN FETCH r.assignedMechanic " +
                        "LEFT JOIN FETCH r.diagnosticMechanic " +
                        "WHERE r.id = :id")
        java.util.Optional<RepairOrder> findByIdWithFullDetails(
                        @org.springframework.data.repository.query.Param("id") Integer id);

        // ===== N+1 FIX: Orders by single status with eager fetch (used by
        // SaleService.getOrders) =====
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.reception rpt " +
                        "LEFT JOIN FETCH rpt.vehicle v " +
                        "LEFT JOIN FETCH v.customer c " +
                        "WHERE r.status = :status " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findByStatusOptimized(
                        @org.springframework.data.repository.query.Param("status") OrderStatus status);

        // ===== N+1 FIX: Orders by multiple statuses with eager fetch =====
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.reception rpt " +
                        "LEFT JOIN FETCH rpt.vehicle v " +
                        "LEFT JOIN FETCH v.customer c " +
                        "LEFT JOIN FETCH rpt.receptionist rec " +
                        "WHERE r.status IN :statuses " +
                        "ORDER BY r.createdAt DESC")
        List<RepairOrder> findByStatusesOptimized(
                        @org.springframework.data.repository.query.Param("statuses") List<OrderStatus> statuses);

        // ===== N+1 FIX: Order by reception ID with items + products (used by
        // MechanicService.getReceptionDetail) =====
        @Query("SELECT DISTINCT r FROM RepairOrder r " +
                        "LEFT JOIN FETCH r.orderItems i " +
                        "LEFT JOIN FETCH i.product " +
                        "WHERE r.reception.id = :receptionId")
        java.util.Optional<RepairOrder> findByReceptionIdWithDetails(
                        @org.springframework.data.repository.query.Param("receptionId") Integer receptionId);

        @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
        @org.springframework.data.jpa.repository.Query("SELECT r FROM RepairOrder r WHERE r.id = :id")
        java.util.Optional<RepairOrder> findByIdWithLock(
            @org.springframework.data.repository.query.Param("id") Integer id);

    java.util.Optional<RepairOrder> findByUuid(java.util.UUID uuid);

    @Query("SELECT DISTINCT r FROM RepairOrder r " +
                    "LEFT JOIN FETCH r.orderItems i " +
                    "LEFT JOIN FETCH i.product " +
                    "LEFT JOIN FETCH r.reception rpt " +
                    "LEFT JOIN FETCH rpt.vehicle v " +
                    "LEFT JOIN FETCH v.customer " +
                    "WHERE r.uuid = :uuid")
    java.util.Optional<RepairOrder> findByUuidWithDetails(@org.springframework.data.repository.query.Param("uuid") java.util.UUID uuid);

    List<RepairOrder> findAllByAssignedMechanicIdAndStatusIn(Integer mechanicId, List<OrderStatus> statuses);

    long countByStatusAndUpdatedAtAfter(OrderStatus status, java.time.LocalDateTime after);

    @Query("SELECT DISTINCT r FROM RepairOrder r JOIN r.orderItems i WHERE i.status = :itemStatus")
    List<RepairOrder> findOrdersByItemStatus(@org.springframework.data.repository.query.Param("itemStatus") com.gara.entity.enums.ItemStatus itemStatus);

    List<RepairOrder> findByDiagnosticMechanicIdAndStatusNotIn(Integer mechanicId, List<OrderStatus> statuses);
}
