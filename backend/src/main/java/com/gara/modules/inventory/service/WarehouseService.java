package com.gara.modules.inventory.service;

import com.gara.dto.ProductDTO;
import com.gara.entity.*;
import com.gara.modules.inventory.dto.ImportHistoryDto;
import com.gara.modules.inventory.dto.ImportItemDto;
import com.gara.modules.inventory.repository.*;
import com.gara.modules.service.repository.*;
import com.gara.modules.auth.repository.*;
import com.gara.modules.system.repository.*;
import com.gara.modules.service.service.OrderCalculationService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.gara.modules.support.service.AsyncNotificationService;
import com.gara.modules.support.service.RealtimeService;
import java.time.LocalDateTime;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.gara.entity.enums.OrderStatus;
import com.gara.entity.enums.ItemStatus;

@Service
public class WarehouseService {

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final ExportNoteRepository exportNoteRepository;
    private final RepairOrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final ImportNoteRepository importNoteRepository;
    private final ImportDetailRepository importDetailRepository;
    private final ExportDetailRepository exportDetailRepository;
    private final com.gara.modules.support.service.AsyncAuditService asyncAuditService;
    private final OrderCalculationService orderCalculationService;
    private final AsyncNotificationService asyncNotificationService;
    private final RealtimeService realtimeService;

    public WarehouseService(ProductRepository productRepository,
            OrderItemRepository orderItemRepository,
            ExportNoteRepository exportNoteRepository,
            RepairOrderRepository orderRepository,
            UserRepository userRepository,
            AuditLogRepository auditLogRepository,
            ImportNoteRepository importNoteRepository,
            ImportDetailRepository importDetailRepository,
            ExportDetailRepository exportDetailRepository,
            com.gara.modules.support.service.AsyncAuditService asyncAuditService,
            OrderCalculationService orderCalculationService,
            AsyncNotificationService asyncNotificationService,
            RealtimeService realtimeService) {
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.exportNoteRepository = exportNoteRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.importNoteRepository = importNoteRepository;
        this.importDetailRepository = importDetailRepository;
        this.exportDetailRepository = exportDetailRepository;
        this.asyncAuditService = asyncAuditService;
        this.orderCalculationService = orderCalculationService;
        this.asyncNotificationService = asyncNotificationService;
        this.realtimeService = realtimeService;
    }

    public List<ProductDTO> getProducts(String search) {
        List<Product> products;
        if (search != null && !search.isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCase(search);
        } else {
            products = productRepository.findAll();
        }

        return products.stream().map(this::mapToDTO).toList();
    }

    public ProductDTO getProduct(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToDTO(product);
    }

    @Transactional
    public Integer exportOrder(Integer orderId, Integer userId) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (OrderStatus.COMPLETED.equals(order.getStatus()) || OrderStatus.SETTLED.equals(order.getStatus())) {
            throw new RuntimeException("Order is already completed or settled.");
        }

        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<OrderItem> items = order.getOrderItems().stream()
                .filter(i -> ItemStatus.CUSTOMER_APPROVED.equals(i.getStatus()) && !i.getProduct().getIsService())
                .toList();

        if (items.isEmpty()) {
            throw new RuntimeException("No parts approved for export.");
        }

