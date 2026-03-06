package com.gara.modules.inventory.service;

import com.gara.entity.*;
import com.gara.modules.inventory.repository.*;
import com.gara.modules.notification.repository.*;
import com.gara.modules.auth.repository.*;
import com.gara.modules.system.repository.*;
import com.gara.modules.service.repository.*;
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
    private final NotificationRepository notificationRepository;
    private final RepairOrderRepository orderRepository;
    private final UserRepository userRepository;

    public InventoryReservationService(InventoryReservationRepository reservationRepository,
            ProductRepository productRepository,
            OrderItemRepository orderItemRepository,
            AuditLogRepository auditLogRepository,
            NotificationRepository notificationRepository,
            RepairOrderRepository orderRepository,
            UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
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

        // 3. Process each item
        for (OrderItem item : items) {
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
                    .ngayHetHan(LocalDateTime.now().plusHours(24))
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
     */
    @Transactional
    public boolean convertReservation(Integer orderId) {
        List<InventoryReservation> reservations = reservationRepository.findActiveByOrderId(orderId);
        if (reservations.isEmpty())
            return false;

        for (InventoryReservation res : reservations) {
            res.setTrangThai("CONVERTED"); // Mark as used
            reservationRepository.save(res);
        }
        return true;
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
            notificationRepository.save(Notification.builder()
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
