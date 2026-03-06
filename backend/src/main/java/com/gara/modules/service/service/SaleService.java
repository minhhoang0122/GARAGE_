package com.gara.modules.service.service;

import com.gara.modules.inventory.service.InventoryReservationService;
import com.gara.modules.finance.service.TransactionService;

import com.gara.entity.*;
import com.gara.modules.inventory.repository.*;
import com.gara.modules.service.repository.*;
import com.gara.modules.customer.repository.*;
import com.gara.modules.finance.repository.*;
import com.gara.modules.notification.repository.*;
import com.gara.modules.system.repository.*;
import com.gara.modules.reception.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gara.dto.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.math.RoundingMode;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class SaleService {

    private final RepairOrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final NotificationRepository notificationRepository;
    private final InventoryReservationService reservationService;
    private final AuditLogRepository auditLogRepository;
    private final FinancialTransactionRepository transactionRepository;
    private final VehicleRepository vehicleRepository;
    private final ReceptionRepository receptionRepository;
    private final TransactionService transactionService;

    public SaleService(RepairOrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            NotificationRepository notificationRepository,
            InventoryReservationService reservationService,
            AuditLogRepository auditLogRepository,
            FinancialTransactionRepository transactionRepository,
            VehicleRepository vehicleRepository,
            ReceptionRepository receptionRepository,
            TransactionService transactionService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.notificationRepository = notificationRepository;
        this.reservationService = reservationService;
        this.auditLogRepository = auditLogRepository;
        this.transactionRepository = transactionRepository;
        this.vehicleRepository = vehicleRepository;
        this.receptionRepository = receptionRepository;
        this.transactionService = transactionService;
    }

    // 7. Get Dashboard Stats
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        // Count all active vehicles in garage (not closed/cancelled)
        long countWaiting = orderRepository.countByTrangThaiIn(
                List.of("TIEP_NHAN", "CHO_CHAN_DOAN", "BAO_GIA", "BAO_GIA_LAI",
                        "CHO_KH_DUYET", "DA_DUYET", "CHO_SUA_CHUA", "DANG_SUA",
                        "CHO_THANH_TOAN", "HOAN_THANH"));
        long countPendingQuotes = orderRepository.countByTrangThai("CHO_KH_DUYET");
        long countPendingPayment = orderRepository.countByTrangThai("CHO_THANH_TOAN");

        // Waiting Vehicles List (Recently received - all active, not just TIEP_NHAN)
        List<RepairOrder> waitingOrders = orderRepository.findByTrangThaiInOrderByNgayTaoDesc(
                List.of("TIEP_NHAN", "CHO_CHAN_DOAN"));
        List<DashboardStatsDTO.DashboardVehicleDTO> waitingVehicles = waitingOrders.stream()
                .limit(5)
                .map(o -> {
                    String plate = "Unknown";
                    String customer = "Unknown";
                    String receptionist = "Unknown";

                    try {
                        if (o.getPhieuTiepNhan() != null && o.getPhieuTiepNhan().getXe() != null) {
                            plate = o.getPhieuTiepNhan().getXe().getBienSo();
                            if (o.getPhieuTiepNhan().getXe().getKhachHang() != null) {
                                customer = o.getPhieuTiepNhan().getXe().getKhachHang().getHoTen();
                            }
                        }
                        if (o.getPhieuTiepNhan() != null && o.getPhieuTiepNhan().getNguoiTiepNhan() != null) {
                            receptionist = o.getPhieuTiepNhan().getNguoiTiepNhan().getHoTen();
                        }
                    } catch (Exception e) {
                        // Log and continue with defaults if join fails
                    }

                    return DashboardStatsDTO.DashboardVehicleDTO.builder()
                            .id(o.getId())
                            .plate(plate)
                            .customerName(customer)
                            .time(o.getNgayTao())
                            .odo(o.getPhieuTiepNhan() != null ? o.getPhieuTiepNhan().getOdo() : 0)
                            .receptionistName(receptionist)
                            .build();
                })
                .toList();

        // Optimized: Recent Orders
        List<RepairOrder> recentOrdersList = orderRepository.findTop5ByOrderByNgayTaoDesc();
        List<DashboardStatsDTO.DashboardOrderDTO> recentOrders = recentOrdersList.stream()
                .map(o -> {
                    String plate = "Unknown";
                    try {
                        if (o.getPhieuTiepNhan() != null && o.getPhieuTiepNhan().getXe() != null) {
                            plate = o.getPhieuTiepNhan().getXe().getBienSo();
                        }
                    } catch (Exception e) {
                    }

                    return DashboardStatsDTO.DashboardOrderDTO.builder()
                            .id(o.getId())
                            .plate(plate)
                            .total(o.getTongCong())
                            .status(o.getTrangThai())
                            .build();
                })
                .toList();

        return DashboardStatsDTO.builder()
                .countWaiting(countWaiting)
                .countPendingQuotes(countPendingQuotes)
                .countPendingPayment(countPendingPayment)
                .countWarranty(0L)
                .waitingVehicles(waitingVehicles)
                .recentOrders(recentOrders)
                .build();
    }

    // 1. Get Order Details
    @Transactional(readOnly = true)
    public OrderDetailDTO getOrderDetails(Integer orderId) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        List<OrderItemDTO> items = order.getChiTietDonHang().stream()
                .map(i -> OrderItemDTO.builder()
                        .id(i.getId())
                        .productId(i.getHangHoa().getId())
                        .productName(i.getHangHoa().getTenHang())
                        .productCode(i.getHangHoa().getMaHang())
                        .unitPrice(i.getDonGiaGoc())
                        .quantity(i.getSoLuong())
                        .totalPrice(i.getThanhTien())
                        .discountPercent(i.getGiamGiaPhanTram())
                        .type(i.getHangHoa().getLaDichVu() ? "SERVICE" : "PRODUCT")
                        .itemStatus(i.getTrangThai())
                        .proposedById(i.getNguoiDeXuatId())
                        .proposedByName(i.getNguoiDeXuat() != null ? i.getNguoiDeXuat().getHoTen() : null)
                        .isWarranty(i.getTrangThai() != null && i.getTrangThai().contains("WARRANTY"))
                        .build())
                .toList();

        // Optimized: Dynamic Calculation of Paid Amount from DB
        BigDecimal totalPaid = transactionRepository.sumTotalPaidByOrderId(orderId);

        // Note: keeping transactions fetch if needed for deposit calculation or list
        // display,
        // but for totalPaid we use the optimized query.
        List<FinancialTransaction> transactions = transactionRepository.findByOrderIdOrderByCreatedAtDesc(orderId);

        BigDecimal deposit = transactions.stream()
                .filter(t -> t.getType() == FinancialTransaction.TransactionType.DEPOSIT)
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal finalAmount = order.getTongCong();

        return OrderDetailDTO.builder()
                .id(order.getId())
                .status(order.getTrangThai())
                .plateNumber(order.getPhieuTiepNhan().getXe().getBienSo())
                .customerName(order.getPhieuTiepNhan().getXe().getKhachHang().getHoTen())
                .customerPhone(order.getPhieuTiepNhan().getXe().getKhachHang().getSoDienThoai())
                .carBrand(order.getPhieuTiepNhan().getXe().getNhanHieu())
                .carModel(order.getPhieuTiepNhan().getXe().getModel())
                .createdAt(order.getNgayTao())
                .items(items)
                .discount(order.getChietKhauTong())
                .tax(order.getThueVAT())
                .totalAmount(order.getTongTienHang().add(order.getTongTienCong()))
                .finalAmount(finalAmount)
                .paidAmount(totalPaid)
                .deposit(deposit)
                .build();
    }

    // 2. Search Products
    public List<ProductDTO> searchProducts(String keyword) {
        List<Product> products;
        if (keyword == null || keyword.isEmpty()) {
            // Optimized: Use paginated query instead of findAll()
            products = productRepository.findProductsPaginated();
        } else {
            products = productRepository.findByMaHangContainingOrTenHangContaining(keyword, keyword);
        }

        return products.stream()
                .limit(20)
                .map(p -> ProductDTO.builder()
                        .id(p.getId())
                        .code(p.getMaHang())
                        .name(p.getTenHang())
                        .price(p.getGiaBanNiemYet())
                        .costPrice(p.getGiaVon())
                        .isService(p.getLaDichVu())
                        .stock(p.getSoLuongTon())
                        .build())
                .toList();
    }

    // 3. Add Item
    public List<Customer> searchCustomers(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            // Optimized: Return only recent 50 customers instead of all
            return customerRepository.findRecentCustomers();
        }
        return customerRepository.searchByKeyword(keyword);
    }

    public Customer createCustomer(Customer customer) {
        if (customerRepository.findBySoDienThoai(customer.getSoDienThoai()).isPresent()) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }
        return customerRepository.save(customer);
    }

    @Transactional
    public void addItem(Integer orderId, Integer productId, Integer quantity, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        checkOwnership(order, user);
        validateOrderModifiable(order);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        OrderItem item = new OrderItem();
        item.setDonHangSuaChua(order);
        item.setHangHoa(product);
        if (quantity <= 0) {
            throw new RuntimeException("Số lượng phải lớn hơn 0");
        }
        item.setSoLuong(quantity);
        item.setDonGiaGoc(product.getGiaBanNiemYet());
        item.setThanhTien(product.getGiaBanNiemYet().multiply(BigDecimal.valueOf(quantity)));

        // Handle Arising Issues (Rule 3.3)
        String status = order.getTrangThai();
        if ("DA_DUYET".equals(status) || "DANG_SUA".equals(status)) {
            item.setTrangThai("DE_XUAT"); // Arising issue needs approval
        } else {
            item.setTrangThai("KHACH_DONG_Y"); // Initial quote building
        }

        // Track who proposed this item
        item.setNguoiDeXuat(user);

        orderItemRepository.save(item);
        recalculateTotals(order);
    }

    // 4. Update Item
    @Transactional
    public void updateItem(Integer itemId, Integer quantity, Double discountPercent, User user) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        checkOwnership(item.getDonHangSuaChua(), user);
        validateOrderModifiable(item.getDonHangSuaChua());

        // Rule 10.2: Cannot edit approved items, only Arising (DE_XUAT) items
        String orderStatus = item.getDonHangSuaChua().getTrangThai();
        if ("DA_DUYET".equals(orderStatus) || "DANG_SUA".equals(orderStatus)) {
            if (!"DE_XUAT".equals(item.getTrangThai())) {
                throw new RuntimeException("Không thể chỉnh sửa hạng mục đã được duyệt (Báo giá gốc).");
            }
        }

        if (quantity != null && quantity > 0) {
            item.setSoLuong(quantity);
        }

        if (discountPercent != null) {
            if (discountPercent < 0 || discountPercent > 100) {
                throw new RuntimeException("Chiết khấu phải từ 0% đến 100%");
            }
            item.setGiamGiaPhanTram(BigDecimal.valueOf(discountPercent));
        }

        // Recalculate Total
        BigDecimal quantityVal = BigDecimal.valueOf(item.getSoLuong());
        BigDecimal discountFactor = BigDecimal.ONE
                .subtract(item.getGiamGiaPhanTram().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        BigDecimal finalPrice = item.getDonGiaGoc().multiply(quantityVal).multiply(discountFactor);

        // Rounding
        item.setThanhTien(finalPrice.setScale(2, RoundingMode.HALF_UP));
        item.setGiamGiaTien(item.getDonGiaGoc().multiply(quantityVal).subtract(item.getThanhTien()));

        orderItemRepository.save(item);
        recalculateTotals(item.getDonHangSuaChua());
    }

    // 4b. Update Item Status (Approve/Reject)
    @Transactional
    public void updateItemStatus(Integer itemId, String status, User user) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        checkOwnership(item.getDonHangSuaChua(), user);
        // Additional validation if needed

        item.setTrangThai(status);
        orderItemRepository.save(item);
        recalculateTotals(item.getDonHangSuaChua());
    }

    // 5. Remove Item
    @Transactional
    public void removeItem(Integer itemId, User user) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        RepairOrder order = item.getDonHangSuaChua();
        checkOwnership(order, user);
        validateOrderModifiable(order);

        // Rule 10.2: Cannot delete approved items, only Arising (DE_XUAT) items
        String orderStatus = order.getTrangThai();
        if ("DA_DUYET".equals(orderStatus) || "DANG_SUA".equals(orderStatus)) {
            if (!"DE_XUAT".equals(item.getTrangThai())) {
                throw new RuntimeException("Không thể xóa hạng mục đã được duyệt (Báo giá gốc).");
            }
        }

        // Audit Log for Deletion (Micro-rule)
        auditLogRepository.save(AuditLog.builder()
                .bang("ChiTietDonHang")
                .banGhiId(order.getId())
                .hanhDong("DELETE")
                .duLieuCu("Deleted Item: " + item.getHangHoa().getTenHang() + " (Qty: " + item.getSoLuong() + ")")
                .lyDo("Xóa hạng mục khỏi đơn hàng")
                .nguoiThucHienId(user.getId())
                .build());

        orderItemRepository.delete(item);
        recalculateTotals(order);
    }

    // 6. Send Quote to Customer
    @Transactional
    public void submitToCustomer(Integer orderId, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        checkOwnership(order, user);

        if (user.getId() == null) {
            throw new RuntimeException("Lỗi hệ thống: User ID không tồn tại. Vui lòng đăng nhập lại.");
        }

        String oldStatus = order.getTrangThai();
        order.setTrangThai("CHO_KH_DUYET");
        orderRepository.save(order);

        // Log transition
        auditLogRepository.save(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("UPDATE")
                .duLieuCu(oldStatus)
                .duLieuMoi("CHO_KH_DUYET")
                .lyDo("Gửi báo giá cho khách")
                .nguoiThucHienId(user.getId())
                .build());

        // Reserve inventory when waiting for customer approval
        reservationService.createReservation(orderId, user.getId());

        // Notify Customer (Rule 9.3.1)
        Customer customer = order.getPhieuTiepNhan().getXe().getKhachHang();
        if (customer.getUserId() != null) {
            notificationRepository.save(Notification.builder()
                    .userId(customer.getUserId())
                    .role("CUSTOMER")
                    .title("Báo giá mới: " + order.getPhieuTiepNhan().getXe().getBienSo())
                    .content("Báo giá sửa chữa đã sẵn sàng. Tổng tiền: " + order.getTongCong()
                            + ". Vui lòng xem và duyệt.")
                    .type("INFO")
                    .link("/customer/orders/" + orderId)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }
    }

    // 6c. Submit Replenishment Quote (For Technical Issues found mid-repair)
    @Transactional
    public void submitReplenishmentQuote(Integer orderId, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        checkOwnership(order, user);

        // Rule: Only allow replenishment during repair
        String status = order.getTrangThai();
        if ("CHO_THAN_TOAN".equals(status) || "HOAN_THANH".equals(status) ||
                "DONG".equals(status) || "HUY".equals(status)) {
            throw new RuntimeException("Không thể báo giá phát sinh khi đơn hàng đã hoàn thành hoặc chờ thanh toán.");
        }

        // Filter items that are in 'DE_XUAT' status (Proposed by mechanic or sale)
        List<OrderItem> proposedItems = order.getChiTietDonHang().stream()
                .filter(i -> "DE_XUAT".equals(i.getTrangThai()))
                .toList();

        if (proposedItems.isEmpty()) {
            throw new RuntimeException("Không có hạng mục phát sinh mới để báo giá.");
        }

        // We don't change the main order status if it's already DANG_SUA
        // But we log the action
        auditLogRepository.save(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("UPDATE")
                .duLieuCu("DANG_SUA")
                .duLieuMoi("DANG_SUA")
                .lyDo("Gửi báo giá bổ sung cho các hạng mục phát sinh")
                .nguoiThucHienId(user.getId())
                .build());

        // Notify customer about replenishment quote
        Customer repCustomer = order.getPhieuTiepNhan().getXe().getKhachHang();
        notificationRepository.save(Notification.builder()
                .userId(repCustomer.getUserId())
                .role("CUSTOMER")
                .title("Báo giá bổ sung: " + order.getPhieuTiepNhan().getXe().getBienSo())
                .content("Cố vấn dịch vụ đã gửi báo giá cho các hạng mục phát sinh mới. Vui lòng duyệt.")
                .type("WARNING")
                .link("/customer/orders/" + order.getId()) // Link for customer to approve
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        // Create reservations for these new items
        reservationService.createReservation(orderId, user.getId());
    }

    // 6b. Finalize Order (Customer Approved)
    @Transactional
    public void finalizeOrder(Integer orderId, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        checkOwnership(order, user);

        if (user.getId() == null) {
            throw new RuntimeException(
                    "Lỗi hệ thống: User ID không tồn tại trong phiên đăng nhập. Vui lòng đăng xuất và đăng nhập lại.");
        }

        String oldStatus = order.getTrangThai();

        // Idempotency Check: Prevent double approval
        if ("DA_DUYET".equals(oldStatus)) {
            return; // Already approved, do nothing
        }

        // Rule: Only move to DA_DUYET if approved by customer
        order.setTrangThai("DA_DUYET");
        order.setNgayDuyet(LocalDateTime.now());
        orderRepository.save(order);

        // Log transition
        auditLogRepository.save(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("UPDATE")
                .duLieuCu(oldStatus)
                .duLieuMoi("DA_DUYET")
                .lyDo("Khách hàng đã duyệt báo giá")
                .nguoiThucHienId(user.getId())
                .build());

        // Notify Repair Mechanic
        notificationRepository.save(Notification.builder()
                .role("THO_SUA_CHUA")
                .title("Lệnh sửa chữa mới: " + order.getPhieuTiepNhan().getXe().getBienSo())
                .content("Báo giá đã được duyệt. Vui lòng nhận việc.")
                .type("INFO")
                .link("/mechanic/jobs/" + order.getId())
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        // Notify Warehouse to prepare parts
        boolean hasParts = order.getChiTietDonHang().stream().anyMatch(i -> !i.getHangHoa().getLaDichVu());
        if (hasParts) {
            notificationRepository.save(Notification.builder()
                    .role("KHO")
                    .title("Phiếu xuất kho mới: " + order.getPhieuTiepNhan().getXe().getBienSo())
                    .content("Đơn hàng đã được duyệt. Vui lòng chuẩn bị vật tư.")
                    .type("INFO")
                    .link("/warehouse/export/" + order.getId())
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }

    }

    // 8. Cancel Order
    @Transactional
    public void cancelOrder(Integer orderId, String reason, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (reason == null || reason.trim().isEmpty()) {
            reason = "Không có lý do cụ thể";
        }

        String currentStatus = order.getTrangThai();

        // RULE: Cannot cancel COMPLETED or CLOSED orders
        if ("HOAN_THANH".equals(currentStatus) || "DONG".equals(currentStatus)) {
            throw new RuntimeException(
                    "Không thể hủy đơn hàng đã hoàn thành/đóng. Liên hệ Admin nếu cần.");
        }

        // RULE: Warn when canceling during repair with completed items
        if ("DANG_SUA".equals(currentStatus) || "CHO_SUA_CHUA".equals(currentStatus)) {
            long completedCount = order.getChiTietDonHang().stream()
                    .filter(item -> "HOAN_THANH".equals(item.getTrangThai()))
                    .count();

            if (completedCount > 0) {
                // Allow cancel but log as HIGH RISK action
                auditLogRepository.save(AuditLog.builder()
                        .bang("DonHangSuaChua")
                        .banGhiId(orderId)
                        .hanhDong("CANCEL_RISK")
                        .duLieuCu(currentStatus)
                        .duLieuMoi("HUY")
                        .lyDo("⚠️ HỦY RỦI RO CAO: " + completedCount + " hạng mục đã hoàn thành bị hủy. Lý do: "
                                + reason)
                        .nguoiThucHienId(user.getId())
                        .build());
            }
        }

        // RULE 341: Cannot cancel if parts exported (unless fully returned)
        boolean hasExport = !order.getPhieuXuatKho().isEmpty();
        if (hasExport) {
            boolean hasPendingItems = order.getChiTietDonHang().stream()
                    .anyMatch(item -> !item.getHangHoa().getLaDichVu() &&
                            item.getSoLuong() > 0 &&
                            !"KHACH_TU_CHOI".equals(item.getTrangThai()));

            if (hasPendingItems) {
                throw new RuntimeException(
                        "Không thể hủy đơn hàng đã xuất kho. Vui lòng hoàn nhập toàn bộ phụ tùng về kho trước.");
            }
        }

        checkOwnership(order, user);

        String oldStatus = order.getTrangThai();
        order.setTrangThai("HUY");
        orderRepository.save(order);

        // Log transition
        auditLogRepository.save(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("UPDATE")
                .duLieuCu(oldStatus)
                .duLieuMoi("HUY")
                .lyDo("Hủy đơn hàng: " + reason)
                .nguoiThucHienId(user.getId())
                .build());

        // Release reservations
        reservationService.releaseReservation(orderId, reason, user.getId());
    }

    // 8b. Update Deposit (Rule 10.4) -> Update to use Transaction
    @Transactional
    public void updateDeposit(Integer orderId, BigDecimal amount, User user) {
        // Delegate to Transaction Service for DEPOSIT with default CASH method (can be
        // improved later)
        transactionService.createTransaction(orderId, amount,
                com.gara.entity.FinancialTransaction.TransactionType.DEPOSIT,
                com.gara.entity.FinancialTransaction.PaymentMethod.CASH,
                null, "Cập nhật cọc nhanh", user.getId());
    }

    public void validateDeposit(RepairOrder order) {
        BigDecimal threshold = new BigDecimal("5000000");
        BigDecimal minRate = new BigDecimal("0.3");

        if (order.getTongCong().compareTo(threshold) > 0) {
            BigDecimal minDeposit = order.getTongCong().multiply(minRate);
            if (order.getTienCoc().compareTo(minDeposit) < 0) {
                throw new RuntimeException("Đơn hàng giá trị lớn (>5tr) yêu cầu đặt cọc tối thiểu 30% (" +
                        minDeposit.setScale(0, RoundingMode.HALF_UP) + " VNĐ). Hiện tại chỉ có: " +
                        order.getTienCoc().setScale(0, RoundingMode.HALF_UP) + " VNĐ.");
            }
        }
    }

    // 10. Create Warranty Order (Phase 9)
    @Transactional
    public Integer createWarrantyOrder(Integer originalOrderId, List<Integer> itemIds, Integer currentOdo, User user) {
        RepairOrder originalOrder = orderRepository.findById(originalOrderId)
                .orElseThrow(() -> new RuntimeException("Original Order not found"));

        if (!"HOAN_THANH".equals(originalOrder.getTrangThai()) && !"DONG".equals(originalOrder.getTrangThai())) {
            throw new RuntimeException("Chỉ có thể tạo bảo hành từ đơn hàng đã hoàn thành hoặc đóng.");
        }

        LocalDateTime now = LocalDateTime.now();
        Vehicle vehicle = originalOrder.getPhieuTiepNhan().getXe();

        // Update vehicle ODO if provided and higher
        if (currentOdo != null) {
            if (vehicle.getOdoHienTai() != null && currentOdo < vehicle.getOdoHienTai()) {
                throw new RuntimeException("Số ODO nhập vào (" + currentOdo
                        + ") không được nhỏ hơn ODO hiện tại của xe (" + vehicle.getOdoHienTai() + ").");
            }
            vehicle.setOdoHienTai(currentOdo);
            vehicleRepository.save(vehicle);
        }

        Integer currentVehicleOdo = vehicle.getOdoHienTai();
        Integer originalOdo = originalOrder.getPhieuTiepNhan().getOdo();
        if (originalOdo == null)
            originalOdo = 0; // Fallback

        // Create a new Reception for the warranty visit (because of @OneToOne
        // constraint)
        Reception warrantyVisit = Reception.builder()
                .xe(vehicle)
                .nguoiTiepNhan(user)
                .ngayGio(now)
                .odo(currentVehicleOdo)
                .yeuCauSoBo("Bảo hành theo đơn #" + originalOrderId)
                .mucXang(originalOrder.getPhieuTiepNhan().getMucXang()) // Copy fuel level as proxy
                .build();
        receptionRepository.save(warrantyVisit);

        RepairOrder warrantyOrder = RepairOrder.builder()
                .phieuTiepNhan(warrantyVisit)
                .nguoiPhuTrach(user)
                .trangThai("TIEP_NHAN")
                .laDonBaoHanh(true)
                .parentOrder(originalOrder)
                .ghiChu("Bảo hành theo đơn " + originalOrder.getId())
                .chiTietDonHang(new ArrayList<>())
                .build();

        List<OrderItem> warrantyItems = new ArrayList<>();
        for (Integer itemId : itemIds) {
            OrderItem originalItem = orderItemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

            if (!originalItem.getDonHangSuaChua().getId().equals(originalOrderId)) {
                throw new RuntimeException("Sản phẩm không thuộc đơn hàng gốc.");
            }

            // Validate Warranty Policy
            Product product = originalItem.getHangHoa();
            if (product.getBaoHanhSoThang() == 0 && product.getBaoHanhKm() == 0) {
                throw new RuntimeException("Hạng mục '" + product.getTenHang()
                        + "' không thuộc diện bảo hành (Không có chính sách bảo hành).");
            }

            boolean dateValid = true;
            if (product.getBaoHanhSoThang() > 0) {
                LocalDateTime expiryDate = originalOrder.getNgayTao().plusMonths(product.getBaoHanhSoThang());
                if (now.isAfter(expiryDate)) {
                    dateValid = false;
                }
            }

            boolean kmValid = true;
            if (product.getBaoHanhKm() > 0) {
                if (currentVehicleOdo > (originalOdo + product.getBaoHanhKm())) {
                    kmValid = false;
                }
            }

            if (!dateValid || !kmValid) {
                String reason = !dateValid ? "Hết hạn thời gian" : "Quá số KM bảo hành";
                throw new RuntimeException("Hạng mục '" + product.getTenHang() + "' đã hết hạn bảo hành: " + reason);
            }

            OrderItem newItem = OrderItem.builder()
                    .donHangSuaChua(warrantyOrder)
                    .hangHoa(originalItem.getHangHoa())
                    .soLuong(originalItem.getSoLuong())
                    .donGiaGoc(BigDecimal.ZERO)
                    .thanhTien(BigDecimal.ZERO)
                    .trangThai("CHO_SUA_CHUA")
                    .build();

            warrantyItems.add(newItem);
        }

        if (warrantyItems.isEmpty()) {
            throw new RuntimeException("Phải chọn ít nhất 1 sản phẩm để bảo hành.");
        }

        warrantyOrder.setChiTietDonHang(warrantyItems);
        orderRepository.save(warrantyOrder);

        auditLogRepository.save(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(warrantyOrder.getId())
                .hanhDong("CREATE_WARRANTY")
                .duLieuMoi("From Order " + originalOrderId)
                .nguoiThucHienId(user.getId())
                .build());

        return warrantyOrder.getId();
    }

    // 9. Close Order
    @Transactional
    public void closeOrder(Integer orderId, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // RULE 10.4: Only Admin can close order with DEBT
        // Recalculate real-time debt from transactions to ensure accuracy
        // RULE 10.4: Only Admin can close order with DEBT
        // Optimized: Recalculate real-time debt from DB
        BigDecimal totalPaid = transactionRepository.sumTotalPaidByOrderId(orderId);

        BigDecimal debt = order.getTongCong().subtract(totalPaid);

        if (debt.compareTo(BigDecimal.ZERO) > 0) {
            if (!"ADMIN".equals(user.getVaiTro())) {
                throw new RuntimeException("Đơn hàng chưa thanh toán đủ (Còn nợ: " +
                        debt + " VNĐ). Vui lòng thanh toán hết hoặc nhờ Admin duyệt đóng nợ.");
            }
        }

        checkOwnership(order, user);

        String oldStatus = order.getTrangThai();
        order.setTrangThai("DONG");
        orderRepository.save(order);

        // Log transition
        auditLogRepository.save(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("UPDATE")
                .duLieuCu(oldStatus)
                .duLieuMoi("DONG")
                .lyDo("Đóng đơn hàng")
                .nguoiThucHienId(user.getId())
                .build());
    }

    // ... helpers ...

    private void checkOwnership(RepairOrder order, User user) {
        if ("ADMIN".equals(user.getVaiTro()))
            return;

        if (order.getNguoiPhuTrach() != null && !order.getNguoiPhuTrach().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa đơn hàng của người khác");
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOrders(String status) {
        List<RepairOrder> orders;
        if (status != null && !status.isEmpty()) {
            if (status.contains(",")) {
                List<String> statuses = List.of(status.split(","));
                orders = orderRepository.findByTrangThaiInOrderByNgayTaoDesc(statuses);
            } else {
                orders = orderRepository.findByTrangThaiOrderByNgayTaoDesc(status);
            }
        } else {
            // Optimized: Use paginated query with JOIN FETCH instead of findAll()
            orders = orderRepository.findAllOrdersOptimized();
        }

        // Optimized: Batch load Transactions for all orders (N+1 Solution)
        List<Integer> orderIds = orders.stream().map(RepairOrder::getId).toList();
        List<FinancialTransaction> allTransactions = orderIds.isEmpty() ? new ArrayList<>()
                : transactionRepository.findByOrderIdIn(orderIds);

        // Group transactions by OrderID
        Map<Integer, List<FinancialTransaction>> transactionsByOrder = allTransactions.stream()
                .collect(Collectors.groupingBy(t -> t.getOrder().getId()));

        return orders.stream().map(o -> {
            // Calculate Financials from memory map
            List<FinancialTransaction> transactions = transactionsByOrder.getOrDefault(o.getId(), new ArrayList<>());

            BigDecimal totalPaid = transactions.stream()
                    .map(t -> switch (t.getType()) {
                        case DEPOSIT, PAYMENT -> t.getAmount();
                        case REFUND -> t.getAmount().negate();
                        default -> BigDecimal.ZERO;
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal finalAmount = o.getTongCong();
            BigDecimal debt = finalAmount.subtract(totalPaid);

            Map<String, Object> m = new HashMap<>();
            m.put("id", o.getId());
            m.put("createdAt", o.getNgayTao());
            m.put("plate", o.getPhieuTiepNhan().getXe().getBienSo());
            m.put("vehicleBrand", o.getPhieuTiepNhan().getXe().getNhanHieu());
            m.put("vehicleModel", o.getPhieuTiepNhan().getXe().getModel());
            m.put("customerName", o.getPhieuTiepNhan().getXe().getKhachHang().getHoTen());
            m.put("status", o.getTrangThai());
            m.put("grandTotal", finalAmount);
            m.put("debt", debt);
            return m;
        }).toList();
    }

    private void validateOrderModifiable(RepairOrder order) {
        String status = order.getTrangThai();
        // Allow modification only in early stages
        if ("CHO_THANH_TOAN".equals(status) || "HOAN_THANH".equals(status) ||
                "DONG".equals(status) || "HUY".equals(status)) {
            throw new RuntimeException("Không thể chỉnh sửa đơn hàng ở trạng thái " + status);
        }
    }

    private void recalculateTotals(RepairOrder order) {
        List<OrderItem> items = orderItemRepository.findByDonHangSuaChuaId(order.getId());

        BigDecimal totalGoods = BigDecimal.ZERO;
        BigDecimal totalServices = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;

        for (OrderItem item : items) {
            // Skip cancelled items (customer rejected)
            if ("KHACH_TU_CHOI".equals(item.getTrangThai())) {
                continue;
            }

            // Calculate Item Net Total (After Discount)
            BigDecimal quantity = BigDecimal.valueOf(item.getSoLuong());
            BigDecimal unitPrice = item.getDonGiaGoc();
            BigDecimal discountPercent = item.getGiamGiaPhanTram() != null
                    ? item.getGiamGiaPhanTram()
                    : BigDecimal.ZERO;

            BigDecimal rawTotal = unitPrice.multiply(quantity);
            BigDecimal discountAmount = rawTotal.multiply(discountPercent)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal netTotal = rawTotal.subtract(discountAmount);

            // Re-update item totals just to be sure (optional, but safe)
            // item.setThanhTien(netTotal);
            // item.setGiamGiaTien(discountAmount);
            // orderItemRepository.save(item); // Avoid N+1 saves if possible, assume
            // already saved

            // Classify
            if (item.getHangHoa().getLaDichVu()) {
                totalServices = totalServices.add(netTotal);
            } else {
                totalGoods = totalGoods.add(netTotal);
            }

            totalDiscount = totalDiscount.add(discountAmount);
        }

        // Calculate VAT (10% only for Goods)
        BigDecimal vatRate = new BigDecimal("0.10");
        BigDecimal vatAmount = totalGoods.multiply(vatRate).setScale(2, RoundingMode.HALF_UP);

        // Final Total
        BigDecimal grandTotal = totalGoods.add(totalServices).add(vatAmount);

        // Update Order
        order.setTongTienHang(totalGoods);
        order.setTongTienCong(totalServices);
        order.setChietKhauTong(totalDiscount);
        order.setThueVAT(vatAmount);
        order.setTongCong(grandTotal);

        // Update Debt (Assuming Debt = Total - Paid)
        BigDecimal paid = order.getSoTienDaTra() != null ? order.getSoTienDaTra() : BigDecimal.ZERO;
        BigDecimal debt = grandTotal.subtract(paid);
        order.setCongNo(debt.max(BigDecimal.ZERO));

        orderRepository.save(order);
    }

    // =================================================================================================
    // CUSTOMER PORTAL LOGIC (Refactored from CustomerController)
    // =================================================================================================

    @Transactional
    public void approveQuoteByCustomer(Integer orderId, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify ownership (Double check, though Controller also checks)
        // In Service we trust the user object passed is authenticated

        if (!"CHO_KH_DUYET".equals(order.getTrangThai()) && !"BAO_GIA_LAI".equals(order.getTrangThai())) {
            throw new RuntimeException("Đơn hàng không ở trạng thái chờ duyệt");
        }

        String oldStatus = order.getTrangThai();
        order.setTrangThai("DA_DUYET");
        order.setNgayDuyet(LocalDateTime.now());
        orderRepository.save(order);

        // Audit log
        auditLogRepository.save(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("APPROVE")
                .duLieuCu(oldStatus)
                .duLieuMoi("DA_DUYET")
                .lyDo("Khách hàng duyệt báo giá")
                .nguoiThucHienId(user.getId())
                .build());

        // Notify Sale
        if (order.getNguoiPhuTrach() != null) {
            notificationRepository.save(Notification.builder()
                    .userId(order.getNguoiPhuTrach().getId())
                    .role("SALE")
                    .title("Khách đã duyệt: " + order.getPhieuTiepNhan().getXe().getBienSo())
                    .content("Báo giá đã được duyệt. Tiến hành sửa chữa.")
                    .type("SUCCESS")
                    .link("/sale/orders/" + orderId)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }

        // Notify Mechanic
        notificationRepository.save(Notification.builder()
                .role("THO_SUA_CHUA")
                .title("Lệnh mới: " + order.getPhieuTiepNhan().getXe().getBienSo())
                .content("Báo giá được duyệt, sẵn sàng nhận việc.")
                .type("INFO")
                .link("/mechanic/jobs/" + orderId)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        // Notify Warehouse (CRITICAL MISSING FEATURE RESTORED)
        boolean hasParts = order.getChiTietDonHang().stream().anyMatch(i -> !i.getHangHoa().getLaDichVu());
        if (hasParts) {
            notificationRepository.save(Notification.builder()
                    .role("KHO")
                    .title("Phiếu xuất kho mới: " + order.getPhieuTiepNhan().getXe().getBienSo())
                    .content("Đơn hàng đã được duyệt bởi khách. Vui lòng chuẩn bị vật tư.")
                    .type("INFO")
                    .link("/warehouse/export/" + order.getId())
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }
    }

    @Transactional
    public void rejectQuoteByCustomer(Integer orderId, String reason, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"CHO_KH_DUYET".equals(order.getTrangThai()) && !"BAO_GIA_LAI".equals(order.getTrangThai())) {
            throw new RuntimeException("Đơn hàng không ở trạng thái chờ duyệt");
        }

        String actualReason = (reason == null || reason.isEmpty()) ? "Không rõ lý do" : reason;
        String oldStatus = order.getTrangThai();
        order.setTrangThai("HUY");
        orderRepository.save(order);

        // Audit log
        auditLogRepository.save(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("REJECT")
                .duLieuCu(oldStatus)
                .duLieuMoi("HUY")
                .lyDo("Khách hàng từ chối: " + actualReason)
                .nguoiThucHienId(user.getId())
                .build());

        // Notify Sale
        if (order.getNguoiPhuTrach() != null) {
            notificationRepository.save(Notification.builder()
                    .userId(order.getNguoiPhuTrach().getId())
                    .role("SALE")
                    .title("Báo giá bị từ chối: " + order.getPhieuTiepNhan().getXe().getBienSo())
                    .content("Lý do: " + actualReason)
                    .type("WARNING")
                    .link("/sale/orders/" + orderId)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }

        // Release reservations
        reservationService.releaseReservation(orderId, "Khách hàng từ chối báo giá", user.getId());
    }

    @Transactional
    public void requestRevisionByCustomer(Integer orderId, String note, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"CHO_KH_DUYET".equals(order.getTrangThai())) {
            throw new RuntimeException("Chỉ có thể yêu cầu chỉnh sửa khi đang chờ duyệt");
        }

        String oldStatus = order.getTrangThai();
        order.setTrangThai("BAO_GIA_LAI");
        order.setGhiChu(note);
        orderRepository.save(order);

        // Audit log
        auditLogRepository.save(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("REQUEST_REVISION")
                .duLieuCu(oldStatus)
                .duLieuMoi("BAO_GIA_LAI")
                .lyDo("Khách yêu cầu chỉnh sửa: " + note)
                .nguoiThucHienId(user.getId())
                .build());

        // Notify Sale
        if (order.getNguoiPhuTrach() != null) {
            notificationRepository.save(Notification.builder()
                    .userId(order.getNguoiPhuTrach().getId())
                    .role("SALE")
                    .title("Yêu cầu chỉnh báo giá: " + order.getPhieuTiepNhan().getXe().getBienSo())
                    .content("Khách hàng yêu cầu chỉnh sửa báo giá. Ghi chú: " + note)
                    .type("WARNING")
                    .link("/sale/orders/" + orderId)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }
    }
}
