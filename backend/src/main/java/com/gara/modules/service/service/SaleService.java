package com.gara.modules.service.service;

import com.gara.modules.inventory.service.InventoryReservationService;
import com.gara.modules.finance.service.TransactionService;

import com.gara.entity.*;
import com.gara.modules.inventory.repository.*;
import com.gara.modules.service.repository.*;
import com.gara.modules.customer.repository.*;
import com.gara.modules.finance.repository.*;
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
import com.gara.entity.enums.OrderStatus;
import com.gara.entity.enums.ItemStatus;

@Service
public class SaleService {

    private final RepairOrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final InventoryReservationService reservationService;
    private final FinancialTransactionRepository transactionRepository;
    private final VehicleRepository vehicleRepository;
    private final ReceptionRepository receptionRepository;
    private final TransactionService transactionService;
    private final com.gara.modules.support.service.AsyncAuditService asyncAuditService;
    private final com.gara.modules.support.service.AsyncNotificationService asyncNotificationService;
    private final jakarta.persistence.EntityManager entityManager;
    private final OrderCalculationService orderCalculationService;

    private final com.gara.modules.inventory.service.WarehouseService warehouseService;
    private final com.gara.modules.support.service.SseService sseService;

    public SaleService(RepairOrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            InventoryReservationService reservationService,
            FinancialTransactionRepository transactionRepository,
            VehicleRepository vehicleRepository,
            ReceptionRepository receptionRepository,
            TransactionService transactionService,
            com.gara.modules.support.service.AsyncAuditService asyncAuditService,
            com.gara.modules.support.service.AsyncNotificationService asyncNotificationService,
            jakarta.persistence.EntityManager entityManager,
            OrderCalculationService orderCalculationService,
            com.gara.modules.inventory.service.WarehouseService warehouseService,
            com.gara.modules.support.service.SseService sseService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.reservationService = reservationService;
        this.transactionRepository = transactionRepository;
        this.vehicleRepository = vehicleRepository;
        this.receptionRepository = receptionRepository;
        this.transactionService = transactionService;
        this.asyncAuditService = asyncAuditService;
        this.asyncNotificationService = asyncNotificationService;
        this.entityManager = entityManager;
        this.warehouseService = warehouseService;
        this.orderCalculationService = orderCalculationService;
        this.sseService = sseService;
    }