        for (OrderItem item : items) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName() + 
                    " (Required: " + item.getQuantity() + ", Available: " + product.getStockQuantity() + ")");
            }
        }

        ExportNote exportNote = new ExportNote();
        exportNote.setRepairOrder(order);
        exportNote.setCreator(creator);
        exportNote.setExportType("REPAIR");
        exportNote.setExportDetails(new ArrayList<>());
        
        for (OrderItem item : items) {
            Product product = item.getProduct();
            int remainingQuantity = item.getQuantity();

            List<ImportDetail> batches = importDetailRepository.findAvailableBatches(product.getId());

            for (ImportDetail batch : batches) {
                if (remainingQuantity <= 0) break;
                int canTake = Math.min(batch.getRemainingQuantity(), remainingQuantity);
                batch.setRemainingQuantity(batch.getRemainingQuantity() - canTake);
                importDetailRepository.save(batch);
                remainingQuantity -= canTake;
            }

            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);

            ExportDetail detail = new ExportDetail();
            detail.setExportNote(exportNote);
            detail.setProduct(product);
            detail.setQuantity(item.getQuantity());
            detail.setExportPrice(item.getUnitPrice());
            detail.setTotalAmount(item.getTotalAmount());
            exportNote.getExportDetails().add(detail);

            item.setStatus(ItemStatus.EXPORTED);
            orderItemRepository.save(item);
        }

        exportNoteRepository.save(exportNote);

        if (OrderStatus.APPROVED.equals(order.getStatus()) || OrderStatus.WAITING_FOR_PARTS.equals(order.getStatus())) {
            order.setStatus(OrderStatus.IN_PROGRESS);
            orderRepository.save(order);
        }

        auditLogRepository.save(AuditLog.builder()
                .tableName("ExportNote")
                .recordId(exportNote.getId())
                .action("CREATE")
                .newData("Created for Order #" + orderId)
                .userId(userId)
                .build());
                
        return exportNote.getId();
    }

    @Transactional
    public void returnStock(Integer orderId, Integer productId, Integer quantity, String reason, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.hasPermission("MANAGE_INVENTORY") && !user.isAdmin()) {
            throw new RuntimeException("Bạn không có quyền hoàn nhập kho.");
        }

        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean hasExportNote = !order.getExportNotes().isEmpty();
        if (!hasExportNote) {
            throw new RuntimeException("Đơn hàng chưa thực hiện xuất kho, không thể hoàn nhập.");
        }

        OrderItem orderItem = order.getOrderItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId)
                        && !ItemStatus.CUSTOMER_REJECTED.equals(i.getStatus()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong đơn hàng."));

        if (orderItem.getQuantity() < quantity) {
            throw new RuntimeException("Số lượng hoàn trả vượt quá số lượng trong đơn hàng.");
        }
        
        Product product = productRepository.findByIdWithLock(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);

        if (orderItem.getQuantity() == quantity) {
            orderItem.setStatus(ItemStatus.CUSTOMER_REJECTED);
            orderItem.setQuantity(0);
            orderItem.setTotalAmount(BigDecimal.ZERO);
        } else {
            orderItem.setQuantity(orderItem.getQuantity() - quantity);
            orderItem.setTotalAmount(orderItem.getUnitPrice().multiply(new BigDecimal(orderItem.getQuantity())));
        }
        orderItemRepository.save(orderItem);

        BigDecimal deltaValue = orderItem.getUnitPrice().multiply(new BigDecimal(quantity)).negate();
        orderCalculationService.updateTotalsIncrementally(order.getId(), deltaValue, false);

        AuditLog log = AuditLog.builder()
                .tableName("Warehouse")
                .recordId(orderId)
                .action("RETURN")
                .newData("Returned Part ID: " + productId + ", Qty: " + quantity)
                .reason(reason)
                .userId(userId)
                .build();
        auditLogRepository.save(log);
    }

    private ProductDTO mapToDTO(Product p) {
        return ProductDTO.builder()
                .id(p.getId())
                .code(p.getSku())
                .name(p.getName())
                .price(p.getRetailPrice())
                .costPrice(p.getCostPrice())
                .stock(p.getStockQuantity())
                .minStock(p.getMinStockLevel())
                .isService(p.getIsService())
                .allowWarranty(p.getIsWarrantyEligible())
                .build();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingExportOrders() {
        List<OrderStatus> statuses = java.util.Arrays.asList(OrderStatus.APPROVED, OrderStatus.WAITING_FOR_PARTS,
                OrderStatus.IN_PROGRESS);
        List<RepairOrder> orders = orderRepository.findWithDetailsByStatusIn(statuses);

        return orders.stream()
                .map(order -> {
                    boolean hasExported = !order.getExportNotes().isEmpty();
                    if (OrderStatus.IN_PROGRESS.equals(order.getStatus()) && hasExported) {
                        return null;
                    }

                    List<OrderItem> parts = order.getOrderItems().stream()
                            .filter(i -> !i.getProduct().getIsService()
                                    && ItemStatus.CUSTOMER_APPROVED.equals(i.getStatus()))
                            .toList();

                    if (parts.isEmpty())
                        return null;

                    Map<String, Object> map = new HashMap<>();
                    map.put("id", order.getId());
                    map.put("plate", order.getReception().getVehicle().getLicensePlate());
                    map.put("customerName", order.getReception().getVehicle().getCustomer().getFullName());
                    map.put("createdAt", order.getCreatedAt());
                    map.put("finishedAt", hasExported ? order.getExportNotes().get(0).getExportDate() : null);
                    map.put("itemCount", parts.size());

                    BigDecimal totalValue = parts.stream()
                            .map(OrderItem::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    map.put("totalValue", totalValue);
                    map.put("hasExported", hasExported);
                    map.put("status", order.getStatus() != null ? order.getStatus().name() : null);

                    return map;
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOrderExportDetails(Integer orderId) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean hasExported = !order.getExportNotes().isEmpty();
        java.util.Set<Integer> exportedProductIds = new java.util.HashSet<>();
        if (hasExported) {
            order.getExportNotes()
                    .forEach(p -> p.getExportDetails()
                            .forEach(d -> exportedProductIds.add(d.getProduct().getId())));
        }

        List<Map<String, Object>> items = order.getOrderItems().stream()
                .filter(i -> !i.getProduct().getIsService() && ItemStatus.CUSTOMER_APPROVED.equals(i.getStatus()))
                .map(i -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", i.getId());
                    m.put("productId", i.getProduct().getId());
                    m.put("productCode", i.getProduct().getSku());
                    m.put("productName", i.getProduct().getName());
                    m.put("quantity", i.getQuantity());
                    m.put("unitPrice", i.getUnitPrice());
                    m.put("stockQty", i.getProduct().getStockQuantity());
                    m.put("isExported", exportedProductIds.contains(i.getProduct().getId()));
                    return m;
                })
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("id", order.getId());
        result.put("status", order.getStatus() != null ? order.getStatus().name() : null);
        result.put("plate", order.getReception().getVehicle().getLicensePlate());
        result.put("customerName", order.getReception().getVehicle().getCustomer().getFullName());
        result.put("customerPhone", order.getReception().getVehicle().getCustomer().getPhone());
        result.put("vehicleBrand", order.getReception().getVehicle().getBrand());
        result.put("vehicleModel", order.getReception().getVehicle().getModel());
        result.put("createdAt", order.getCreatedAt());
        result.put("items", items);
        result.put("hasExported", hasExported);

        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        long pendingOrders = orderRepository.countByStatus(OrderStatus.APPROVED);
        long lowStockItems = productRepository.countLowStockProducts();
        java.time.LocalDateTime todayStart = java.time.LocalDate.now().atStartOfDay();

        long recentExports = exportNoteRepository.countByExportDateAfter(todayStart);
        long recentImports = importNoteRepository.countByImportDateAfter(todayStart);

        Map<String, Object> stats = new HashMap<>();
        stats.put("pendingOrders", pendingOrders);
        stats.put("lowStockItems", lowStockItems);
        stats.put("recentExports", recentExports);
        stats.put("recentImports", recentImports);
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getExportSlip(Integer orderId) {
        ExportNote note = exportNoteRepository.findTopByRepairOrderIdOrderByExportDateDesc(orderId)
                .orElseThrow(() -> new RuntimeException("Export slip not found"));

        List<Map<String, Object>> items = note.getExportDetails().stream()
                .map(i -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("ID", i.getId());
                    m.put("productCode", i.getProduct().getSku());
                    m.put("productName", i.getProduct().getName());
                    m.put("quantity", i.getQuantity());
                    m.put("unitPrice", i.getExportPrice());
                    m.put("total", i.getTotalAmount());
                    return m;
                }).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("ID", note.getId());
        result.put("exportDate", note.getExportDate());
        result.put("orderId", orderId);
        result.put("plate", note.getRepairOrder().getReception().getVehicle().getLicensePlate());
        result.put("customerName", note.getRepairOrder().getReception().getVehicle().getCustomer().getFullName());
        result.put("customerPhone",
                note.getRepairOrder().getReception().getVehicle().getCustomer().getPhone());
        result.put("creatorName", note.getCreator() != null ? note.getCreator().getFullName() : "N/A");
        result.put("items", items);

        return result;
    }

    @Transactional
    public Integer importStock(com.gara.dto.ImportRequestDTO req, Integer userId) {
        if (req.items() == null || req.items().isEmpty()) {
            throw new RuntimeException("Danh sách nhập kho trống");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check User Permission
        // Rule: All imports must be approved by Admin regardless of who creates it
        String status = "PENDING";

        ImportNote note = new ImportNote();
        note.setImportCode("PN" + System.currentTimeMillis());
        note.setCreator(user);
        note.setImportDate(java.time.LocalDateTime.now());
        note.setSupplierName(req.supplierName());
        note.setNote(req.note());
        note.setStatus(status);
        note.setImportDetails(new ArrayList<>());

        BigDecimal totalImportValue = BigDecimal.ZERO;

        // Setup BATCH LISTS
        List<ImportDetail> detailsToSave = new ArrayList<>();

        for (com.gara.dto.ImportRequestDTO.ImportItemDTO item : req.items()) {
            Product product = productRepository.findByIdWithLock(item.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.productId()));

            if (item.quantity() <= 0) {
                throw new RuntimeException("Số lượng nhập phải lớn hơn 0");
            }
            if (item.costPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Giá vốn nhập không được âm");
            }

            int importQty = item.quantity();
            BigDecimal importCost = item.costPrice();
            
            // VAT is now removed from import process, default to 0
            BigDecimal importVat = BigDecimal.ZERO;

            // Value calculation (Net = Gross since VAT is 0)
            BigDecimal newImportValue = importCost.multiply(new BigDecimal(importQty));

            // Stock update is deferred to approveImport method
            // Only prepare details for the pending note

            ImportDetail detail = new ImportDetail();
            detail.setImportNote(note);
            detail.setProduct(product);
            detail.setQuantity(importQty);
            detail.setImportPrice(importCost);
            detail.setVatRate(importVat); 
            detail.setTotalAmount(newImportValue); 
            detail.setExpiryDate(item.expiryDate());
            detail.setRemainingQuantity(importQty);

            note.getImportDetails().add(detail);
            detailsToSave.add(detail);
            totalImportValue = totalImportValue.add(newImportValue);
        }

        note.setTotalAmount(totalImportValue);
        importNoteRepository.save(note);

        if (!detailsToSave.isEmpty()) {
            importDetailRepository.saveAll(detailsToSave);
        }

        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("ImportNote")
                .recordId(note.getId())
                .action("CREATE")
                .newData("Import from " + req.supplierName() + " - Total: " + totalImportValue)
                .userId(userId)
                .build());

        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("ADMIN")
                .title("Có phiếu nhập kho mới chờ duyệt")
                .content("Phiếu nhập " + note.getImportCode() + " từ " + req.supplierName() + " cần được phê duyệt.")
                .type("INFO")
                .link("/admin/inventory/import/" + note.getId())
                .refId(note.getId())
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        Map<String, Object> sseData = new HashMap<>();
        sseData.put("importNoteId", note.getId());
        sseData.put("message", "New import note pending approval");
        realtimeService.broadcastToTopic("role:ADMIN", "IMPORT_PENDING_APPROVAL", sseData);

        return note.getId();
    }

    @Transactional
    public void adjustStock(Integer productId, Integer actualQuantity, String reason, Integer userId) {
        Product product = productRepository.findByIdWithLock(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        int oldStock = product.getStockQuantity();
        int diff = actualQuantity - oldStock;

        if (diff == 0)
            return;

        product.setStockQuantity(actualQuantity);
        productRepository.save(product);

        auditLogRepository.save(AuditLog.builder()
                .tableName("InventoryCheck")
                .recordId(productId)
                .action("ADJUST")
                .oldData("Old Stock: " + oldStock)
                .newData("New Stock: " + actualQuantity)
                .reason(reason)
                .userId(userId)
                .build());
    }

    @Transactional(readOnly = true)
    public List<ImportHistoryDto> getImportHistory() {
        List<ImportNote> notes = importNoteRepository.findAll(
                Sort.by(Sort.Direction.DESC, "importDate"));

        return notes.stream()
                .limit(100)
                .map(note -> new ImportHistoryDto(
                        note.getId(),
                        note.getImportCode(),
                        note.getImportDate(),
                        note.getSupplierName(),
                        note.getTotalAmount(),
                        note.getCreator() != null ? note.getCreator().getFullName() : "N/A",
                        note.getStatus(),
                        note.getImportDetails().stream()
                                .map(d -> new ImportItemDto(
                                        d.getId(),
                                        d.getProduct().getName(),
                                        d.getQuantity(),
                                        d.getImportPrice(),
                                        d.getVatRate(),
                                        d.getTotalAmount(),
                                        d.getExpiryDate()))
                                .toList()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExportHistory() {
        List<ExportNote> notes = exportNoteRepository.findAllWithDetails();

        return notes.stream().limit(100).map(note -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", note.getId());
            map.put("date", note.getExportDate());

            String vehicleInfo = "N/A (Hủy/Khác)";
            if (note.getExportType() != null && note.getExportType().equals("REPAIR")) {
                if (note.getRepairOrder() != null && note.getRepairOrder().getReception() != null) {
                    vehicleInfo = note.getRepairOrder().getReception().getVehicle().getLicensePlate();
                } else {
                    vehicleInfo = "N/A (Lỗi dữ liệu)";
                }
            }
            map.put("vehicle", vehicleInfo);
            map.put("creator", note.getCreator() != null ? note.getCreator().getFullName() : "N/A");

            BigDecimal total = BigDecimal.ZERO;
            if (note.getExportDetails() != null) {
                total = note.getExportDetails().stream()
                        .map(d -> d.getTotalAmount() != null ? d.getTotalAmount() : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            }
            map.put("total", total);

            List<Map<String, Object>> items = new ArrayList<>();
            if (note.getExportDetails() != null) {
                items = note.getExportDetails().stream().map(d -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("productName", d.getProduct().getName());
                    itemMap.put("quantity", d.getQuantity());
                    return itemMap;
                }).toList();
            }

            map.put("items", items);
            return map;
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getProductBatches(Integer productId) {
        List<ImportDetail> batches = importDetailRepository.findAvailableBatches(productId);

        return batches.stream().map(b -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", b.getId());
            map.put("importDate", b.getImportNote().getImportDate());
            map.put("expiryDate", b.getExpiryDate());
            map.put("initialQty", b.getQuantity());
            map.put("remainingQty", b.getRemainingQuantity());
            map.put("supplier", b.getImportNote().getSupplierName());
            return map;
        }).toList();
    }

    @Transactional
    public void disposeBatch(Integer batchId, Integer userId) {
        ImportDetail batch = importDetailRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        if (batch.getRemainingQuantity() <= 0) {
            throw new RuntimeException("Batch is empty or cancelled.");
        }

        User user = userRepository.findById(userId).orElseThrow();
        Product product = batch.getProduct();

        ExportNote exportNote = new ExportNote();
        exportNote.setExportType("DISPOSE");
        exportNote.setCreator(user);
        exportNote.setExportDate(java.time.LocalDateTime.now());
        exportNote.setExportDetails(new ArrayList<>());

        exportNote = exportNoteRepository.save(exportNote);

        product.setStockQuantity(product.getStockQuantity() - batch.getRemainingQuantity());
        productRepository.save(product);

        ExportDetail detail = new ExportDetail();
        detail.setExportNote(exportNote);
        detail.setProduct(product);
        detail.setQuantity(batch.getRemainingQuantity());
        detail.setExportPrice(BigDecimal.ZERO);
        detail.setTotalAmount(BigDecimal.ZERO);

        exportNote.getExportDetails().add(detail);
        exportNoteRepository.save(exportNote);

        batch.setRemainingQuantity(0);
        importDetailRepository.save(batch);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getProductMovements(Integer productId) {
        List<Map<String, Object>> movements = new ArrayList<>();

        importDetailRepository.findAllByProductId(productId).forEach(d -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", d.getId());
            m.put("date", d.getImportNote().getImportDate());
            m.put("action", "NHAP_KHO");
            m.put("quantity", d.getQuantity());
            m.put("reason", "Nhập hàng từ " + d.getImportNote().getSupplierName());
            m.put("user", d.getImportNote().getCreator() != null ? d.getImportNote().getCreator().getFullName() : "N/A");
            movements.add(m);
        });

        exportDetailRepository.findAllByProductId(productId).forEach(d -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", d.getId());
            m.put("date", d.getExportNote().getExportDate());
            m.put("action", d.getExportNote().getExportType());
            m.put("quantity", -d.getQuantity());

            String reason = "Xuất kho";
            if ("DISPOSE".equals(d.getExportNote().getExportType()) || "HUY_HANG".equals(d.getExportNote().getExportType())) {
                reason = "Thanh lý lô hàng";
            } else if (d.getExportNote().getRepairOrder() != null) {
                reason = "Xuất sửa chữa xe "
                        + d.getExportNote().getRepairOrder().getReception().getVehicle().getLicensePlate();
            }
            m.put("reason", reason);
            m.put("user",
                    d.getExportNote().getCreator() != null ? d.getExportNote().getCreator().getFullName() : "N/A");
            movements.add(m);
        });

        auditLogRepository.findByTableNameAndRecordId("InventoryCheck", productId).forEach(log -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", log.getId());
            m.put("date", log.getCreatedAt());
            m.put("action", "DIEU_CHINH");
            m.put("quantity", 0);
            m.put("reason", "Kiểm kho: " + log.getReason());
            m.put("user", log.getUser() != null ? log.getUser().getFullName() : "System");
            movements.add(m);
        });

        // Optimized: Fetch only relevant logs from DB
        auditLogRepository.findReturnLogsByProduct("Returned Part ID: " + productId + ",")
                .forEach(log -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", log.getId());
                    m.put("date", log.getCreatedAt());
                    m.put("action", "HOAN_NHAP");

                    int qty = 0;
                    try {
                        String info = log.getNewData();
                        String qtyStr = info.substring(info.lastIndexOf("Qty: ") + 5);
                        qty = Integer.parseInt(qtyStr);
                    } catch (Exception e) {
                    }

                    m.put("quantity", qty);
                    m.put("reason", "Thợ trả đồ: " + log.getReason());
                    m.put("user", log.getUser() != null ? log.getUser().getFullName() : "N/A");
                    movements.add(m);
                });

        movements.sort(
                (a, b) -> ((java.time.LocalDateTime) b.get("date")).compareTo((java.time.LocalDateTime) a.get("date")));

        return movements;

    }

    @Transactional(readOnly = true)
    public Map<String, Object> getImportNoteDetail(Integer id) {
        ImportNote note = importNoteRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Import note not found"));

        Map<String, Object> result = new HashMap<>();
        result.put("id", note.getId());
        result.put("code", note.getImportCode());
        result.put("date", note.getImportDate());
        result.put("supplier", note.getSupplierName());
        result.put("note", note.getNote());
        result.put("total", note.getTotalAmount());
        result.put("creator", note.getCreator() != null ? note.getCreator().getFullName() : "N/A");

        List<Map<String, Object>> items = note.getImportDetails().stream()
                .map(d -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("productName", d.getProduct().getName());
                    itemMap.put("productCode", d.getProduct().getSku());
                    itemMap.put("quantity", d.getQuantity());
                    itemMap.put("unitPrice", d.getImportPrice());
                    itemMap.put("total", d.getTotalAmount());
                    return itemMap;
                }).toList();

        result.put("items", items);
        return result;
    }

    public List<ImportHistoryDto> getAllImports(String status) {
        List<ImportNote> notes;
        if (status != null && !"ALL".equals(status) && !status.isEmpty()) {
            notes = importNoteRepository.findByStatus(status);
        } else {
            notes = importNoteRepository.findAll(Sort.by(Sort.Direction.DESC, "importDate"));
        }

        return notes.stream().map(note -> new ImportHistoryDto(
                note.getId(),
                note.getImportCode(),
                note.getImportDate(),
                note.getSupplierName(),
                note.getTotalAmount(),
                note.getCreator() != null ? note.getCreator().getFullName() : "N/A",
                note.getStatus(),
                note.getImportDetails().stream()
                        .map(d -> new ImportItemDto(
                                d.getId(),
                                d.getProduct().getName(),
                                d.getQuantity(),
                                d.getImportPrice(),
                                d.getVatRate(),
                                d.getTotalAmount(),
                                d.getExpiryDate()))
                        .toList()))
                .toList();
    }

    @Transactional
    public void approveImport(Integer importId, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.hasPermission("MANAGE_INVENTORY") && !user.isAdmin()) {
            throw new RuntimeException("Bạn không có quyền duyệt phiếu nhập kho.");
        }

        ImportNote note = importNoteRepository.findByIdWithDetails(importId)
                .orElseThrow(() -> new RuntimeException("Import Note not found"));

        if (!"PENDING".equals(note.getStatus())) {
            throw new RuntimeException("Chỉ có thể duyệt phiếu nhập ở trạng thái PENDING");
        }

        for (ImportDetail detail : note.getImportDetails()) {
            Product product = detail.getProduct();

            // Update Inventory
            int oldStock = product.getStockQuantity();
            int importQty = detail.getQuantity();
            product.setStockQuantity(oldStock + importQty);

            // Update Cost Price (Weighted Average)
            BigDecimal currentTotalValue = product.getCostPrice().multiply(new BigDecimal(oldStock));
            BigDecimal newImportValue = detail.getImportPrice().multiply(new BigDecimal(importQty));
            BigDecimal newTotalQty = new BigDecimal(oldStock + importQty);

            if (newTotalQty.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal newAvgCost = currentTotalValue.add(newImportValue)
                        .divide(newTotalQty, 2, java.math.RoundingMode.HALF_UP);
                product.setCostPrice(newAvgCost);
            }
            
            productRepository.save(product);
        }

        note.setStatus("COMPLETED");
        importNoteRepository.save(note);

        auditLogRepository.save(AuditLog.builder()
                .tableName("ImportNote")
                .recordId(note.getId())
                .action("APPROVE")
                .newData("Approved by User ID: " + userId)
                .userId(userId)
                .build());
    }

    @Transactional
    public void rejectImport(Integer importId, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.hasPermission("MANAGE_INVENTORY") && !user.isAdmin()) {
            throw new RuntimeException("Bạn không có quyền từ chối phiếu nhập kho.");
        }

        ImportNote note = importNoteRepository.findById(importId)
                .orElseThrow(() -> new RuntimeException("Import Note not found"));

        if (!"PENDING".equals(note.getStatus())) {
            throw new RuntimeException("Chỉ có thể từ chối phiếu nhập ở trạng thái PENDING");
        }

        note.setStatus("REJECTED");
        importNoteRepository.save(note);

        auditLogRepository.save(AuditLog.builder()
                .tableName("ImportNote")
                .recordId(note.getId())
                .action("REJECT")
                .newData("Rejected by User ID: " + userId)
                .userId(userId)
                .build());
    }

    @Transactional
    public void updateProductPrices(List<com.gara.dto.PriceUpdateDTO> updates, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.hasPermission("MANAGE_INVENTORY") && !user.isAdmin()) {
            throw new RuntimeException("Bạn không có quyền cập nhật giá phụ tùng.");
        }

        for (com.gara.dto.PriceUpdateDTO update : updates) {
            Product product = productRepository.findByIdWithLock(update.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + update.productId()));

            BigDecimal oldPrice = product.getRetailPrice();
            product.setRetailPrice(update.newPrice());
            productRepository.save(product);

            if (oldPrice.compareTo(update.newPrice()) != 0) {
                auditLogRepository.save(AuditLog.builder()
                        .tableName("Product")
                        .recordId(product.getId())
                        .action("UPDATE_PRICE")
                        .oldData("Old Price: " + oldPrice)
                        .newData("New Price: " + update.newPrice())
                        .userId(userId)
                        .build());
            }
        }
    }

    @Transactional
    public void returnStockFromCancelledOrder(Integer orderId, Integer userId) {
        List<ExportDetail> exports = exportDetailRepository.findByOrderId(orderId);

        for (ExportDetail export : exports) {
            Product product = export.getProduct();
            int quantityToReturn = export.getQuantity();
            
            // Global Stock Update
            product.setStockQuantity(product.getStockQuantity() + quantityToReturn);
            productRepository.save(product);

            // Bug 124 Fix: Restore Batch Stock (LIFO Reverse approach)
            // Since ExportDetail doesn't link to a specific batch, we return to the newest batches 
            // of the same product to ensure they are available for sale again.
            List<ImportDetail> batches = importDetailRepository.findAllByProductIdOrderByImportDateDesc(product.getId());
            int remainingToRestore = quantityToReturn;
            
            for (ImportDetail batch : batches) {
                if (remainingToRestore <= 0) break;
                
                // We can't exceed original batch size (quantity)
                int capacity = batch.getQuantity() - (batch.getRemainingQuantity() != null ? batch.getRemainingQuantity() : 0);
                if (capacity <= 0) continue;
                
                int restore = Math.min(capacity, remainingToRestore);
                batch.setRemainingQuantity((batch.getRemainingQuantity() != null ? batch.getRemainingQuantity() : 0) + restore);
                importDetailRepository.save(batch);
                
                remainingToRestore -= restore;
            }

            // Use system audit log for inventory changes
            asyncAuditService.logAsync(AuditLog.builder()
                    .tableName("Product")
                    .recordId(product.getId())
                    .action("UPDATE")
                    .newData("Hoàn kho: +" + quantityToReturn + ". Tồn mới: " + product.getStockQuantity() + 
                               (remainingToRestore > 0 ? " (Cảnh báo: " + remainingToRestore + " không thể trả lại lô cũ)" : ""))
                    .reason("Hủy đơn hàng #" + orderId)
                    .userId(userId)
                    .build());
        }
    }
}
