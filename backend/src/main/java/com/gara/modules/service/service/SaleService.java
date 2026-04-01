package com.gara.modules.service.service;

import com.gara.modules.inventory.service.InventoryReservationService;
import com.gara.modules.finance.service.TransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.gara.modules.common.exception.BusinessException;
import org.springframework.http.HttpStatus;

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
    private static final Logger log = LoggerFactory.getLogger(SaleService.class);

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
    private final com.gara.modules.support.service.RealtimeService realtimeService;
    private final TimelineService timelineService;

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
            com.gara.modules.support.service.RealtimeService realtimeService,
            TimelineService timelineService) {
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
        this.realtimeService = realtimeService;
        this.timelineService = timelineService;
    }

    @Transactional
    public void claimOrder(Integer orderId, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));

        // Nếu đã có người phụ trách
        if (order.getServiceAdvisor() != null) {
            if (order.getServiceAdvisor().getId().equals(user.getId())) {
                return; // Đã nhận trước đó rồi
            }
            throw new RuntimeException("Đơn hàng đã được nhân viên " + order.getServiceAdvisor().getFullName() + " tiếp nhận.");
        }

        // Gán người phụ trách (Cố vấn dịch vụ)
        order.setServiceAdvisor(user);
        orderRepository.save(order);

        // Audit Log
        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(orderId)
                .action("CLAIM")
                .reason("Cố vấn dịch vụ tiếp nhận đơn hàng")
                .userId(user.getId())
                .build());

        // Broadcast Real-time
        Map<String, Object> sseData = new HashMap<>();
        sseData.put("orderId", orderId);
        sseData.put("claimedBy", user.getFullName());
        sseData.put("claimedById", user.getId());
        realtimeService.broadcast("order_claimed", sseData);

        // Timeline Log
        timelineService.recordEvent(order.getReception().getId(), user, "CLAIM_ORDER",
                "Cố vấn dịch vụ " + user.getFullName() + " đã tiếp nhận đơn hàng.",
                null, null, false);
    }

    // 7. Get Dashboard Stats
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        // Đếm toàn bộ xe đang ở Gara (chưa đóng hoặc hủy)
        long countWaiting = orderRepository.countByStatusIn(
                List.of(OrderStatus.RECEIVED, OrderStatus.WAITING_FOR_DIAGNOSIS, OrderStatus.QUOTING, OrderStatus.RE_QUOTATION,
                        OrderStatus.WAITING_FOR_CUSTOMER_APPROVAL, OrderStatus.APPROVED, OrderStatus.WAITING_FOR_PARTS, OrderStatus.IN_PROGRESS,
                        OrderStatus.WAITING_FOR_QC, OrderStatus.WAITING_FOR_PAYMENT));
        long countPendingQuotes = orderRepository.countByStatus(OrderStatus.WAITING_FOR_CUSTOMER_APPROVAL);
        long countPendingPayment = orderRepository.countOrdersWithDebt();

        // Danh sách xe đang chờ (Mới tiếp nhận - tất cả đang hoạt động, không chỉ TIEP_NHAN)
        List<RepairOrder> waitingOrders = orderRepository.findByStatusesOptimized(
                List.of(OrderStatus.RECEIVED, OrderStatus.WAITING_FOR_DIAGNOSIS));
        List<DashboardStatsDTO.DashboardVehicleDTO> waitingVehicles = waitingOrders.stream()
                .limit(5)
                .map(o -> {
                    String plate = "N/A";
                    String customer = "N/A";
                    String receptionist = "N/A";
                    int odo = 0;

                    if (o.getReception() != null) {
                        if (o.getReception().getOdo() != null) {
                            odo = o.getReception().getOdo();
                        }
                        if (o.getReception().getVehicle() != null) {
                            plate = o.getReception().getVehicle().getLicensePlate() != null ? o.getReception().getVehicle().getLicensePlate() : "N/A";
                            if (o.getReception().getVehicle().getCustomer() != null) {
                                customer = o.getReception().getVehicle().getCustomer().getFullName() != null ? o.getReception().getVehicle().getCustomer().getFullName() : "Khách vãng lai";
                            }
                        }
                        if (o.getReception().getReceptionist() != null) {
                            receptionist = o.getReception().getReceptionist().getFullName() != null ? o.getReception().getReceptionist().getFullName() : "N/A";
                        }
                    }

                    return DashboardStatsDTO.DashboardVehicleDTO.builder()
                            .id(o.getId())
                            .plate(plate)
                            .customerName(customer)
                            .time(o.getCreatedAt())
                            .odo(odo)
                            .receptionistName(receptionist)
                            .build();
                })
                .toList();

        // Optimized: Recent Orders
        List<RepairOrder> recentOrdersList = orderRepository.findTop5ByOrderByCreatedAtDesc();
        List<DashboardStatsDTO.DashboardOrderDTO> recentOrders = recentOrdersList.stream()
                .map(o -> {
                    String plate = "N/A";
                    if (o.getReception() != null && o.getReception().getVehicle() != null && o.getReception().getVehicle().getLicensePlate() != null) {
                        plate = o.getReception().getVehicle().getLicensePlate();
                    }

                    return DashboardStatsDTO.DashboardOrderDTO.builder()
                            .id(o.getId())
                            .plate(plate)
                            .total(o.getGrandTotal())
                            .status(o.getStatus().name())
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
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND));

        List<OrderItemDTO> items = order.getOrderItems().stream()
                .map(i -> OrderItemDTO.builder()
                        .id(i.getId())
                        .productId(i.getProduct().getId())
                        .productName(i.getProduct().getName())
                        .productCode(i.getProduct().getSku())
                        .unitPrice(i.getUnitPrice())
                        .quantity(i.getQuantity())
                        .total(i.getTotalAmount())
                        .discountPercent(i.getDiscountPercentage())
                        .type(i.getProduct().getIsService() ? "SERVICE" : "PRODUCT")
                        .itemStatus(i.getStatus().name())
                        .stock(i.getProduct().getStockQuantity())
                        .proposedById(i.getSuggestedById())
                        .proposedByName(i.getSuggestedBy() != null ? i.getSuggestedBy().getFullName() : null)
                        .proposedByRole(i.getSuggestedBy() != null && i.getSuggestedBy().getRoles() != null
                                ? i.getSuggestedBy().getRoles().stream()
                                        .map(r -> r.getName()).findFirst().orElse(null)
                                : null)
                        .isWarranty(i.getIsWarranty() != null && i.getIsWarranty())
                        .isTechnicalAddition(i.getIsEmergency())
                        .proposedAt(i.getSuggestedAt())
                        .assignments(i.getTaskAssignments() != null ? i.getTaskAssignments().stream()
                                .map(a -> new AssignmentDTO(
                                        a.getId(),
                                        a.getMechanic().getId(),
                                        a.getMechanic().getFullName(),
                                        a.getIsMainMechanic()))
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
        BigDecimal finalAmount = order.getGrandTotal();
 
        return OrderDetailDTO.builder()
                .id(order.getId())
                .status(order.getStatus().name())
                .plateNumber(order.getReception() != null && order.getReception().getVehicle() != null 
                        ? order.getReception().getVehicle().getLicensePlate() : "N/A")
                .customerName(order.getReception() != null && order.getReception().getVehicle() != null && order.getReception().getVehicle().getCustomer() != null
                        ? order.getReception().getVehicle().getCustomer().getFullName() : "Khách vãng lai")
                .customerPhone(order.getReception() != null && order.getReception().getVehicle() != null && order.getReception().getVehicle().getCustomer() != null
                        ? order.getReception().getVehicle().getCustomer().getPhone() : "")
                .carBrand(order.getReception() != null && order.getReception().getVehicle() != null 
                        ? order.getReception().getVehicle().getBrand() : "N/A")
                .carModel(order.getReception() != null && order.getReception().getVehicle() != null 
                        ? order.getReception().getVehicle().getModel() : "N/A")
                .createdAt(order.getCreatedAt())
                .items(items)
                .discount(order.getTotalDiscount())
                .tax(order.getVatAmount())
                .vatPercent(order.getVatPercentage())
                .totalAmount((order.getPartsTotal() != null ? order.getPartsTotal() : BigDecimal.ZERO)
                        .add(order.getLaborTotal() != null ? order.getLaborTotal() : BigDecimal.ZERO))
                .finalAmount(finalAmount)
                .paidAmount(totalPaid)
                .deposit(deposit)
                .thoChanDoanId(order.getDiagnosticMechanic() != null ? order.getDiagnosticMechanic().getId() : null)
                .receptionId(order.getReception() != null ? order.getReception().getId() : null)
                .advisorName(order.getServiceAdvisor() != null ? (order.getServiceAdvisor().getFullName() != null ? order.getServiceAdvisor().getFullName() : order.getServiceAdvisor().getUsername()) : "N/A")
                .advisorAvatar(order.getServiceAdvisor() != null ? order.getServiceAdvisor().getAvatar() : null)
                .foremanName(order.getDiagnosticMechanic() != null ? (order.getDiagnosticMechanic().getFullName() != null ? order.getDiagnosticMechanic().getFullName() : order.getDiagnosticMechanic().getUsername()) : "N/A")
                .foremanAvatar(order.getDiagnosticMechanic() != null ? order.getDiagnosticMechanic().getAvatar() : null)
                .build();
    }

    // 2. Search Products
    public List<ProductDTO> searchProducts(String keyword) {
        List<Product> products;
        if (keyword == null || keyword.isEmpty()) {
            // Optimized: Use paginated query instead of findAll()
            products = productRepository.findProductsPaginated();
        } else {
            products = productRepository.findBySkuContainingOrNameContaining(keyword, keyword);
        }

        return products.stream()
                .limit(20)
                .map(p -> ProductDTO.builder()
                        .id(p.getId())
                        .code(p.getSku())
                        .name(p.getName())
                        .price(p.getRetailPrice())
                        .costPrice(p.getCostPrice())
                        .isService(p.getIsService())
                        .stock(p.getStockQuantity())
                        .build())
                .toList();
    }

    // 3. Add Item
    public List<Customer> searchCustomers(String keyword) {
        log.info("Searching customers with keyword: '{}'", keyword);
        try {
            if (keyword == null || keyword.isBlank()) {
                // Optimized: Return only recent 50 customers instead of all
                List<Customer> recent = customerRepository.findRecentCustomers();
                log.debug("Found {} recent customers", recent != null ? recent.size() : 0);
                return recent != null ? recent : new ArrayList<>();
            }
            List<Customer> results = customerRepository.searchByKeyword(keyword);
            log.debug("Found {} customers for keyword '{}'", results != null ? results.size() : 0, keyword);
            return results != null ? results : new ArrayList<>();
        } catch (Exception e) {
            log.error("Error searching customers for keyword '{}': {}", keyword, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public Customer createCustomer(Customer customer) {
        if (customerRepository.findByPhone(customer.getPhone()).isPresent()) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }
        return customerRepository.save(customer);
    }

    @Transactional
    public RepairOrder createOrderFromReception(Integer receptionId, User user) {
        Reception reception = receptionRepository.findById(receptionId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy phiếu tiếp nhận với ID: " + receptionId, HttpStatus.NOT_FOUND));

        // Nếu đã có đơn hàng thì trả về luôn
        if (reception.getRepairOrder() != null) {
            return reception.getRepairOrder();
        }

        RepairOrder order = new RepairOrder();
        order.setReception(reception);
        order.setServiceAdvisor(user);
        order.setStatus(OrderStatus.RECEIVED);
        order.setCreatedAt(LocalDateTime.now());
        order.setIsWarrantyOrder(false);

        RepairOrder savedOrder = orderRepository.save(order);
        
        // Cập nhật ngược lại cho Reception
        reception.setRepairOrder(savedOrder);
        receptionRepository.save(reception);

        return savedOrder;
    }

    public Customer getCustomerById(Integer id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy khách hàng với ID: " + id, HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Customer updateCustomer(Integer id, Customer customerData) {
        Customer existing = getCustomerById(id);

        if (customerData.getFullName() != null) existing.setFullName(customerData.getFullName());
        if (customerData.getPhone() != null) existing.setPhone(customerData.getPhone());
        if (customerData.getEmail() != null) existing.setEmail(customerData.getEmail());
        if (customerData.getAddress() != null) existing.setAddress(customerData.getAddress());
        if (customerData.getNotes() != null) existing.setNotes(customerData.getNotes());
        if (customerData.getCustomerGroup() != null) existing.setCustomerGroup(customerData.getCustomerGroup());

        return customerRepository.save(existing);
    }

    @Transactional
    public void addItem(Integer orderId, Integer productId, Integer quantity, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND));

        if (!user.hasPermission("CREATE_RECEPTION") && !user.hasPermission("CREATE_PROPOSAL") && !user.isAdmin()) {
            throw new BusinessException("Bạn không có quyền thêm hạng mục vào đơn hàng.", HttpStatus.FORBIDDEN);
        }

        checkOwnership(order, user);
        validateOrderModifiable(order);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy sản phẩm", HttpStatus.NOT_FOUND));

        OrderItem item = new OrderItem();
        item.setRepairOrder(order);
        item.setProduct(product);
        if (product.getIsService()) {
            quantity = 1;
        } else if (quantity <= 0) {
            throw new BusinessException("Số lượng phải lớn hơn 0", HttpStatus.BAD_REQUEST);
        }

        BigDecimal unitPrice = product.getRetailPrice();
        BigDecimal rawTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

        item.setQuantity(quantity);
        item.setUnitPrice(unitPrice);
        item.setVatPercentage(BigDecimal.ZERO);
        item.setVatAmount(BigDecimal.ZERO);
        item.setTotalAmount(rawTotal);

        // Handle Arising Issues (Rule 3.3)
        OrderStatus status = order.getStatus();
        if (OrderStatus.APPROVED.equals(status) || OrderStatus.IN_PROGRESS.equals(status)) {
            item.setStatus(ItemStatus.WAITING_FOR_MANAGER_APPROVAL); // Arising issue needs technical approval first
        } else {
            item.setStatus(ItemStatus.CUSTOMER_APPROVED); // Initial quote building
        }

        // Track who proposed this item
        item.setSuggestedBy(user);

        orderItemRepository.save(item);

        // CRITICAL: Force refresh order from DB to synchronize collection
        entityManager.flush();
        entityManager.refresh(order);

        orderCalculationService.recalculateTotals(order);

        // Broadcast SSE
        Map<String, Object> sseData = new HashMap<>();
        sseData.put("orderId", orderId);
        sseData.put("type", "ADD_ITEM");
        realtimeService.broadcast("order_item_status_changed", sseData);

        // Timeline Log
        timelineService.recordEvent(order.getReception().getId(), user, "ADD_ITEM",
                "Đã thêm hạng mục: " + product.getName() + " (SL: " + quantity + ")",
                null, String.valueOf(quantity), false);
    }

    // 4. Update Item
    @Transactional
    public void updateItem(Integer itemId, Integer quantity, Double discountPercent, Integer version, User user) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy hạng mục công việc", HttpStatus.NOT_FOUND));

        if (version != null && !item.getVersion().equals(version)) {
            throw new BusinessException("Dữ liệu hạng mục đã được thay đổi bởi người khác. Vui lòng tải lại trang.", HttpStatus.CONFLICT);
        }
        checkOwnership(item.getRepairOrder(), user);
        validateOrderModifiable(item.getRepairOrder());

        // Rule 10.2: Cannot edit approved items, only Arising (DE_XUAT) items
        OrderStatus orderStatus = item.getRepairOrder().getStatus();
        if (OrderStatus.APPROVED.equals(orderStatus) || OrderStatus.IN_PROGRESS.equals(orderStatus)) {
            if (!ItemStatus.PROPOSAL.equals(item.getStatus())) {
                throw new BusinessException("Không thể chỉnh sửa hạng mục đã được duyệt (Báo giá gốc).", HttpStatus.BAD_REQUEST);
            }
        }

        BigDecimal oldTotalAmount = item.getTotalAmount() != null ? item.getTotalAmount() : BigDecimal.ZERO;
        int oldQuantity = item.getQuantity();
        BigDecimal oldDiscount = item.getDiscountPercentage() != null ? item.getDiscountPercentage() : BigDecimal.ZERO;

        if (item.getProduct().getIsService()) {
            item.setQuantity(1);
        } else if (quantity != null && quantity > 0) {
            item.setQuantity(quantity);
        }

        if (discountPercent != null) {
            if (discountPercent < 0 || discountPercent > 100) {
                throw new BusinessException("Chiết khấu phải từ 0% đến 100%", HttpStatus.BAD_REQUEST);
            }
            item.setDiscountPercentage(BigDecimal.valueOf(discountPercent));
        }

        // Calculations are handled centrally in OrderCalculationService.recalculateTotals
        BigDecimal rawSubtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        
        // Clear per-item tax/discount complexity for now as logic moved to global
        item.setTotalAmount(rawSubtotal);
        orderItemRepository.save(item);

        // Only update order totals if item is NOT rejected
        if (!ItemStatus.CUSTOMER_REJECTED.equals(item.getStatus())) {
            BigDecimal delta = rawSubtotal.subtract(oldTotalAmount);
            if (delta.compareTo(BigDecimal.ZERO) != 0) {
                orderCalculationService.updateTotalsIncrementally(
                    item.getRepairOrder().getId(), 
                    delta, 
                    item.getProduct() != null && item.getProduct().getIsService()
                );
            }
        }

        // Broadcast SSE
        Map<String, Object> sseData = new HashMap<>();
        sseData.put("orderId", item.getRepairOrder().getId());
        sseData.put("type", "UPDATE_ITEM");
        realtimeService.broadcast("order_item_status_changed", sseData);

        // Timeline Log - chi tiết giá trị cũ → mới
        StringBuilder logContent = new StringBuilder();
        logContent.append("Đã cập nhật hạng mục: ").append(item.getProduct().getName());
        if (oldQuantity != item.getQuantity()) {
            logContent.append(" | SL: ").append(oldQuantity).append(" → ").append(item.getQuantity());
        }
        BigDecimal newDiscount = item.getDiscountPercentage() != null ? item.getDiscountPercentage() : BigDecimal.ZERO;
        if (oldDiscount.compareTo(newDiscount) != 0) {
            logContent.append(" | CK: ").append(oldDiscount).append("% → ").append(newDiscount).append("%");
        }
        timelineService.recordEvent(item.getRepairOrder().getReception().getId(), user, "UPDATE_ITEM",
                logContent.toString(),
                String.valueOf(oldQuantity), String.valueOf(item.getQuantity()), false);
    }

    // 4b. Update Item Status (Approve/Reject)
    @Transactional
    public void updateItemStatus(Integer itemId, ItemStatus status, User user) {
        // First lock the item to prevent concurrent status updates from spam clicking
        orderItemRepository.findByIdWithLock(itemId);

        // Then fetch full details
        OrderItem item = orderItemRepository.findByIdWithFullDetails(itemId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy hạng mục công việc", HttpStatus.NOT_FOUND));

        checkOwnership(item.getRepairOrder(), user);
        
        // Security check: Items proposed by SALE cannot have their status toggled (Reserved for Technical Arising)
        if (item.getSuggestedBy() != null && item.getSuggestedBy().getRoles() != null) {
            boolean isSaleProposal = item.getSuggestedBy().getRoles().stream()
                    .anyMatch(r -> r.getName().toUpperCase().contains("SALE"));
            if (isSaleProposal) {
                throw new BusinessException("Hạng mục do nhân viên Sale đề xuất không thể thay đổi trạng thái duyệt.", HttpStatus.BAD_REQUEST);
            }
        }

        BigDecimal oldThanhTien = item.getTotalAmount() != null ? item.getTotalAmount() : BigDecimal.ZERO;
        ItemStatus oldStatus = item.getStatus();

        // Ensure thanhTien is correctly synced with price * qty before status toggle
        BigDecimal unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
        BigDecimal qty = BigDecimal.valueOf(item.getQuantity() != null ? item.getQuantity() : 0);
        BigDecimal currentThanhTien = unitPrice.multiply(qty);
        item.setTotalAmount(currentThanhTien);
        
        item.setStatus(status);
        orderItemRepository.save(item);

        // Delta logic: Skip if status rejected by customer
        BigDecimal delta = BigDecimal.ZERO;
        boolean oldIsApproved = !ItemStatus.CUSTOMER_REJECTED.equals(oldStatus);
        boolean currentIsApproved = !ItemStatus.CUSTOMER_REJECTED.equals(status);

        if (oldIsApproved && !currentIsApproved) {
            // Subtract what was in the total (old value)
            delta = oldThanhTien.negate();
        } else if (!oldIsApproved && currentIsApproved) {
            // Add what is now approved (new value)
            delta = currentThanhTien;
        }

        if (delta.compareTo(BigDecimal.ZERO) != 0) {
            orderCalculationService.updateTotalsIncrementally(
                item.getRepairOrder().getId(), 
                delta, 
                item.getProduct() != null && item.getProduct().getIsService()
            );
        }

        // Broadcast SSE
        Map<String, Object> sseData = new HashMap<>();
        sseData.put("orderId", item.getRepairOrder().getId());
        sseData.put("itemId", itemId);
        sseData.put("status", status.name());
        sseData.put("type", "STATUS_CHANGE");
        realtimeService.broadcast("order_item_status_changed", sseData);

        // Timeline Log
        String statusLabel = ItemStatus.CUSTOMER_APPROVED.equals(status) ? "ĐỒNG Ý" : "TỪ CHỐI";
        timelineService.recordEvent(item.getRepairOrder().getReception().getId(), user, "ITEM_STATUS",
                "Khách hàng đã " + statusLabel + " hạng mục: " + item.getProduct().getName(),
                oldStatus != null ? oldStatus.name() : null, status.name(), false);
    }

    // 5. Remove Item
    @Transactional
    public void removeItem(Integer itemId, User user) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        RepairOrder order = item.getRepairOrder();
        checkOwnership(order, user);
        validateOrderModifiable(order);

        // Rule 10.2: Cannot delete approved items, only Arising (DE_XUAT) items
        OrderStatus orderStatus = order.getStatus();
        if (OrderStatus.APPROVED.equals(orderStatus) || OrderStatus.IN_PROGRESS.equals(orderStatus)) {
            if (!ItemStatus.PROPOSAL.equals(item.getStatus())) {
                throw new RuntimeException("Không thể xóa hạng mục đã được duyệt (Báo giá gốc).");
            }
        }

        // Audit Log for Deletion (Micro-rule)
        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("OrderItem")
                .recordId(order.getId())
                .action("DELETE")
                .oldData("Deleted Item: " + item.getProduct().getName() + " (Qty: " + item.getQuantity() + ")")
                .reason("Xóa hạng mục khỏi đơn hàng")
                .userId(user.getId())
                .build());

        order.getOrderItems().remove(item);
        BigDecimal currentVal = item.getTotalAmount();
        boolean isLabor = item.getProduct() != null && item.getProduct().getIsService();
        boolean wasIncluded = !ItemStatus.CUSTOMER_REJECTED.equals(item.getStatus());

        orderItemRepository.delete(item);

        if (wasIncluded) {
            orderCalculationService.updateTotalsIncrementally(order.getId(), currentVal.negate(), isLabor);
        }

        // Broadcast SSE
        Map<String, Object> sseData = new HashMap<>();
        sseData.put("orderId", order.getId());
        sseData.put("type", "REMOVE_ITEM");
        realtimeService.broadcast("order_item_status_changed", sseData);

        // Timeline Log
        timelineService.recordEvent(order.getReception().getId(), user, "DELETE_ITEM",
                "Đã xóa hạng mục khỏi danh sách: " + item.getProduct().getName(),
                null, null, false);
    }

    // 6. Send Quote to Customer
    @Transactional
    public void submitToCustomer(Integer orderId, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND));

        checkOwnership(order, user);

        if (order.getDiagnosticMechanic() == null) {
            throw new BusinessException("Chưa có kết quả chẩn đoán từ kỹ thuật viên. Sale không thể gửi báo giá.", HttpStatus.BAD_REQUEST);
        }

        if (user.getId() == null) {
            throw new BusinessException("Lỗi hệ thống: User ID không tồn tại. Vui lòng đăng nhập lại.", HttpStatus.UNAUTHORIZED);
        }

        OrderStatus oldStatus = order.getStatus();
        // Bug 71 Fix: Strict State Machine Transition
        validateTransition(oldStatus, OrderStatus.WAITING_FOR_CUSTOMER_APPROVAL);

        order.setStatus(OrderStatus.WAITING_FOR_CUSTOMER_APPROVAL);
        orderRepository.save(order);

        // Log transition
        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(orderId)
                .action("UPDATE")
                .oldData(oldStatus.name())
                .newData(OrderStatus.WAITING_FOR_CUSTOMER_APPROVAL.name())
                .reason("Gửi báo giá cho khách")
                .userId(user.getId())
                .build());

        // Reserve inventory when waiting for customer approval
        reservationService.createReservation(orderId, user.getId());

        // Notify Customer (Rule 9.3.1)
        Customer customer = order.getReception().getVehicle().getCustomer();
        
        // Timeline Log
        timelineService.recordEvent(order.getReception().getId(), user, "SEND_QUOTE",
                "Đã gửi báo giá chi tiết tới Quý khách hàng qua App/Zalo. Tổng tiền: " + order.getGrandTotal(),
                oldStatus.name(), order.getStatus().name(), false);

        if (customer.getUserId() != null) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .userId(customer.getUserId())
                    .role("CUSTOMER")
                    .title("Báo giá mới: " + order.getReception().getVehicle().getLicensePlate())
                    .content("Báo giá sửa chữa đã sẵn sàng. Tổng tiền: " + order.getGrandTotal()
                            + ". Vui lòng xem và duyệt.")
                    .type("INFO")
                    .link("/customer/orders/" + orderId)
                    .refId(orderId)
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

        // Snapshot giá trị cũ cho timeline log
        BigDecimal oldDiscount = order.getTotalDiscount() != null ? order.getTotalDiscount() : BigDecimal.ZERO;
        BigDecimal oldVat = order.getVatPercentage() != null ? order.getVatPercentage() : BigDecimal.ZERO;

        if (discount != null) {
            order.setTotalDiscount(discount);
        }
        if (vatPercent != null) {
            order.setVatPercentage(vatPercent);
        }

        orderCalculationService.recalculateTotals(order);
        orderRepository.save(order);

        // Audit log
        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(orderId)
                .action("UPDATE")
                .reason("Cập nhật chiết khấu/VAT tổng: " + discount + "/" + vatPercent)
                .userId(user.getId())
                .build());

        // Broadcast SSE để frontend cập nhật realtime
        Map<String, Object> sseData = new HashMap<>();
        sseData.put("orderId", orderId);
        sseData.put("type", "UPDATE_TOTALS");
        realtimeService.broadcast("order_item_status_changed", sseData);

        // Timeline Log - chi tiết
        StringBuilder logContent = new StringBuilder();
        logContent.append("Đã điều chỉnh đơn hàng:");
        if (discount != null) {
            logContent.append(" Chiết khấu: ").append(oldDiscount).append("đ → ").append(discount).append("đ");
        }
        if (vatPercent != null) {
            logContent.append(" | VAT: ").append(oldVat).append("% → ").append(vatPercent).append("%");
        }
        logContent.append(" | Tổng mới: ").append(order.getGrandTotal()).append("đ");
        timelineService.recordEvent(order.getReception().getId(), user, "UPDATE_ITEM",
                logContent.toString(),
                null, null, false);
    }

    // 6c. Submit Replenishment Quote (For Technical Issues found mid-repair)
    @Transactional
    public void submitReplenishmentQuote(Integer orderId, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        checkOwnership(order, user);

        OrderStatus oldStatus = order.getStatus();
        // Bug 71 Fix: Strict State Machine Transition
        // Replenishment only allowed from DANG_SUA (mid-repair)
        validateTransition(oldStatus, OrderStatus.RE_QUOTATION);

        // Filter items that are in 'PROPOSAL' status (Proposed by manager after technical review)
        List<OrderItem> proposedItems = order.getOrderItems().stream()
                .filter(i -> ItemStatus.PROPOSAL.equals(i.getStatus()))
                .toList();

        if (proposedItems.isEmpty()) {
            throw new RuntimeException("Không có hạng mục phát sinh nào đã được duyệt kỹ thuật để báo giá.");
        }

        order.setStatus(OrderStatus.RE_QUOTATION);
        orderRepository.save(order);

        // Log transition
        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(orderId)
                .action("UPDATE")
                .oldData(oldStatus.name())
                .newData(OrderStatus.RE_QUOTATION.name())
                .reason("Gửi báo giá bổ sung cho các hạng mục phát sinh đã duyệt kỹ thuật")
                .userId(user.getId())
                .build());

        // Notify customer about replenishment quote
        Customer repCustomer = order.getReception().getVehicle().getCustomer();

        // Timeline Log
        timelineService.recordEvent(order.getReception().getId(), user, "SEND_REPLENISHMENT_QUOTE",
                "Đã gửi báo giá bổ sung cho các hạng mục phát sinh mới. Chờ khách hàng duyệt lại.",
                oldStatus.name(), order.getStatus().name(), false);

        if (repCustomer.getUserId() != null) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .userId(repCustomer.getUserId())
                    .role("CUSTOMER")
                    .title("Báo giá bổ sung: " + order.getReception().getVehicle().getLicensePlate())
                    .content("Hệ thống đã cập nhật báo giá cho các hạng mục phát sinh mới. Vui lòng xem và duyệt.")
                    .type("WARNING")
                    .link("/customer/progress") // Customer can now go to progress page and follow the link to details
                    .refId(orderId)
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

        if (order.getDiagnosticMechanic() == null) {
            throw new RuntimeException("Chưa có kết quả chẩn đoán từ kỹ thuật viên. Không thể duyệt báo giá.");
        }

        if (order.getOrderItems().isEmpty()) {
            throw new RuntimeException("Đơn hàng không có bất kỳ hạng mục nào. Vui lòng kiểm tra lại.");
        }

        // Bug 98 Fix: Ensure at least one item is approved/active
        boolean hasApprovedItems = order.getOrderItems().stream()
                .anyMatch(i -> List.of(ItemStatus.CUSTOMER_APPROVED, ItemStatus.WAITING_FOR_PARTS, ItemStatus.IN_PROGRESS, ItemStatus.COMPLETED)
                        .contains(i.getStatus()));

        if (!hasApprovedItems) {
            throw new RuntimeException("Đơn hàng phải có ít nhất một hạng mục được duyệt để tiếp tục.");
        }

        if (user.getId() == null) {
            throw new RuntimeException(
                    "Lỗi hệ thống: User ID không tồn tại trong phiên đăng nhập. Vui lòng đăng xuất và đăng nhập lại.");
        }

        OrderStatus oldStatus = order.getStatus();

        // Bug 71 Fix: Idempotency & Strict Transition
        if (OrderStatus.APPROVED.equals(oldStatus)) {
            return; // Already approved, do nothing
        }

        // Force transition from WAITING_FOR_CUSTOMER_APPROVAL or RE_QUOTATION
        order.setStatus(OrderStatus.APPROVED);
        order.setApprovedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Timeline Log
        timelineService.recordEvent(order.getReception().getId(), user, "FINALIZE_ORDER",
                "Báo giá đã được phê duyệt chính thức. Hệ thống đang tiến hành điều phối vật tư và kỹ thuật.",
                oldStatus.name(), OrderStatus.APPROVED.name(), false);

        // Log transition
        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(orderId)
                .action("UPDATE")
                .oldData(oldStatus.name())
                .newData(OrderStatus.APPROVED.name())
                .reason("Khách hàng đã duyệt báo giá")
                .userId(user.getId())
                .build());

        // Notify Sale Advisor if someone else (e.g., Manager) approved the quote
        if (order.getServiceAdvisor() != null && !order.getServiceAdvisor().getId().equals(user.getId())) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .userId(order.getServiceAdvisor().getId())
                    .role("SALE")
                    .title("Báo giá được duyệt: " + order.getReception().getVehicle().getLicensePlate())
                    .content(user.getFullName() + " đã duyệt báo giá. Xe có thể bắt đầu sửa chữa.")
                    .type("SUCCESS")
                    .link("/sale/orders/" + order.getId())
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }

        // Notify Workshop Manager to assign/manage
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("QUAN_LY_XUONG")
                .title("Đơn hàng được duyệt: " + order.getReception().getVehicle().getLicensePlate())
                .content("Khách hàng đã duyệt báo giá. Vui lòng phân công thợ sửa chữa.")
                .type("SUCCESS")
                .link("/manager/orders/" + order.getId())
                .refId(order.getId())
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        // Notify Repair Mechanic
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("THO_SUA_CHUA")
                .title("Lệnh sửa chữa mới: " + order.getReception().getVehicle().getLicensePlate())
                .content("Báo giá đã được duyệt. Vui lòng nhận việc.")
                .type("INFO")
                .link("/mechanic/jobs/" + order.getId())
                .refId(order.getId())
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        // Notify Warehouse to prepare parts
        boolean hasParts = order.getOrderItems().stream().anyMatch(i -> !i.getProduct().getIsService());
        if (hasParts) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .role("KHO")
                    .title("Phiếu xuất kho mới: " + order.getReception().getVehicle().getLicensePlate())
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

        OrderStatus currentStatus = order.getStatus();

        // RULE: Cannot cancel COMPLETED or CLOSED orders
        if (OrderStatus.COMPLETED.equals(currentStatus) || OrderStatus.CLOSED.equals(currentStatus)) {
            throw new RuntimeException(
                    "Không thể hủy đơn hàng đã hoàn thành/đóng. Liên hệ Admin nếu cần.");
        }

        // RULE: Warn when canceling during repair with completed items
        if (OrderStatus.IN_PROGRESS.equals(currentStatus) || OrderStatus.WAITING_FOR_PARTS.equals(currentStatus)) {
            long completedCount = order.getOrderItems().stream()
                    .filter(item -> ItemStatus.COMPLETED.equals(item.getStatus()))
                    .count();

            if (completedCount > 0) {
                // Allow cancel but log as HIGH RISK action
                asyncAuditService.logAsync(AuditLog.builder()
                        .tableName("RepairOrder")
                        .recordId(orderId)
                        .action("CANCEL_RISK")
                        .oldData(currentStatus.name())
                        .newData(OrderStatus.CANCELLED.name())
                        .reason("⚠️ HỦY RỦI RO CAO: " + completedCount + " hạng mục đã hoàn thành bị hủy. Lý do: "
                                + reason)
                        .userId(user.getId())
                        .build());
            }
        }

        // RULE 341: Cannot cancel if parts exported (unless fully returned)
        boolean hasExport = !order.getExportNotes().isEmpty();
        if (hasExport) {
            boolean hasPendingItems = order.getOrderItems().stream()
                    .anyMatch(item -> !item.getProduct().getIsService() &&
                            item.getQuantity() > 0 &&
                            !ItemStatus.CUSTOMER_REJECTED.equals(item.getStatus()));

            if (hasPendingItems) {
                throw new RuntimeException(
                        "Không thể hủy đơn hàng đã xuất kho. Vui lòng hoàn nhập toàn bộ phụ tùng về kho trước.");
            }
        }

        checkOwnership(order, user);

        OrderStatus oldStatus = order.getStatus();
        BigDecimal oldGrandTotal = order.getGrandTotal();
        BigDecimal oldAmountPaid = order.getAmountPaid();

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelNotes(reason);

        order.setGrandTotal(oldAmountPaid != null ? oldAmountPaid : BigDecimal.ZERO);
        order.setBalanceDue(BigDecimal.ZERO);

        orderRepository.save(order);

        // Bug 126 Fix: Handle Refund/Credit if order was partially/fully paid
        if (oldAmountPaid != null && oldAmountPaid.compareTo(BigDecimal.ZERO) > 0) {
            transactionService.createTransaction(
                orderId, 
                oldAmountPaid, 
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
                .title("Đơn hàng đã hủy: " + order.getReception().getVehicle().getLicensePlate())
                .content("Lý do: " + reason)
                .type("WARNING")
                .link("/sale/orders/" + orderId)
                .refId(orderId)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        // RELEASE and RETURN stock (Bug 73: Zombie Inventory)
        reservationService.releaseReservation(orderId, reason, user.getId());

        // Explicitly return stock for items already exported (CONVERTED state in
        // reservation)
        warehouseService.returnStockFromCancelledOrder(orderId, user.getId());

        // Log transition
        String riskPrefix = (oldAmountPaid != null && oldAmountPaid.compareTo(BigDecimal.ZERO) > 0)
                ? "⚠️ CANCELED WITH PAYMENT: "
                : "";

        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(orderId)
                .action("UPDATE")
                .oldData(oldStatus.name() + " (Amount: " + oldGrandTotal + ")")
                .newData(OrderStatus.CANCELLED.name() + " (Amount: " + order.getGrandTotal() + ")")
                .reason(riskPrefix + "Hủy đơn hàng: " + reason)
                .userId(user.getId())
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

        if (order.getGrandTotal().compareTo(threshold) > 0) {
            BigDecimal minDeposit = order.getGrandTotal().multiply(minRate);
            if (order.getDeposit().compareTo(minDeposit) < 0) {
                throw new RuntimeException("Đơn hàng giá trị lớn (>5tr) yêu cầu đặt cọc tối thiểu 30% (" +
                        minDeposit.setScale(0, RoundingMode.HALF_UP) + " VNĐ). Hiện tại chỉ có: " +
                        order.getDeposit().setScale(0, RoundingMode.HALF_UP) + " VNĐ.");
            }
        }
    }

    // 10. Create Warranty Order (Phase 9)
    @Transactional
    public Integer createWarrantyOrder(Integer originalOrderId, List<Integer> itemIds, Integer currentOdo, User user) {
        RepairOrder originalOrder = orderRepository.findById(originalOrderId)
                .orElseThrow(() -> new RuntimeException("Original Order not found"));

        if (!OrderStatus.COMPLETED.equals(originalOrder.getStatus())
                && !OrderStatus.CLOSED.equals(originalOrder.getStatus())) {
            throw new RuntimeException("Chỉ có thể tạo bảo hành từ đơn hàng đã hoàn thành hoặc đóng.");
        }

        LocalDateTime now = LocalDateTime.now();
        Vehicle vehicle = originalOrder.getReception().getVehicle();

        // Update vehicle ODO if provided and higher
        if (currentOdo != null) {
            if (vehicle.getCurrentOdo() != null && currentOdo < vehicle.getCurrentOdo()) {
                throw new RuntimeException("Số ODO nhập vào (" + currentOdo
                        + ") không được nhỏ hơn ODO hiện tại của xe (" + vehicle.getCurrentOdo() + ").");
            }
            vehicle.setCurrentOdo(currentOdo);
            vehicleRepository.save(vehicle);
        }

        Integer currentVehicleOdo = vehicle.getCurrentOdo();
        Integer originalOdo = originalOrder.getReception().getOdo();
        if (originalOdo == null)
            originalOdo = 0; // Fallback

        // Create a new Reception for the warranty visit (because of @OneToOne
        // constraint)
        Reception warrantyVisit = Reception.builder()
                .vehicle(vehicle)
                .receptionist(user)
                .receptionDate(now)
                .odo(currentVehicleOdo)
                .preliminaryRequest("Bảo hành theo đơn #" + originalOrderId)
                .fuelLevel(originalOrder.getReception().getFuelLevel()) // Copy fuel level as proxy
                .build();
        receptionRepository.save(warrantyVisit);

        RepairOrder warrantyOrder = RepairOrder.builder()
                .reception(warrantyVisit)
                .serviceAdvisor(user) // In SaleService context, responsiblePerson is often advisor
                .status(OrderStatus.RECEIVED)
                .isWarrantyOrder(true)
                .parentOrder(originalOrder)
                .notes("Bảo hành theo đơn " + originalOrder.getId())
                .orderItems(new ArrayList<>())
                .build();

        List<OrderItem> warrantyItems = new ArrayList<>();
        for (Integer itemId : itemIds) {
            OrderItem originalItem = orderItemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

            if (!originalItem.getRepairOrder().getId().equals(originalOrderId)) {
                throw new RuntimeException("Sản phẩm không thuộc đơn hàng gốc.");
            }

            // Validate Warranty Policy
            Product product = originalItem.getProduct();
            if (product.getWarrantyMonths() == 0 && product.getWarrantyKm() == 0) {
                throw new RuntimeException("Hạng mục '" + product.getName()
                        + "' không thuộc diện bảo hành (Không có chính sách bảo hành).");
            }

            boolean dateValid = true;
            if (product.getWarrantyMonths() > 0) {
                LocalDateTime expiryDate = originalOrder.getCreatedAt().plusMonths(product.getWarrantyMonths());
                if (now.isAfter(expiryDate)) {
                    dateValid = false;
                }
            }

            boolean kmValid = true;
            if (product.getWarrantyKm() > 0) {
                if (currentVehicleOdo > (originalOdo + product.getWarrantyKm())) {
                    kmValid = false;
                }
            }

            if (!dateValid || !kmValid) {
                String reason = !dateValid ? "Hết hạn thời gian" : "Quá số KM bảo hành";
                throw new RuntimeException("Hạng mục '" + product.getName() + "' đã hết hạn bảo hành: " + reason);
            }

            // Bug 128 Fix: Prevent duplicate warranty claims
            if (originalItem.getIsWarrantyProcessed()) {
                throw new RuntimeException("Hạng mục '" + product.getName() + "' đã được bảo hành trước đó.");
            }

            OrderItem newItem = OrderItem.builder()
                    .repairOrder(warrantyOrder)
                    .product(originalItem.getProduct())
                    .quantity(originalItem.getQuantity())
                    .unitPrice(BigDecimal.ZERO)
                    .totalAmount(BigDecimal.ZERO)
                    .status(ItemStatus.IN_PROGRESS)
                    .isWarranty(true) // Mark this as a warranty replacement
                    .build();

            warrantyItems.add(newItem);
            
            // Mark original item as warrantied
            originalItem.setIsWarrantyProcessed(true);
            orderItemRepository.save(originalItem);
        }

        if (warrantyItems.isEmpty()) {
            throw new RuntimeException("Phải chọn ít nhất 1 sản phẩm để bảo hành.");
        }

        warrantyOrder.setOrderItems(warrantyItems);
        orderRepository.save(warrantyOrder);

        // Bug 129 Fix: Reserve stock for warranty items immediately
        reservationService.createReservation(warrantyOrder.getId(), user.getId());

        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(warrantyOrder.getId())
                .action("CREATE_WARRANTY")
                .newData("From Order " + originalOrderId)
                .userId(user.getId())
                .build());

        // Notify Quản lý xưởng
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("QUAN_LY_XUONG")
                .title("Xe bảo hành chờ chẩn đoán: " + vehicle.getLicensePlate())
                .content("Xe " + vehicle.getLicensePlate() + " vào bảo hành. Vui lòng xếp lịch/chẩn đoán.")
                .type("WARNING")
                .link("/mechanic/jobs")
                .refId(warrantyOrder.getId())
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        // Notify Sale tạo lệnh
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("SALE")
                .title("Tạo lệnh bảo hành: " + vehicle.getLicensePlate())
                .content("Lệnh bảo hành cho xe " + vehicle.getLicensePlate() + " đã được tạo.")
                .type("INFO")
                .link("/sale/orders/" + warrantyOrder.getId())
                .refId(warrantyOrder.getId())
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

        BigDecimal debt = order.getGrandTotal().subtract(totalPaid);

        if (debt.compareTo(BigDecimal.ZERO) > 0) {
            if (!user.isAdmin()) {
                throw new RuntimeException("Đơn hàng chưa thanh toán đủ (Còn nợ: " +
                        debt + " VNĐ). Vui lòng thanh toán hết hoặc nhờ Admin duyệt đóng nợ.");
            }
        }

        checkOwnership(order, user);

        OrderStatus oldStatus = order.getStatus();
        // Bug 71 Fix: Strict State Machine Transition
        validateTransition(oldStatus, OrderStatus.CLOSED);

        order.setStatus(OrderStatus.CLOSED);
        orderRepository.save(order);

        // Log transition
        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(orderId)
                .action("UPDATE")
                .oldData(oldStatus.name())
                .newData(OrderStatus.CLOSED.name())
                .reason("Đóng đơn hàng")
                .userId(user.getId())
                .build());
    }

    // ... helpers ...

    private void checkOwnership(RepairOrder order, User user) {
        if (user.isAdmin())
            return;

        if (order.getServiceAdvisor() != null && !order.getServiceAdvisor().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa đơn hàng của người khác");
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOrders(String status) {
        List<RepairOrder> orders;
        if (status != null && !status.isEmpty()) {
            // Support special aliases for Debt/Payment filtering
            if (status.equalsIgnoreCase("PENDING_PAYMENT") || 
                status.equalsIgnoreCase("WAITING_PAYMENT") || 
                status.equalsIgnoreCase("DEBT")) {
                orders = orderRepository.findOrdersWithDebt();
            } 
            else if (status.contains(",")) {
                List<OrderStatus> statuses = List.of(status.split(",")).stream()
                        .map(s -> {
                            try {
                                return OrderStatus.valueOf(s.trim());
                            } catch (IllegalArgumentException e) {
                                return null;
                            }
                        })
                        .filter(java.util.Objects::nonNull)
                        .collect(Collectors.toList());
                orders = statuses.isEmpty() ? new ArrayList<>() : orderRepository.findByStatusesOptimized(statuses);
            } else {
                try {
                    orders = orderRepository.findByStatusOptimized(OrderStatus.valueOf(status));
                } catch (IllegalArgumentException e) {
                    // Log and return empty list to avoid 500
                    orders = new ArrayList<>();
                }
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
            BigDecimal finalAmount = o.getGrandTotal();
            BigDecimal debt = finalAmount.subtract(totalPaid);

            Map<String, Object> m = new HashMap<>();
            m.put("id", o.getId());
            m.put("createdAt", o.getCreatedAt());
            m.put("plate", o.getReception().getVehicle().getLicensePlate());
            m.put("vehicleBrand", o.getReception().getVehicle().getBrand());
            m.put("vehicleModel", o.getReception().getVehicle().getModel());
            m.put("customerName", o.getReception().getVehicle().getCustomer().getFullName());
            m.put("status", o.getStatus().name());
            m.put("grandTotal", finalAmount);
            m.put("debt", debt);
            return m;
        }).toList();
    }

    private void validateOrderModifiable(RepairOrder order) {
        OrderStatus status = order.getStatus();
        // Allow modification only in early stages
        if (OrderStatus.WAITING_FOR_PAYMENT.equals(status) || OrderStatus.COMPLETED.equals(status) ||
                OrderStatus.CLOSED.equals(status) || OrderStatus.CANCELLED.equals(status)) {
            throw new RuntimeException("Không thể chỉnh sửa đơn hàng ở trạng thái " + status.getDescription());
        }
    }

    // Bug 71 Fix: Strict State Machine Transition Helper
    private void validateTransition(OrderStatus current, OrderStatus next) {
        // Allow transition to HUY (Cancel) from almost any state except finished ones
        if (next == OrderStatus.CANCELLED) {
            if (current == OrderStatus.CLOSED || current == OrderStatus.COMPLETED) {
                throw new RuntimeException("Không thể hủy đơn hàng đã hoàn thành hoặc đã đóng.");
            }
            return;
        }

        boolean isValid = switch (next) {
            case RECEIVED -> current == null;
            case WAITING_FOR_DIAGNOSIS -> current == OrderStatus.RECEIVED;
            case QUOTING -> current == OrderStatus.WAITING_FOR_DIAGNOSIS || current == OrderStatus.RE_QUOTATION;
            case WAITING_FOR_CUSTOMER_APPROVAL -> current == OrderStatus.QUOTING || current == OrderStatus.WAITING_FOR_DIAGNOSIS;
            case APPROVED -> current == OrderStatus.WAITING_FOR_CUSTOMER_APPROVAL || current == OrderStatus.RE_QUOTATION;
            case WAITING_FOR_PARTS -> current == OrderStatus.APPROVED;
            case IN_PROGRESS -> current == OrderStatus.WAITING_FOR_PARTS || current == OrderStatus.IN_PROGRESS;
            case WAITING_FOR_QC -> current == OrderStatus.IN_PROGRESS;
            case WAITING_FOR_PAYMENT -> current == OrderStatus.WAITING_FOR_QC || current == OrderStatus.APPROVED;
            case COMPLETED -> current == OrderStatus.WAITING_FOR_PAYMENT;
            case CLOSED -> current == OrderStatus.COMPLETED || current == OrderStatus.WAITING_FOR_PAYMENT;
            case RE_QUOTATION -> current == OrderStatus.IN_PROGRESS || current == OrderStatus.WAITING_FOR_CUSTOMER_APPROVAL
                    || current == OrderStatus.WAITING_FOR_DIAGNOSIS;
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

        if (!OrderStatus.WAITING_FOR_CUSTOMER_APPROVAL.equals(order.getStatus())
                && !OrderStatus.RE_QUOTATION.equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng không ở trạng thái chờ duyệt");
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(OrderStatus.APPROVED);
        order.setApprovedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Audit log
        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(orderId)
                .action("APPROVE")
                .oldData(oldStatus.name())
                .newData(OrderStatus.APPROVED.name())
                .reason("Khách hàng duyệt báo giá")
                .userId(user.getId())
                .build());

        // Notify Sale
        if (order.getServiceAdvisor() != null) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .userId(order.getServiceAdvisor().getId())
                    .role("SALE")
                    .title("Khách đã duyệt: " + order.getReception().getVehicle().getLicensePlate())
                    .content("Báo giá đã được duyệt. Tiến hành sửa chữa.")
                    .type("UPDATE")
                    .link("/sale/orders/" + orderId)
                    .refId(orderId)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }

        // Notify Workshop Manager to assign/manage
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("QUAN_LY_XUONG")
                .title("Đơn hàng được duyệt: " + order.getReception().getVehicle().getLicensePlate())
                .content("Khách hàng đã duyệt báo giá. Vui lòng phân công thợ sửa chữa.")
                .type("SUCCESS")
                .link("/manager/orders/" + orderId)
                .refId(orderId)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        // Notify Mechanic
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("THO_SUA_CHUA")
                .title("Lệnh mới: " + order.getReception().getVehicle().getLicensePlate())
                .content("Báo giá được duyệt, sẵn sàng nhận việc.")
                .type("INFO")
                .link("/mechanic/jobs/" + orderId)
                .refId(orderId)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        // Notify Warehouse (CRITICAL MISSING FEATURE RESTORED)
        boolean hasParts = order.getOrderItems().stream().anyMatch(i -> !i.getProduct().getIsService());
        if (hasParts) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .role("KHO")
                    .title("Phiếu xuất kho mới: " + order.getReception().getVehicle().getLicensePlate())
                    .content("Đơn hàng đã được duyệt bởi khách. Vui lòng chuẩn bị vật tư.")
                    .type("INFO")
                    .link("/warehouse/export/" + order.getId())
                    .refId(order.getId())
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }
    }

    @Transactional
    public void rejectQuoteByCustomer(Integer orderId, String reason, User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!OrderStatus.WAITING_FOR_CUSTOMER_APPROVAL.equals(order.getStatus())
                && !OrderStatus.RE_QUOTATION.equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng không ở trạng thái chờ duyệt");
        }

        String actualReason = (reason == null || reason.isEmpty()) ? "Không rõ lý do" : reason;
        OrderStatus oldStatus = order.getStatus();
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Audit log
        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(orderId)
                .action("REJECT")
                .oldData(oldStatus.name())
                .newData(OrderStatus.CANCELLED.name())
                .reason("Khách hàng từ chối: " + actualReason)
                .userId(user.getId())
                .build());

        // Notify Sale
        if (order.getServiceAdvisor() != null) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .userId(order.getServiceAdvisor().getId())
                    .role("SALE")
                    .title("Báo giá bị từ chối: " + order.getReception().getVehicle().getLicensePlate())
                    .content("Lý do: " + actualReason)
                    .type("WARNING")
                    .link("/sale/orders/" + orderId)
                    .refId(orderId)
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

        OrderStatus oldStatus = order.getStatus();
        // Bug 71 Fix: Strict State Machine Transition
        // Replenishment (bổ sung báo giá) only allowed during repair
        validateTransition(oldStatus, OrderStatus.RE_QUOTATION);

        order.setStatus(OrderStatus.RE_QUOTATION);
        order.setNotes(note);
        orderRepository.save(order);

        // Audit log
        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(orderId)
                .action("REQUEST_REVISION")
                .oldData(oldStatus.name())
                .newData(OrderStatus.RE_QUOTATION.name())
                .reason("Khách yêu cầu chỉnh sửa: " + note)
                .userId(user.getId())
                .build());

        // Notify Sale
        if (order.getServiceAdvisor() != null) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .userId(order.getServiceAdvisor().getId())
                    .role("SALE")
                    .title("Yêu cầu chỉnh báo giá: " + order.getReception().getVehicle().getLicensePlate())
                    .content("Khách hàng yêu cầu chỉnh sửa báo giá. Ghi chú: " + note)
                    .type("WARNING")
                    .link("/sale/orders/" + orderId)
                    .refId(orderId)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }
    }
}
