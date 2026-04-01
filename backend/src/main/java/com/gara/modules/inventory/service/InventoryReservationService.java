package com.gara.modules.inventory.service;

import com.gara.entity.*;
import com.gara.modules.inventory.repository.*;
import com.gara.modules.auth.repository.*;
import com.gara.modules.system.repository.*;
import com.gara.modules.service.repository.*;
import com.gara.entity.enums.ItemStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryReservationService {

    private static final Logger log = LoggerFactory.getLogger(InventoryReservationService.class);

    private final InventoryReservationRepository reservationRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final AuditLogRepository auditLogRepository;
    private final RepairOrderRepository orderRepository;
    private final UserRepository userRepository;
    private final com.gara.modules.support.service.AsyncNotificationService asyncNotificationService;
    private final com.gara.modules.support.service.RealtimeService realtimeService;

    public InventoryReservationService(InventoryReservationRepository reservationRepository,
            ProductRepository productRepository,
            OrderItemRepository orderItemRepository,
            AuditLogRepository auditLogRepository,
            RepairOrderRepository orderRepository,
            UserRepository userRepository,
            com.gara.modules.support.service.AsyncNotificationService asyncNotificationService,
            com.gara.modules.support.service.RealtimeService realtimeService) {
        this.reservationRepository = reservationRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.auditLogRepository = auditLogRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.asyncNotificationService = asyncNotificationService;
        this.realtimeService = realtimeService;
    }

    // Helper: Calculate Available Stock
    public int getAvailableStock(Integer productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null)
            return 0;

        Integer reserved = reservationRepository.sumReservedQuantity(productId);
        return product.getStockQuantity() - reserved;
    }

    /**
     * Create Reservation for Order
     * Trigger: Sale creates Quote / Finalizes Quote
     * Concurrency: PESSIMISTIC_WRITE on Product Row
     */
    @Transactional
    public void createReservation(Integer orderId, Integer userId) {
        // 1. Get Order Items (Parts only)
        List<OrderItem> items = orderItemRepository.findByRepairOrderIdAndIsServiceFalse(orderId);
        if (items.isEmpty())
            return;

        // 2. Clean up old active reservations for this order (e.g. re-quote)
        List<InventoryReservation> existing = reservationRepository.findActiveByOrderId(orderId);
        for (InventoryReservation res : existing) {
            res.setStatus("RELEASED");
            reservationRepository.save(res);
        }

        // 3. Process each item (Skip items already exported/completed)
        java.util.List<AuditLog> auditLogs = new java.util.ArrayList<>();
        java.util.Set<Integer> updatedProductIds = new java.util.HashSet<>();

        for (OrderItem item : items) {
            if (List.of(ItemStatus.IN_PROGRESS, ItemStatus.COMPLETED).contains(item.getStatus())) {
                continue; 
            }
            // STRICT LOCK: Lock Product row to prevent race condition
            Product product = productRepository.findByIdWithLock(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + item.getProduct().getId()));

            // Calculate Availability (Inside Lock)
            Integer reservedQty = reservationRepository.sumReservedQuantity(product.getId());
            int available = product.getStockQuantity() - reservedQty;

            if (available < item.getQuantity()) {
                throw new RuntimeException("Không đủ tồn kho khả dụng cho " + product.getName() +
                        ". Hiện có: " + available + ", Cần: " + item.getQuantity());
            }

            // Create Reservation
            InventoryReservation res = InventoryReservation.builder()
                    .repairOrder(orderRepository.getReferenceById(orderId))
                    .product(product)
                    .quantity(item.getQuantity())
                    .status("ACTIVE")
                    .expiryDate(LocalDateTime.now().plusDays(3)) 
                    .creator(userRepository.getReferenceById(userId))
                    .build();

            reservationRepository.save(res);
            updatedProductIds.add(product.getId());

            // Collect Audit Logs
            auditLogs.add(AuditLog.builder()
                    .tableName("InventoryReservation")
                    .recordId(orderId)
                    .action("INSERT")
                    .newData("SKU: " + product.getSku() + ", SL: " + item.getQuantity())
                    .reason("Giữ hàng cho Đơn #" + orderId)
                    .userId(userId)
                    .build());
        }

        // 4. Batch Save Audit Logs
        if (!auditLogs.isEmpty()) {
            auditLogRepository.saveAll(auditLogs);
        }

        // 5. Single Broadcast to notify UI (Triggered after all DB work in transaction is near completion)
        if (!updatedProductIds.isEmpty()) {
            realtimeService.broadcast("inventory_updated", java.util.Map.of(
                "orderId", orderId,
                "action", "RESERVE_BATCH",
                "productIds", updatedProductIds,
                "message", "Cập nhật tồn kho hàng loạt"
            ));
        }
    }

    /**
     * Convert Reservation (Export Stock)
     * Trigger: Warehouse confirms export
     * Bug 119 Fix: Only convert specific products that were actually exported
     */
    @Transactional
    public List<InventoryReservation> convertReservation(Integer orderId, java.util.Collection<Integer> productIds) {
        List<InventoryReservation> reservations = reservationRepository.findActiveByOrderId(orderId);
        if (reservations.isEmpty())
            return java.util.Collections.emptyList();

        List<InventoryReservation> converted = new java.util.ArrayList<>();
        for (InventoryReservation res : reservations) {
            if (productIds.contains(res.getProduct().getId())) {
                res.setStatus("CONVERTED"); // Mark as used
                reservationRepository.save(res);
                converted.add(res);
            }
        }
        return converted;
    }

    /**
     * Release Reservation
     * Trigger: Cancel Order / Reject Quote
     */
    @Transactional
    public void releaseReservation(Integer orderId, String reason, Integer userId) {
        List<InventoryReservation> reservations = reservationRepository.findActiveByOrderId(orderId);
        for (InventoryReservation res : reservations) {
            res.setStatus("RELEASED");
            reservationRepository.save(res);

            // Realtime Broadcast for real-time UI update
            realtimeService.broadcast("inventory_updated", java.util.Map.of(
                "productId", res.getProduct().getId(),
                "orderId", orderId,
                "action", "RELEASE",
                "message", "Giải phóng tạm giữ kho"
            ));
        }

        if (!reservations.isEmpty()) {
            AuditLog audit = AuditLog.builder()
                    .tableName("InventoryReservation")
                    .recordId(orderId)
                    .action("UPDATE")
                    .reason("Release: " + reason)
                    .userId(userId)
                    .build();
            auditLogRepository.save(audit);
        }
    }

    /**
     * Rule 11.2: Release Expired Reservations
     * Automatically runs every hour to clean up stale reservations
     */
    @Transactional
    @Scheduled(cron = "0 0 * * * *") // Every hour
    public void releaseExpiredReservations() {
        List<InventoryReservation> expired = reservationRepository
                .findByExpiryDateBeforeAndStatus(LocalDateTime.now(), "ACTIVE");

        for (InventoryReservation res : expired) {
            res.setStatus("EXPIRED");
            reservationRepository.save(res);

            // Realtime Broadcast for real-time UI update
            realtimeService.broadcast("inventory_updated", java.util.Map.of(
                "productId", res.getProduct().getId(),
                "orderId", res.getRepairOrder().getId(),
                "action", "EXPIRE",
                "message", "Tạm giữ hết hạn"
            ));

            log.info("Released expired reservation for Order #{} - Product #{}", res.getRepairOrder().getId(),
                    res.getProduct().getId());

            // Notification to Sale
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .role("SALE")
                    .title("Hàng giữ hết hạn: Order #" + res.getRepairOrder().getId())
                    .content("Hàng giữ cho sản phẩm '" + res.getProduct().getName() + "' đã hết hạn và tự động nhả.")
                    .type("WARNING")
                    .link("/sale/orders/" + res.getRepairOrder().getId())
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());

            // Audit
            AuditLog audit = AuditLog.builder()
                    .tableName("InventoryReservation")
                    .recordId(res.getRepairOrder().getId())
                    .action("EXPIRE")
                    .newData("Released Qty: " + res.getQuantity())
                    .reason("TTL Expired (24h)")
                    .userId(1) // System/Admin
                    .build();
            auditLogRepository.save(audit);
        }
    }
}