    @Transactional
    public void claimOrder(Integer orderId, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));

        // Nếu đã có người phụ trách
        if (order.getNguoiPhuTrach() != null) {
            if (order.getNguoiPhuTrach().getId().equals(user.getId())) {
                return; // Đã nhận trước đó rồi
            }
            throw new RuntimeException("Đơn hàng đã được nhân viên " + order.getNguoiPhuTrach().getHoTen() + " tiếp nhận.");
        }

        // Gán người phụ trách (Cố vấn dịch vụ)
        order.setNguoiPhuTrach(user);
        orderRepository.save(order);

        // Audit Log
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("CLAIM")
                .lyDo("Cố vấn dịch vụ tiếp nhận đơn hàng")
                .nguoiThucHienId(user.getId())
                .build());

        // Broadcast Real-time
        Map<String, Object> sseData = new HashMap<>();
        sseData.put("orderId", orderId);
        sseData.put("claimedBy", user.getHoTen());
        sseData.put("claimedById", user.getId());
        sseService.broadcast("order_claimed", sseData);
    }

    // 7. Get Dashboard Stats
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        // Count all active vehicles in garage (not closed/cancelled)
        long countWaiting = orderRepository.countByTrangThaiIn(
                List.of(OrderStatus.TIEP_NHAN, OrderStatus.CHO_CHAN_DOAN, OrderStatus.BAO_GIA, OrderStatus.BAO_GIA_LAI,
                        OrderStatus.CHO_KH_DUYET, OrderStatus.DA_DUYET, OrderStatus.CHO_SUA_CHUA, OrderStatus.DANG_SUA,
                        OrderStatus.CHO_KCS, OrderStatus.CHO_THANH_TOAN));
        long countPendingQuotes = orderRepository.countByTrangThai(OrderStatus.CHO_KH_DUYET);
        long countPendingPayment = orderRepository.countByTrangThai(OrderStatus.CHO_THANH_TOAN);

        // Waiting Vehicles List (Recently received - all active, not just TIEP_NHAN)
        List<RepairOrder> waitingOrders = orderRepository.findByStatusesOptimized(
                List.of(OrderStatus.TIEP_NHAN, OrderStatus.CHO_CHAN_DOAN));
        List<DashboardStatsDTO.DashboardVehicleDTO> waitingVehicles = waitingOrders.stream()
                .limit(5)
                .map(o -> {
                    String plate = "N/A";
                    String customer = "N/A";
                    String receptionist = "N/A";

                    if (o.getPhieuTiepNhan() != null) {
                        if (o.getPhieuTiepNhan().getXe() != null) {
                            plate = o.getPhieuTiepNhan().getXe().getBienSo();
                            if (o.getPhieuTiepNhan().getXe().getKhachHang() != null) {
                                customer = o.getPhieuTiepNhan().getXe().getKhachHang().getHoTen();
                            }
                        }
                        if (o.getPhieuTiepNhan().getNguoiTiepNhan() != null) {
                            receptionist = o.getPhieuTiepNhan().getNguoiTiepNhan().getHoTen();
                        }
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
                    String plate = "N/A";
                    if (o.getPhieuTiepNhan() != null && o.getPhieuTiepNhan().getXe() != null) {
                        plate = o.getPhieuTiepNhan().getXe().getBienSo();
                    }

                    return DashboardStatsDTO.DashboardOrderDTO.builder()
                            .id(o.getId())
                            .plate(plate)
                            .total(o.getTongCong())
                            .status(o.getTrangThai().name())
                            .build();
                })
                .toList();

        return DashboardStatsDTO.builder()
                .countWaiting(countWaiting)
                .countPendingQuotes(countPendingQuotes)
                .countPendingPayment(countPendingPayment)
                .countWarranty(orderItemRepository.countWarrantyItems())
                .waitingVehicles(waitingVehicles)
                .recentOrders(recentOrders)
                .build();
    }

    // 1. Get Order Details
    @Transactional(readOnly = true)
    public OrderDetailDTO getOrderDetails(Integer orderId) {
        RepairOrder order = orderRepository.findByIdWithFullDetails(orderId)
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
                        .itemStatus(i.getTrangThai().name())
                        .stock(i.getHangHoa().getSoLuongTon())
                        .proposedById(i.getNguoiDeXuatId())
                        .proposedByName(i.getNguoiDeXuat() != null ? i.getNguoiDeXuat().getHoTen() : null)
                        .proposedByRole(i.getNguoiDeXuat() != null && i.getNguoiDeXuat().getRoles() != null
                                ? i.getNguoiDeXuat().getRoles().stream()
                                        .map(r -> r.getName()).findFirst().orElse(null)
                                : null)
                        .isWarranty(i.getTrangThai() != null && i.getTrangThai().name().contains("WARRANTY"))
                        .isTechnicalAddition(i.getLaPhatSinh())
                        .proposedAt(i.getNgayDeXuat())
                        .assignments(i.getPhanCongTho() != null ? i.getPhanCongTho().stream()
                                .map(a -> new AssignmentDTO(
                                        a.getId(),
                                        a.getTho().getId(),
                                        a.getTho().getHoTen(),
                                        a.getLaThoChinh()))
                                .collect(java.util.stream.Collectors.toList()) : new java.util.ArrayList<>())
                        .version(i.getVersion())
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
                .status(order.getTrangThai().name())
                .plateNumber(order.getPhieuTiepNhan().getXe().getBienSo())
                .customerName(order.getPhieuTiepNhan().getXe().getKhachHang().getHoTen())
                .customerPhone(order.getPhieuTiepNhan().getXe().getKhachHang().getSoDienThoai())
                .carBrand(order.getPhieuTiepNhan().getXe().getNhanHieu())
                .carModel(order.getPhieuTiepNhan().getXe().getModel())
                .createdAt(order.getNgayTao())
                .items(items)
                .discount(order.getChietKhauTong())
                .tax(order.getThueVAT())
                .vatPercent(order.getVatPhanTram())
                .totalAmount((order.getTongTienHang() != null ? order.getTongTienHang() : BigDecimal.ZERO)
                        .add(order.getTongTienCong() != null ? order.getTongTienCong() : BigDecimal.ZERO))
                .finalAmount(finalAmount)
                .paidAmount(totalPaid)
                .deposit(deposit)
                .thoChanDoanId(order.getThoChanDoan() != null ? order.getThoChanDoan().getId() : null)
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

        if (!user.hasPermission("CREATE_RECEPTION") && !user.hasPermission("CREATE_PROPOSAL") && !user.isAdmin()) {
            throw new RuntimeException("Bạn không có quyền thêm hạng mục vào đơn hàng.");
        }

        checkOwnership(order, user);
        validateOrderModifiable(order);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        OrderItem item = new OrderItem();
        item.setDonHangSuaChua(order);
        item.setHangHoa(product);
        if (product.getLaDichVu()) {
            quantity = 1;
        } else if (quantity <= 0) {
            throw new RuntimeException("Số lượng phải lớn hơn 0");
        }

        BigDecimal unitPrice = product.getGiaBanNiemYet();
        BigDecimal rawTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

        item.setSoLuong(quantity);
        item.setDonGiaGoc(unitPrice);
        item.setVatPhanTram(BigDecimal.ZERO);
        item.setTienThue(BigDecimal.ZERO);
        item.setThanhTien(rawTotal);

        // Handle Arising Issues (Rule 3.3)
        OrderStatus status = order.getTrangThai();
        if (OrderStatus.DA_DUYET.equals(status) || OrderStatus.DANG_SUA.equals(status)) {
            item.setTrangThai(ItemStatus.CHO_KY_THUAT_DUYET); // Arising issue needs technical approval first
        } else {
            item.setTrangThai(ItemStatus.KHACH_DONG_Y); // Initial quote building
        }

        // Track who proposed this item
        item.setNguoiDeXuat(user);

        orderItemRepository.save(item);

        // CRITICAL: Force refresh order from DB to synchronize collection
        entityManager.flush();
        entityManager.refresh(order);

        orderCalculationService.recalculateTotals(order);
    }

    // 4. Update Item
    @Transactional
    public void updateItem(Integer itemId, Integer quantity, Double discountPercent, Integer version, User user) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (version != null && !item.getVersion().equals(version)) {
            throw new RuntimeException("Dữ liệu hạng mục đã được thay đổi bởi người khác. Vui lòng tải lại trang.");
        }
        checkOwnership(item.getDonHangSuaChua(), user);
        validateOrderModifiable(item.getDonHangSuaChua());

        // Rule 10.2: Cannot edit approved items, only Arising (DE_XUAT) items
        OrderStatus orderStatus = item.getDonHangSuaChua().getTrangThai();
        if (OrderStatus.DA_DUYET.equals(orderStatus) || OrderStatus.DANG_SUA.equals(orderStatus)) {
            if (!ItemStatus.DE_XUAT.equals(item.getTrangThai())) {
                throw new RuntimeException("Không thể chỉnh sửa hạng mục đã được duyệt (Báo giá gốc).");
            }
        }

        BigDecimal oldThanhTien = item.getThanhTien() != null ? item.getThanhTien() : BigDecimal.ZERO;

        if (item.getHangHoa().getLaDichVu()) {
            item.setSoLuong(1);
        } else if (quantity != null && quantity > 0) {
            item.setSoLuong(quantity);
        }

        if (discountPercent != null) {
            if (discountPercent < 0 || discountPercent > 100) {
                throw new RuntimeException("Chiết khấu phải từ 0% đến 100%");
            }
            item.setGiamGiaPhanTram(BigDecimal.valueOf(discountPercent));
        }

        // Calculations are handled centrally in OrderCalculationService.recalculateTotals
        BigDecimal rawSubtotal = item.getDonGiaGoc().multiply(BigDecimal.valueOf(item.getSoLuong()));
        
        // Clear per-item tax/discount complexity for now as logic moved to global
        item.setThanhTien(rawSubtotal);
        orderItemRepository.save(item);

        // Only update order totals if item is NOT rejected
        if (!ItemStatus.KHACH_TU_CHOI.equals(item.getTrangThai())) {
            BigDecimal delta = rawSubtotal.subtract(oldThanhTien);
            if (delta.compareTo(BigDecimal.ZERO) != 0) {
                orderCalculationService.updateTotalsIncrementally(
                    item.getDonHangSuaChua().getId(), 
                    delta, 
                    item.getHangHoa() != null && item.getHangHoa().getLaDichVu()
                );
            }
        }
    }

    // 4b. Update Item Status (Approve/Reject)
    @Transactional
    public void updateItemStatus(Integer itemId, ItemStatus status, User user) {
        // First lock the item to prevent concurrent status updates from spam clicking
        orderItemRepository.findByIdWithLock(itemId);

        // Then fetch full details
        OrderItem item = orderItemRepository.findByIdWithFullDetails(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        checkOwnership(item.getDonHangSuaChua(), user);
        
        // Security check: Items proposed by SALE cannot have their status toggled (Reserved for Technical Arising)
        if (item.getNguoiDeXuat() != null && item.getNguoiDeXuat().getRoles() != null) {
            boolean isSaleProposal = item.getNguoiDeXuat().getRoles().stream()
                    .anyMatch(r -> r.getName().toUpperCase().contains("SALE"));
            if (isSaleProposal) {
                throw new RuntimeException("Hạng mục do nhân viên Sale đề xuất không thể thay đổi trạng thái duyệt.");
            }
        }

        ItemStatus oldStatus = item.getTrangThai();
        item.setTrangThai(status);
        orderItemRepository.save(item);

        // Delta logic: Skip if status rejected by customer
        BigDecimal delta = BigDecimal.ZERO;
        if (!ItemStatus.KHACH_TU_CHOI.equals(oldStatus) && ItemStatus.KHACH_TU_CHOI.equals(status)) {
            delta = item.getThanhTien().negate();
        } else if (ItemStatus.KHACH_TU_CHOI.equals(oldStatus) && !ItemStatus.KHACH_TU_CHOI.equals(status)) {
            delta = item.getThanhTien();
        }

        if (delta.compareTo(BigDecimal.ZERO) != 0) {
            orderCalculationService.updateTotalsIncrementally(
                item.getDonHangSuaChua().getId(), 
                delta, 
                item.getHangHoa() != null && item.getHangHoa().getLaDichVu()
            );
        }
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
        OrderStatus orderStatus = order.getTrangThai();
        if (OrderStatus.DA_DUYET.equals(orderStatus) || OrderStatus.DANG_SUA.equals(orderStatus)) {
            if (!ItemStatus.DE_XUAT.equals(item.getTrangThai())) {
                throw new RuntimeException("Không thể xóa hạng mục đã được duyệt (Báo giá gốc).");
            }
        }

        // Audit Log for Deletion (Micro-rule)
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("ChiTietDonHang")
                .banGhiId(order.getId())
                .hanhDong("DELETE")
                .duLieuCu("Deleted Item: " + item.getHangHoa().getTenHang() + " (Qty: " + item.getSoLuong() + ")")
                .lyDo("Xóa hạng mục khỏi đơn hàng")
                .nguoiThucHienId(user.getId())
                .build());

        order.getChiTietDonHang().remove(item);
        BigDecimal currentVal = item.getThanhTien();
        boolean isLabor = item.getHangHoa() != null && item.getHangHoa().getLaDichVu();
        boolean wasIncluded = !ItemStatus.KHACH_TU_CHOI.equals(item.getTrangThai());

        orderItemRepository.delete(item);

        if (wasIncluded) {
            orderCalculationService.updateTotalsIncrementally(order.getId(), currentVal.negate(), isLabor);
        }
    }

    // 6. Send Quote to Customer
    @Transactional
    public void submitToCustomer(Integer orderId, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        checkOwnership(order, user);

        if (order.getThoChanDoan() == null) {
            throw new RuntimeException("Chưa có kết quả chẩn đoán từ kỹ thuật viên. Sale không thể gửi báo giá.");
        }

        if (user.getId() == null) {
            throw new RuntimeException("Lỗi hệ thống: User ID không tồn tại. Vui lòng đăng nhập lại.");
        }

        OrderStatus oldStatus = order.getTrangThai();
        // Bug 71 Fix: Strict State Machine Transition
        validateTransition(oldStatus, OrderStatus.CHO_KH_DUYET);

        order.setTrangThai(OrderStatus.CHO_KH_DUYET);
        orderRepository.save(order);

        // Log transition
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("UPDATE")
                .duLieuCu(oldStatus.name())
                .duLieuMoi(OrderStatus.CHO_KH_DUYET.name())
                .lyDo("Gửi báo giá cho khách")
                .nguoiThucHienId(user.getId())
                .build());

        // Reserve inventory when waiting for customer approval
        reservationService.createReservation(orderId, user.getId());

        // Notify Customer (Rule 9.3.1)
        Customer customer = order.getPhieuTiepNhan().getXe().getKhachHang();
        if (customer.getUserId() != null) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
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

    /**
     * Update global discount and VAT percentage for an order and recalculate totals.
     */
    @Transactional
    public void updateOrderTotals(Integer orderId, BigDecimal discount, BigDecimal vatPercent, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        checkOwnership(order, user);
        validateOrderModifiable(order);

        if (discount != null) {
            order.setChietKhauTong(discount);
        }
        if (vatPercent != null) {
            order.setVatPhanTram(vatPercent);
        }

        orderCalculationService.recalculateTotals(order);
        orderRepository.save(order);

        // Audit log
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("UPDATE")
                .lyDo("Cập nhật chiết khấu/VAT tổng: " + discount + "/" + vatPercent)
                .nguoiThucHienId(user.getId())
                .build());
    }

    // 6c. Submit Replenishment Quote (For Technical Issues found mid-repair)
    @Transactional
    public void submitReplenishmentQuote(Integer orderId, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        checkOwnership(order, user);

        OrderStatus oldStatus = order.getTrangThai();
        // Bug 71 Fix: Strict State Machine Transition
        // Replenishment only allowed from DANG_SUA (mid-repair)
        validateTransition(oldStatus, OrderStatus.BAO_GIA_LAI);

        // Filter items that are in 'DE_XUAT' status (Proposed by manager after technical review)
        List<OrderItem> proposedItems = order.getChiTietDonHang().stream()
                .filter(i -> ItemStatus.DE_XUAT.equals(i.getTrangThai()))
                .toList();

        if (proposedItems.isEmpty()) {
            throw new RuntimeException("Không có hạng mục phát sinh nào đã được duyệt kỹ thuật để báo giá.");
        }

        order.setTrangThai(OrderStatus.BAO_GIA_LAI);
        orderRepository.save(order);

        // Log transition
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("UPDATE")
                .duLieuCu(oldStatus.name())
                .duLieuMoi(OrderStatus.BAO_GIA_LAI.name())
                .lyDo("Gửi báo giá bổ sung cho các hạng mục phát sinh đã duyệt kỹ thuật")
                .nguoiThucHienId(user.getId())
                .build());

        // Notify customer about replenishment quote
        Customer repCustomer = order.getPhieuTiepNhan().getXe().getKhachHang();
        if (repCustomer.getUserId() != null) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .userId(repCustomer.getUserId())
                    .role("CUSTOMER")
                    .title("Báo giá bổ sung: " + order.getPhieuTiepNhan().getXe().getBienSo())
                    .content("Hệ thống đã cập nhật báo giá cho các hạng mục phát sinh mới. Vui lòng xem và duyệt.")
                    .type("WARNING")
                    .link("/customer/progress") // Customer can now go to progress page and follow the link to details
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }

        // Create reservations for these new items
        reservationService.createReservation(orderId, user.getId());
    }

    // 6b. Finalize Order (Customer Approved)
    @Transactional
    public void finalizeOrder(Integer orderId, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        checkOwnership(order, user);

        if (order.getThoChanDoan() == null) {
            throw new RuntimeException("Chưa có kết quả chẩn đoán từ kỹ thuật viên. Không thể duyệt báo giá.");
        }

        if (order.getChiTietDonHang().isEmpty()) {
            throw new RuntimeException("Đơn hàng không có bất kỳ hạng mục nào. Vui lòng kiểm tra lại.");
        }

        // Bug 98 Fix: Ensure at least one item is approved/active
        boolean hasApprovedItems = order.getChiTietDonHang().stream()
                .anyMatch(i -> List.of(ItemStatus.KHACH_DONG_Y, ItemStatus.CHO_SUA_CHUA, ItemStatus.DANG_SUA, ItemStatus.HOAN_THANH)
                        .contains(i.getTrangThai()));

        if (!hasApprovedItems) {
            throw new RuntimeException("Đơn hàng phải có ít nhất một hạng mục được duyệt để tiếp tục.");
        }

        if (user.getId() == null) {
            throw new RuntimeException(
                    "Lỗi hệ thống: User ID không tồn tại trong phiên đăng nhập. Vui lòng đăng xuất và đăng nhập lại.");
        }

        OrderStatus oldStatus = order.getTrangThai();

        // Bug 71 Fix: Idempotency & Strict Transition
        if (OrderStatus.DA_DUYET.equals(oldStatus)) {
            return; // Already approved, do nothing
        }

        // Force transition from CHO_KH_DUYET or BAO_GIA_LAI
        validateTransition(oldStatus, OrderStatus.DA_DUYET);

        // Rule: Only move to DA_DUYET if approved by customer
        order.setTrangThai(OrderStatus.DA_DUYET);
        order.setNgayDuyet(LocalDateTime.now());
        orderRepository.save(order);

        // Log transition
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("UPDATE")
                .duLieuCu(oldStatus.name())
                .duLieuMoi(OrderStatus.DA_DUYET.name())
                .lyDo("Khách hàng đã duyệt báo giá")
                .nguoiThucHienId(user.getId())
                .build());

        // Notify Sale Advisor if someone else (e.g., Manager) approved the quote
        if (order.getNguoiPhuTrach() != null && !order.getNguoiPhuTrach().getId().equals(user.getId())) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .userId(order.getNguoiPhuTrach().getId())
                    .role("SALE")
                    .title("Báo giá được duyệt: " + order.getPhieuTiepNhan().getXe().getBienSo())
                    .content(user.getHoTen() + " đã duyệt báo giá. Xe có thể bắt đầu sửa chữa.")
                    .type("SUCCESS")
                    .link("/sale/orders/" + order.getId())
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }

        // Notify Workshop Manager to assign/manage
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("QUAN_LY_XUONG")
                .title("Đơn hàng được duyệt: " + order.getPhieuTiepNhan().getXe().getBienSo())
                .content("Khách hàng đã duyệt báo giá. Vui lòng phân công thợ sửa chữa.")
                .type("SUCCESS")
                .link("/manager/orders/" + order.getId())
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        // Notify Repair Mechanic
        asyncNotificationService.pushUniqueAsync(Notification.builder()
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
            asyncNotificationService.pushUniqueAsync(Notification.builder()
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

        OrderStatus currentStatus = order.getTrangThai();

        // RULE: Cannot cancel COMPLETED or CLOSED orders
        if (OrderStatus.HOAN_THANH.equals(currentStatus) || OrderStatus.DONG.equals(currentStatus)) {
            throw new RuntimeException(
                    "Không thể hủy đơn hàng đã hoàn thành/đóng. Liên hệ Admin nếu cần.");
        }

        // RULE: Warn when canceling during repair with completed items
        if (OrderStatus.DANG_SUA.equals(currentStatus) || OrderStatus.CHO_SUA_CHUA.equals(currentStatus)) {
            long completedCount = order.getChiTietDonHang().stream()
                    .filter(item -> ItemStatus.HOAN_THANH.equals(item.getTrangThai()))
                    .count();

            if (completedCount > 0) {
                // Allow cancel but log as HIGH RISK action
                asyncAuditService.logAsync(AuditLog.builder()
                        .bang("DonHangSuaChua")
                        .banGhiId(orderId)
                        .hanhDong("CANCEL_RISK")
                        .duLieuCu(currentStatus.name())
                        .duLieuMoi(OrderStatus.HUY.name())
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
                            !ItemStatus.KHACH_TU_CHOI.equals(item.getTrangThai()));

            if (hasPendingItems) {
                throw new RuntimeException(
                        "Không thể hủy đơn hàng đã xuất kho. Vui lòng hoàn nhập toàn bộ phụ tùng về kho trước.");
            }
        }

        checkOwnership(order, user);

        OrderStatus oldStatus = order.getTrangThai();
        BigDecimal oldTongCong = order.getTongCong();
        BigDecimal oldTienDaTra = order.getSoTienDaTra();

        order.setTrangThai(OrderStatus.HUY);
        order.setGhiChuHuy(reason);

        order.setTongCong(oldTienDaTra != null ? oldTienDaTra : BigDecimal.ZERO);
        order.setCongNo(BigDecimal.ZERO);

        orderRepository.save(order);

        // Bug 126 Fix: Handle Refund/Credit if order was partially/fully paid
        if (oldTienDaTra != null && oldTienDaTra.compareTo(BigDecimal.ZERO) > 0) {
            transactionService.createTransaction(
                orderId, 
                oldTienDaTra, 
                FinancialTransaction.TransactionType.REFUND, 
                FinancialTransaction.PaymentMethod.CASH, // Default to cash for reconciliation
                null, 
                "Hoàn tiền do hủy đơn hàng #" + orderId + ". Lý do: " + reason, 
                user.getId()
            );
        }

        // Rule 8.4: Notification
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("SALE")
                .title("Đơn hàng đã hủy: " + order.getPhieuTiepNhan().getXe().getBienSo())
                .content("Lý do: " + reason)
                .type("WARNING")
                .link("/sale/orders/" + orderId)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        // RELEASE and RETURN stock (Bug 73: Zombie Inventory)
        reservationService.releaseReservation(orderId, reason, user.getId());

        // Explicitly return stock for items already exported (CONVERTED state in
        // reservation)
        warehouseService.returnStockFromCancelledOrder(orderId, user.getId());

        // Log transition
        String riskPrefix = (oldTienDaTra != null && oldTienDaTra.compareTo(BigDecimal.ZERO) > 0)
                ? "⚠️ CANCELED WITH PAYMENT: "
                : "";

        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("UPDATE")
                .duLieuCu(oldStatus.name() + " (Amount: " + oldTongCong + ")")
                .duLieuMoi(OrderStatus.HUY.name() + " (Amount: " + order.getTongCong() + ")")
                .lyDo(riskPrefix + "Hủy đơn hàng: " + reason)
                .nguoiThucHienId(user.getId())
                .build());
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

        if (!OrderStatus.HOAN_THANH.equals(originalOrder.getTrangThai())
                && !OrderStatus.DONG.equals(originalOrder.getTrangThai())) {
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
                .trangThai(OrderStatus.TIEP_NHAN)
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

            // Bug 128 Fix: Prevent duplicate warranty claims
            if (originalItem.getDaBaoHanh()) {
                throw new RuntimeException("Hạng mục '" + product.getTenHang() + "' đã được bảo hành trước đó.");
            }

            OrderItem newItem = OrderItem.builder()
                    .donHangSuaChua(warrantyOrder)
                    .hangHoa(originalItem.getHangHoa())
                    .soLuong(originalItem.getSoLuong())
                    .donGiaGoc(BigDecimal.ZERO)
                    .thanhTien(BigDecimal.ZERO)
                    .trangThai(ItemStatus.CHO_SUA_CHUA)
                    .laHangBaoHanh(true) // Mark this as a warranty replacement
                    .build();

            warrantyItems.add(newItem);
            
            // Mark original item as warrantied
            originalItem.setDaBaoHanh(true);
            orderItemRepository.save(originalItem);
        }

        if (warrantyItems.isEmpty()) {
            throw new RuntimeException("Phải chọn ít nhất 1 sản phẩm để bảo hành.");
        }

        warrantyOrder.setChiTietDonHang(warrantyItems);
        orderRepository.save(warrantyOrder);

        // Bug 129 Fix: Reserve stock for warranty items immediately
        reservationService.createReservation(warrantyOrder.getId(), user.getId());

        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(warrantyOrder.getId())
                .hanhDong("CREATE_WARRANTY")
                .duLieuMoi("From Order " + originalOrderId)
                .nguoiThucHienId(user.getId())
                .build());

        // Notify Quản lý xưởng
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("QUAN_LY_XUONG")
                .title("Xe bảo hành chờ chẩn đoán: " + vehicle.getBienSo())
                .content("Xe " + vehicle.getBienSo() + " vào bảo hành. Vui lòng xếp lịch/chẩn đoán.")
                .type("WARNING")
                .link("/mechanic/jobs")
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        // Notify Sale tạo lệnh
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("SALE")
                .title("Tạo lệnh bảo hành: " + vehicle.getBienSo())
                .content("Lệnh bảo hành cho xe " + vehicle.getBienSo() + " đã được tạo.")
                .type("INFO")
                .link("/sale/orders/" + warrantyOrder.getId())
                .createdAt(LocalDateTime.now())
                .isRead(false)
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
            if (!user.isAdmin()) {
                throw new RuntimeException("Đơn hàng chưa thanh toán đủ (Còn nợ: " +
                        debt + " VNĐ). Vui lòng thanh toán hết hoặc nhờ Admin duyệt đóng nợ.");
            }
        }

        checkOwnership(order, user);

        OrderStatus oldStatus = order.getTrangThai();
        // Bug 71 Fix: Strict State Machine Transition
        validateTransition(oldStatus, OrderStatus.DONG);

        order.setTrangThai(OrderStatus.DONG);
        orderRepository.save(order);

        // Log transition
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("UPDATE")
                .duLieuCu(oldStatus.name())
                .duLieuMoi(OrderStatus.DONG.name())
                .lyDo("Đóng đơn hàng")
                .nguoiThucHienId(user.getId())
                .build());
    }

    // ... helpers ...

    private void checkOwnership(RepairOrder order, User user) {
        if (user.isAdmin())
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
                List<OrderStatus> statuses = List.of(status.split(",")).stream()
                        .map(OrderStatus::valueOf)
                        .collect(Collectors.toList());
                orders = orderRepository.findByStatusesOptimized(statuses);
            } else {
                orders = orderRepository.findByStatusOptimized(OrderStatus.valueOf(status));
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
            m.put("status", o.getTrangThai().name());
            m.put("grandTotal", finalAmount);
            m.put("debt", debt);
            return m;
        }).toList();
    }

    private void validateOrderModifiable(RepairOrder order) {
        OrderStatus status = order.getTrangThai();
        // Allow modification only in early stages
        if (OrderStatus.CHO_THANH_TOAN.equals(status) || OrderStatus.HOAN_THANH.equals(status) ||
                OrderStatus.DONG.equals(status) || OrderStatus.HUY.equals(status)) {
            throw new RuntimeException("Không thể chỉnh sửa đơn hàng ở trạng thái " + status.getDescription());
        }
    }

    // Bug 71 Fix: Strict State Machine Transition Helper
    private void validateTransition(OrderStatus current, OrderStatus next) {
        // Allow transition to HUY (Cancel) from almost any state except finished ones
        if (next == OrderStatus.HUY) {
            if (current == OrderStatus.DONG || current == OrderStatus.HOAN_THANH) {
                throw new RuntimeException("Không thể hủy đơn hàng đã hoàn thành hoặc đã đóng.");
            }
            return;
        }

        boolean isValid = switch (next) {
            case TIEP_NHAN -> current == null;
            case CHO_CHAN_DOAN -> current == OrderStatus.TIEP_NHAN;
            case BAO_GIA -> current == OrderStatus.CHO_CHAN_DOAN || current == OrderStatus.BAO_GIA_LAI;
            case CHO_KH_DUYET -> current == OrderStatus.BAO_GIA || current == OrderStatus.CHO_CHAN_DOAN;
            case DA_DUYET -> current == OrderStatus.CHO_KH_DUYET || current == OrderStatus.BAO_GIA_LAI;
            case CHO_SUA_CHUA -> current == OrderStatus.DA_DUYET;
            case DANG_SUA -> current == OrderStatus.CHO_SUA_CHUA || current == OrderStatus.DANG_SUA;
            case CHO_KCS -> current == OrderStatus.DANG_SUA;
            case CHO_THANH_TOAN -> current == OrderStatus.CHO_KCS || current == OrderStatus.DA_DUYET;
            case HOAN_THANH -> current == OrderStatus.CHO_THANH_TOAN;
            case DONG -> current == OrderStatus.HOAN_THANH || current == OrderStatus.CHO_THANH_TOAN;
            case BAO_GIA_LAI -> current == OrderStatus.DANG_SUA || current == OrderStatus.CHO_KH_DUYET
                    || current == OrderStatus.CHO_CHAN_DOAN;
            default -> false;
        };

        if (!isValid) {
            throw new RuntimeException(
                    "Không thể chuyển trạng thái từ '" + (current != null ? current.getDescription() : "NULL") +
                            "' sang '" + next.getDescription() + "'. Quy trình yêu cầu thực hiện theo đúng thứ tự.");
        }
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

        if (!OrderStatus.CHO_KH_DUYET.equals(order.getTrangThai())
                && !OrderStatus.BAO_GIA_LAI.equals(order.getTrangThai())) {
            throw new RuntimeException("Đơn hàng không ở trạng thái chờ duyệt");
        }

        OrderStatus oldStatus = order.getTrangThai();
        order.setTrangThai(OrderStatus.DA_DUYET);
        order.setNgayDuyet(LocalDateTime.now());
        orderRepository.save(order);

        // Audit log
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("APPROVE")
                .duLieuCu(oldStatus.name())
                .duLieuMoi(OrderStatus.DA_DUYET.name())
                .lyDo("Khách hàng duyệt báo giá")
                .nguoiThucHienId(user.getId())
                .build());

        // Notify Sale
        if (order.getNguoiPhuTrach() != null) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
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

        // Notify Workshop Manager to assign/manage
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("QUAN_LY_XUONG")
                .title("Đơn hàng được duyệt: " + order.getPhieuTiepNhan().getXe().getBienSo())
                .content("Khách hàng đã duyệt báo giá. Vui lòng phân công thợ sửa chữa.")
                .type("SUCCESS")
                .link("/manager/orders/" + orderId)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        // Notify Mechanic
        asyncNotificationService.pushUniqueAsync(Notification.builder()
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
            asyncNotificationService.pushUniqueAsync(Notification.builder()
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

        if (!OrderStatus.CHO_KH_DUYET.equals(order.getTrangThai())
                && !OrderStatus.BAO_GIA_LAI.equals(order.getTrangThai())) {
            throw new RuntimeException("Đơn hàng không ở trạng thái chờ duyệt");
        }

        String actualReason = (reason == null || reason.isEmpty()) ? "Không rõ lý do" : reason;
        OrderStatus oldStatus = order.getTrangThai();
        order.setTrangThai(OrderStatus.HUY);
        orderRepository.save(order);

        // Audit log
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("REJECT")
                .duLieuCu(oldStatus.name())
                .duLieuMoi(OrderStatus.HUY.name())
                .lyDo("Khách hàng từ chối: " + actualReason)
                .nguoiThucHienId(user.getId())
                .build());

        // Notify Sale
        if (order.getNguoiPhuTrach() != null) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
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

        OrderStatus oldStatus = order.getTrangThai();
        // Bug 71 Fix: Strict State Machine Transition
        // Replenishment (bổ sung báo giá) only allowed during repair
        validateTransition(oldStatus, OrderStatus.BAO_GIA_LAI);

        order.setTrangThai(OrderStatus.BAO_GIA_LAI);
        order.setGhiChu(note);
        orderRepository.save(order);

        // Audit log
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("REQUEST_REVISION")
                .duLieuCu(oldStatus.name())
                .duLieuMoi(OrderStatus.BAO_GIA_LAI.name())
                .lyDo("Khách yêu cầu chỉnh sửa: " + note)
                .nguoiThucHienId(user.getId())
                .build());

        // Notify Sale
        if (order.getNguoiPhuTrach() != null) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
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
