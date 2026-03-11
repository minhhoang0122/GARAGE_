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

    public InventoryReservationService(InventoryReservationRepository reservationRepository,
            ProductRepository productRepository,
            OrderItemRepository orderItemRepository,
            AuditLogRepository auditLogRepository,
            RepairOrderRepository orderRepository,
            UserRepository userRepository,
            com.gara.modules.support.service.AsyncNotificationService asyncNotificationService) {
        this.reservationRepository = reservationRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.auditLogRepository = auditLogRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.asyncNotificationService = asyncNotificationService;
    }

    // Helper: Calculate Available Stock
    public int getAvailableStock(Integer productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null)
            return 0;

        Integer reserved = reservationRepository.sumReservedQuantity(productId);
        return product.getSoLuongTon() - reserved;
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
            res.setTrangThai("RELEASED");
            reservationRepository.save(res);
        }

        // 3. Process each item (Skip items already exported/completed)
        for (OrderItem item : items) {
            if (List.of(ItemStatus.DANG_SUA, ItemStatus.HOAN_THANH).contains(item.getTrangThai())) {
                continue; // Bug 97 Fix: Don't reserve items that are already out of the warehouse
            }
            // STRICT LOCK: Lock Product row to prevent race condition
            Product product = productRepository.findByIdWithLock(item.getHangHoa().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getHangHoa().getId()));

            // Calculate Availability (Inside Lock)
            Integer reservedQty = reservationRepository.sumReservedQuantity(product.getId());
            int available = product.getSoLuongTon() - reservedQty;

            if (available < item.getSoLuong()) {
                throw new RuntimeException("Không đủ tồn kho khả dụng cho " + product.getTenHang() +
                        ". Tồn: " + product.getSoLuongTon() +
                        ", Giữ: " + reservedQty +
                        ", Cần: " + item.getSoLuong());
            }

            // Create Reservation
            InventoryReservation res = InventoryReservation.builder()
                    .donHangSuaChua(orderRepository.getReferenceById(orderId))
                    .hangHoa(product)
                    .soLuong(item.getSoLuong())
                    .trangThai("ACTIVE")
                    // Bug 118 Fix: Support 7 days TTL for complex repairs
                    .ngayHetHan(LocalDateTime.now().plusDays(7)) 
                    .nguoiTao(userRepository.getReferenceById(userId))
                    .build();

            reservationRepository.save(res);

            // Audit Log
            AuditLog audit = AuditLog.builder()
                    .bang("InventoryReservation")
                    .banGhiId(orderId)
                    .hanhDong("INSERT")
                    .duLieuMoi("Item: " + product.getMaHang() + ", Qty: " + item.getSoLuong())
                    .lyDo("Reserve for Order #" + orderId)
                    .nguoiThucHienId(userId)
                    .build();
            auditLogRepository.save(audit);
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
            if (productIds.contains(res.getHangHoa().getId())) {
                res.setTrangThai("CONVERTED"); // Mark as used
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
            res.setTrangThai("RELEASED");
            reservationRepository.save(res);
        }

        if (!reservations.isEmpty()) {
            AuditLog audit = AuditLog.builder()
                    .bang("InventoryReservation")
                    .banGhiId(orderId)
                    .hanhDong("UPDATE")
                    .lyDo("Release: " + reason)
                    .nguoiThucHienId(userId)
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
                .findByNgayHetHanBeforeAndTrangThai(LocalDateTime.now(), "ACTIVE");

        for (InventoryReservation res : expired) {
            res.setTrangThai("EXPIRED");
            reservationRepository.save(res);

            log.info("Released expired reservation for Order #{} - Product #{}", res.getDonHangSuaChuaId(),
                    res.getHangHoaId());

            // Notification to Sale
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .role("SALE")
                    .title("Hàng giữ hết hạn: Order #" + res.getDonHangSuaChuaId())
                    .content("Hàng giữ cho sản phẩm '" + res.getHangHoa().getTenHang() + "' đã hết hạn và tự động nhả.")
                    .type("WARNING")
                    .link("/sale/orders/" + res.getDonHangSuaChuaId())
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());

            // Audit
            AuditLog audit = AuditLog.builder()
                    .bang("InventoryReservation")
                    .banGhiId(res.getDonHangSuaChuaId())
                    .hanhDong("EXPIRE")
                    .duLieuMoi("Released Qty: " + res.getSoLuong())
                    .lyDo("TTL Expired (24h)")
                    .nguoiThucHienId(1) // System/Admin
                    .build();
            auditLogRepository.save(audit);
        }
    }
}
