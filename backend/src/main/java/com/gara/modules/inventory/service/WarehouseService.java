package com.gara.modules.inventory.service;

import com.gara.dto.ProductDTO;
import com.gara.entity.*;
import com.gara.modules.inventory.dto.ImportHistoryDto;
import com.gara.modules.inventory.dto.ImportItemDto;
import com.gara.modules.inventory.repository.*;
import com.gara.modules.service.repository.*;
import com.gara.modules.auth.repository.*;
import com.gara.modules.system.repository.*;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WarehouseService {

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final ExportNoteRepository exportNoteRepository;
    private final RepairOrderRepository orderRepository;
    private final InventoryReservationService inventoryService;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final ImportNoteRepository importNoteRepository;
    private final ImportDetailRepository importDetailRepository;
    private final ExportDetailRepository exportDetailRepository;

    public WarehouseService(ProductRepository productRepository,
            OrderItemRepository orderItemRepository,
            ExportNoteRepository exportNoteRepository,
            RepairOrderRepository orderRepository,
            InventoryReservationService inventoryService,
            UserRepository userRepository,
            AuditLogRepository auditLogRepository,
            ImportNoteRepository importNoteRepository,
            ImportDetailRepository importDetailRepository,
            ExportDetailRepository exportDetailRepository) {
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.exportNoteRepository = exportNoteRepository;
        this.orderRepository = orderRepository;
        this.inventoryService = inventoryService;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.importNoteRepository = importNoteRepository;
        this.importDetailRepository = importDetailRepository;
        this.exportDetailRepository = exportDetailRepository;
    }

    public List<ProductDTO> getProducts(String search) {
        List<Product> products;
        if (search != null && !search.isEmpty()) {
            products = productRepository.findByTenHangContainingIgnoreCase(search);
        } else {
            // Optimized: Use paginated query instead of findAll()
            products = productRepository.findProductsPaginated();
        }

        return products.stream().map(this::mapToDTO).toList();
    }

    public ProductDTO getProduct(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToDTO(product);
    }

    /**
     * Confirm Export Order
     * 1. Check Reservation / Stock
     * 2. Decrement Stock
     * 3. Create Export Note
     * 4. Update Order Status
     */
    @Transactional
    public Integer exportOrder(Integer orderId, Integer userId) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Rule: Avoid duplicate exports
        if (!order.getPhieuXuatKho().isEmpty()) {
            return order.getPhieuXuatKho().get(0).getId();
        }

        // Rule 10.4: Check Deposit
        // Rule: Verify Status
        String status = order.getTrangThai();
        if (!"DA_DUYET".equals(status) && !"DANG_SUA".equals(status)) {
            throw new RuntimeException(
                    "Không thể xuất kho. Đơn hàng chưa được duyệt hoặc không ở trạng thái sửa chữa (Trạng thái: "
                            + status + ").");
        }

        java.math.BigDecimal threshold = new java.math.BigDecimal("5000000");
        java.math.BigDecimal minRate = new java.math.BigDecimal("0.3");
        if (order.getTongCong().compareTo(threshold) > 0) {
            java.math.BigDecimal minDeposit = order.getTongCong().multiply(minRate);
            if (order.getTienCoc().compareTo(minDeposit) < 0) {
                throw new RuntimeException("Đơn hàng chưa đủ tiền cọc để xuất kho (Cần tối thiểu 30%).");
            }
        }

        // 1. Get Items to Export (Customer Accepted, Not Service)
        List<OrderItem> items = order.getChiTietDonHang().stream()
                .filter(i -> "KHACH_DONG_Y".equals(i.getTrangThai()) && !i.getHangHoa().getLaDichVu())
                .toList();

        if (items.isEmpty()) {
            // If called from auto-export (completeJob), just return null if nothing to
            // export
            return null;
        }

        User user = userRepository.findById(userId).orElseThrow();

        // 2. Convert Reservation
        boolean hasReservation = inventoryService.convertReservation(orderId);

        // 3. Create Export Note Builder
        ExportNote exportNote = ExportNote.builder()
                .loaiXuat("SUA_CHUA")
                .nguoiTao(user)
                .donHangSuaChua(order)
                .chiTietXuatKho(new ArrayList<>())
                .build();

        // 4. Process Items with Row-level Locking (Rule 13)
        for (OrderItem item : items) {
            Product product = productRepository.findByIdWithLock(item.getHangHoa().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getHangHoa().getId()));

            // Stock Check Logic
            if (!hasReservation) {
                if (product.getSoLuongTon() < item.getSoLuong()) {
                    throw new RuntimeException("Không đủ tồn kho cho " + product.getTenHang() + ". Tồn: "
                            + product.getSoLuongTon() + ", Cần: " + item.getSoLuong());
                }
            }

            // --- FIFO DEDUCTION START ---
            int remainingToDeduct = item.getSoLuong();

            // Get Batches with remaining quantity > 0, sorted by Date ASC (FIFO)
            List<ImportDetail> batches = importDetailRepository.findAvailableBatches(product.getId());

            for (ImportDetail batch : batches) {
                if (remainingToDeduct <= 0)
                    break;

                int availableInBatch = batch.getSoLuongConLai() != null ? batch.getSoLuongConLai() : 0;
                if (availableInBatch <= 0)
                    continue;

                int deduct = Math.min(availableInBatch, remainingToDeduct);

                batch.setSoLuongConLai(availableInBatch - deduct);
                importDetailRepository.save(batch);

                remainingToDeduct -= deduct;
            }
            // --- FIFO DEDUCTION END ---

            // Decrement Global Stock
            product.setSoLuongTon(product.getSoLuongTon() - item.getSoLuong());

            // Fix: Prevent Negative Stock (Strict Check)
            if (product.getSoLuongTon() < 0) {
                throw new RuntimeException("Lỗi nghiêm trọng: Tồn kho bị âm cho sản phẩm " + product.getTenHang()
                        + " (ID: " + product.getId() + ")");
            }

            productRepository.save(product);

            // Add Detail
            ExportDetail detail = ExportDetail.builder()
                    .phieuXuatKho(exportNote)
                    .hangHoa(product)
                    .soLuong(item.getSoLuong())
                    .donGiaXuat(item.getDonGiaGoc())
                    .thanhTien(item.getThanhTien())
                    .build();

            exportNote.getChiTietXuatKho().add(detail);

            // Mark Item as DANG_SUA (In progress) if was just approved
            if ("KHACH_DONG_Y".equals(item.getTrangThai())) {
                item.setTrangThai("DANG_SUA");
                orderItemRepository.save(item);
            }
        }

        // 5. Save Export Note
        exportNoteRepository.save(exportNote);

        // 6. Update Order Status
        if ("DA_DUYET".equals(order.getTrangThai())) {
            order.setTrangThai("DANG_SUA");
            orderRepository.save(order);
        }

        return exportNote.getId();
    }

    /**
     * Reverse Logistics: Return items from Work Order to Stock
     * Trigger: Technician/Warehouse clerk returns unused parts
     */
    @Transactional
    public void returnStock(Integer orderId, Integer productId, Integer quantity, String reason, Integer userId) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Rule: Only allow return if was exported
        boolean hasExportNote = !order.getPhieuXuatKho().isEmpty();
        if (!hasExportNote) {
            throw new RuntimeException("Đơn hàng chưa thực hiện xuất kho, không thể hoàn nhập.");
        }

        OrderItem orderItem = order.getChiTietDonHang().stream()
                .filter(i -> i.getHangHoa().getId().equals(productId) && !"KHACH_TU_CHOI".equals(i.getTrangThai()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong đơn hàng."));

        if (orderItem.getSoLuong() < quantity) {
            throw new RuntimeException("Số lượng hoàn trả vượt quá số lượng trong đơn hàng.");
        }

        // Use Row-level Lock (Rule 13)
        Product product = productRepository.findByIdWithLock(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 1. Update Stock
        product.setSoLuongTon(product.getSoLuongTon() + quantity);
        productRepository.save(product);

        // 2. Update Order Item
        if (orderItem.getSoLuong() == quantity) {
            orderItem.setTrangThai("KHACH_TU_CHOI"); // Cancel this item effectively
            orderItem.setSoLuong(0);
            orderItem.setThanhTien(BigDecimal.ZERO);
        } else {
            orderItem.setSoLuong(orderItem.getSoLuong() - quantity);
            orderItem.setThanhTien(orderItem.getDonGiaGoc().multiply(new BigDecimal(orderItem.getSoLuong())));
        }
        orderItemRepository.save(orderItem);

        // 3. Recalculate Order Totals
        BigDecimal total = order.getChiTietDonHang().stream()
                .filter(i -> !"KHACH_TU_CHOI".equals(i.getTrangThai()))
                .map(OrderItem::getThanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTongTienHang(total);
        order.setTongCong(total);
        orderRepository.save(order);

        // 4. Traceability (Audit Log)
        AuditLog log = AuditLog.builder()
                .bang("Warehouse")
                .banGhiId(orderId)
                .hanhDong("RETURN")
                .duLieuMoi("Returned Part ID: " + productId + ", Qty: " + quantity)
                .lyDo(reason)
                .nguoiThucHienId(userId)
                .build();
        auditLogRepository.save(log);
    }

    private ProductDTO mapToDTO(Product p) {
        return ProductDTO.builder()
                .id(p.getId())
                .code(p.getMaHang())
                .name(p.getTenHang())
                .price(p.getGiaBanNiemYet())
                .costPrice(p.getGiaVon())
                .stock(p.getSoLuongTon())
                .minStock(p.getDinhMucTonToiThieu())
                .isService(p.getLaDichVu())
                .allowWarranty(p.getChoPhepBaoHanh())
                .build();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingExportOrders() {
        List<String> statuses = java.util.Arrays.asList("DA_DUYET", "CHO_SUA_CHUA", "DANG_SUA");
        List<RepairOrder> orders = orderRepository.findByTrangThaiInOrderByNgayTaoDesc(statuses);

        return orders.stream()
                .map(order -> {
                    boolean hasExported = !order.getPhieuXuatKho().isEmpty();
                    if ("DANG_SUA".equals(order.getTrangThai()) && hasExported) {
                        return null;
                    }

                    List<OrderItem> parts = order.getChiTietDonHang().stream()
                            .filter(i -> !i.getHangHoa().getLaDichVu() && "KHACH_DONG_Y".equals(i.getTrangThai()))
                            .toList();

                    if (parts.isEmpty())
                        return null;

                    Map<String, Object> map = new HashMap<>();
                    map.put("id", order.getId());
                    map.put("plate", order.getPhieuTiepNhan().getXe().getBienSo());
                    map.put("customerName", order.getPhieuTiepNhan().getXe().getKhachHang().getHoTen());
                    map.put("createdAt", order.getNgayTao());
                    map.put("finishedAt", hasExported ? order.getPhieuXuatKho().get(0).getNgayXuat() : null);
                    map.put("itemCount", parts.size());

                    BigDecimal totalValue = parts.stream()
                            .map(OrderItem::getThanhTien)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    map.put("totalValue", totalValue);
                    map.put("hasExported", hasExported);
                    map.put("status", order.getTrangThai());

                    return map;
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOrderExportDetails(Integer orderId) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean hasExported = !order.getPhieuXuatKho().isEmpty();
        java.util.Set<Integer> exportedProductIds = new java.util.HashSet<>();
        if (hasExported) {
            order.getPhieuXuatKho()
                    .forEach(p -> p.getChiTietXuatKho()
                            .forEach(d -> exportedProductIds.add(d.getHangHoa().getId())));
        }

        List<Map<String, Object>> items = order.getChiTietDonHang().stream()
                .filter(i -> !i.getHangHoa().getLaDichVu() && "KHACH_DONG_Y".equals(i.getTrangThai()))
                .map(i -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", i.getId());
                    m.put("productId", i.getHangHoa().getId());
                    m.put("productCode", i.getHangHoa().getMaHang());
                    m.put("productName", i.getHangHoa().getTenHang());
                    m.put("quantity", i.getSoLuong());
                    m.put("unitPrice", i.getDonGiaGoc());
                    m.put("stockQty", i.getHangHoa().getSoLuongTon());
                    m.put("isExported", exportedProductIds.contains(i.getHangHoa().getId()));
                    return m;
                })
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("id", order.getId());
        result.put("status", order.getTrangThai());
        result.put("plate", order.getPhieuTiepNhan().getXe().getBienSo());
        result.put("customerName", order.getPhieuTiepNhan().getXe().getKhachHang().getHoTen());
        result.put("customerPhone", order.getPhieuTiepNhan().getXe().getKhachHang().getSoDienThoai());
        result.put("vehicleBrand", order.getPhieuTiepNhan().getXe().getNhanHieu());
        result.put("vehicleModel", order.getPhieuTiepNhan().getXe().getModel());
        result.put("createdAt", order.getNgayTao());
        result.put("items", items);
        result.put("hasExported", hasExported);

        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        long pendingOrders = orderRepository.countByTrangThai("DA_DUYET");
        long lowStockItems = productRepository.countLowStockProducts();
        java.time.LocalDateTime todayStart = java.time.LocalDate.now().atStartOfDay();

        long recentExports = exportNoteRepository.countByNgayXuatAfter(todayStart);
        long recentImports = importNoteRepository.countByNgayNhapAfter(todayStart);

        Map<String, Object> stats = new HashMap<>();
        stats.put("pendingOrders", pendingOrders);
        stats.put("lowStockItems", lowStockItems);
        stats.put("recentExports", recentExports);
        stats.put("recentImports", recentImports);
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getExportSlip(Integer orderId) {
        ExportNote note = exportNoteRepository.findTopByDonHangSuaChuaIdOrderByNgayXuatDesc(orderId)
                .orElseThrow(() -> new RuntimeException("Export slip not found"));

        List<Map<String, Object>> items = note.getChiTietXuatKho().stream()
                .map(i -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("ID", i.getId());
                    m.put("productCode", i.getHangHoa().getMaHang());
                    m.put("productName", i.getHangHoa().getTenHang());
                    m.put("quantity", i.getSoLuong());
                    m.put("unitPrice", i.getDonGiaXuat());
                    m.put("total", i.getThanhTien());
                    return m;
                }).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("ID", note.getId());
        result.put("ngayXuat", note.getNgayXuat());
        result.put("orderId", orderId);
        result.put("plate", note.getDonHangSuaChua().getPhieuTiepNhan().getXe().getBienSo());
        result.put("customerName", note.getDonHangSuaChua().getPhieuTiepNhan().getXe().getKhachHang().getHoTen());
        result.put("customerPhone",
                note.getDonHangSuaChua().getPhieuTiepNhan().getXe().getKhachHang().getSoDienThoai());
        result.put("creatorName", note.getNguoiTao() != null ? note.getNguoiTao().getHoTen() : "N/A");
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

        // Check User Role to determine Status
        boolean isAuthorized = "ADMIN".equals(user.getVaiTro()) || "MANAGER".equals(user.getVaiTro());
        String status = isAuthorized ? "COMPLETED" : "PENDING";

        ImportNote note = ImportNote.builder()
                .maPhieu("PN" + System.currentTimeMillis())
                .nguoiNhap(user)
                .ngayNhap(java.time.LocalDateTime.now())
                .nhaCungCap(req.supplierName())
                .ghiChu(req.note())
                .trangThai(status)
                .chiTietNhap(new ArrayList<>())
                .build();

        BigDecimal totalImportValue = BigDecimal.ZERO;

        for (com.gara.dto.ImportRequestDTO.ImportItemDTO item : req.items()) {
            Product product = productRepository.findByIdWithLock(item.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.productId()));

            if (item.quantity() <= 0) {
                throw new RuntimeException("Số lượng nhập phải lớn hơn 0");
            }
            if (item.costPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Giá vốn nhập không được âm");
            }

            int oldStock = product.getSoLuongTon();
            BigDecimal oldCost = product.getGiaVon();
            int importQty = item.quantity();
            BigDecimal importCost = item.costPrice();
            BigDecimal importVat = item.vatRate() != null ? item.vatRate() : new BigDecimal("10.00");

            BigDecimal currentTotalValue = oldCost.multiply(new BigDecimal(oldStock));
            BigDecimal newImportValue = importCost.multiply(new BigDecimal(importQty));
            BigDecimal newTotalQty = new BigDecimal(oldStock + importQty);

            if ("COMPLETED".equals(status)) {
                if (newTotalQty.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal newAvgCost = currentTotalValue.add(newImportValue)
                            .divide(newTotalQty, 2, java.math.RoundingMode.HALF_UP);
                    product.setGiaVon(newAvgCost);
                }

                // --- PRICING STRATEGY (Tiered Markup) ---
                boolean shouldUpdatePrice = item.updateGlobalPrice() == null || item.updateGlobalPrice();

                if (shouldUpdatePrice) {
                    if (item.sellingPrice() != null && item.sellingPrice().compareTo(BigDecimal.ZERO) > 0) {
                        // Admin/Manager override
                        product.setGiaBanNiemYet(item.sellingPrice());
                    } else {
                        // Warehouse logic: Auto-calculate using Tiered Markup
                        BigDecimal cost = item.costPrice();
                        BigDecimal suggestedPrice;

                        if (cost.compareTo(new BigDecimal("50000")) < 0) { // < 50k
                            suggestedPrice = cost.multiply(new BigDecimal("2.0")); // x2
                            suggestedPrice = roundTo(suggestedPrice, 1000);
                        } else if (cost.compareTo(new BigDecimal("500000")) < 0) { // 50k - 500k
                            suggestedPrice = cost.multiply(new BigDecimal("1.5")); // +50%
                            suggestedPrice = roundTo(suggestedPrice, 5000);
                        } else if (cost.compareTo(new BigDecimal("2000000")) < 0) { // 500k - 2m
                            suggestedPrice = cost.multiply(new BigDecimal("1.3")); // +30%
                            suggestedPrice = roundTo(suggestedPrice, 10000);
                        } else { // > 2m
                            suggestedPrice = cost.multiply(new BigDecimal("1.15")); // +15%
                            suggestedPrice = roundTo(suggestedPrice, 50000);
                        }
                        product.setGiaBanNiemYet(suggestedPrice);
                    }
                }
                // ----------------------------------------

                product.setSoLuongTon(oldStock + importQty);
                product.setThueVAT(importVat); // Sync product VAT with latest import
                productRepository.save(product);
            }

            ImportDetail detail = ImportDetail.builder()
                    .phieuNhap(note)
                    .hangHoa(product)
                    .soLuong(importQty)
                    .donGiaNhap(importCost)
                    .thueVAT(importVat) // Save historical VAT for this batch
                    .thanhTien(newImportValue)
                    .hanSuDung(item.expiryDate())
                    .soLuongConLai(importQty)
                    .build();

            note.getChiTietNhap().add(detail);
            totalImportValue = totalImportValue.add(newImportValue);
        }

        note.setTongTien(totalImportValue);
        importNoteRepository.save(note);

        auditLogRepository.save(AuditLog.builder()
                .bang("PhieuNhapKho")
                .banGhiId(note.getId())
                .hanhDong("CREATE")
                .duLieuMoi("Import from " + req.supplierName() + " - Total: " + totalImportValue)
                .nguoiThucHienId(userId)
                .build());

        return note.getId();
    }

    @Transactional
    public void adjustStock(Integer productId, Integer actualQuantity, String reason, Integer userId) {
        Product product = productRepository.findByIdWithLock(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        int oldStock = product.getSoLuongTon();
        int diff = actualQuantity - oldStock;

        if (diff == 0)
            return;

        product.setSoLuongTon(actualQuantity);
        productRepository.save(product);

        auditLogRepository.save(AuditLog.builder()
                .bang("InventoryCheck")
                .banGhiId(productId)
                .hanhDong("ADJUST")
                .duLieuCu("Old Stock: " + oldStock)
                .duLieuMoi("New Stock: " + actualQuantity)
                .lyDo(reason)
                .nguoiThucHienId(userId)
                .build());
    }

    @Transactional(readOnly = true)
    public List<ImportHistoryDto> getImportHistory() {
        List<ImportNote> notes = importNoteRepository.findAll(
                Sort.by(Sort.Direction.DESC, "ngayNhap"));

        return notes.stream()
                .limit(100)
                .map(note -> new ImportHistoryDto(
                        note.getId(),
                        note.getMaPhieu(),
                        note.getNgayNhap(),
                        note.getNhaCungCap(),
                        note.getTongTien(),
                        note.getNguoiNhap() != null ? note.getNguoiNhap().getHoTen() : "N/A",
                        note.getChiTietNhap().stream()
                                .map(d -> new ImportItemDto(
                                        d.getId(),
                                        d.getHangHoa().getTenHang(),
                                        d.getSoLuong(),
                                        d.getDonGiaNhap(),
                                        d.getHanSuDung()))
                                .toList()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExportHistory() {
        List<ExportNote> notes = exportNoteRepository.findAll(
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,
                        "ngayXuat"));

        return notes.stream().limit(100).map(note -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", note.getId());
            map.put("date", note.getNgayXuat());

            String vehicleInfo = "N/A (Hủy/Khác)";
            if (note.getLoaiXuat() != null && note.getLoaiXuat().equals("SUA_CHUA")) {
                if (note.getDonHangSuaChua() != null && note.getDonHangSuaChua().getPhieuTiepNhan() != null) {
                    vehicleInfo = note.getDonHangSuaChua().getPhieuTiepNhan().getXe().getBienSo();
                } else {
                    vehicleInfo = "N/A (Lỗi dữ liệu)";
                }
            }
            map.put("vehicle", vehicleInfo);
            map.put("creator", note.getNguoiTao() != null ? note.getNguoiTao().getHoTen() : "N/A");

            BigDecimal total = BigDecimal.ZERO;
            if (note.getChiTietXuatKho() != null) {
                total = note.getChiTietXuatKho().stream()
                        .map(d -> d.getThanhTien() != null ? d.getThanhTien() : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            }
            map.put("total", total);

            List<Map<String, Object>> items = new ArrayList<>();
            if (note.getChiTietXuatKho() != null) {
                items = note.getChiTietXuatKho().stream().map(d -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("productName", d.getHangHoa().getTenHang());
                    itemMap.put("quantity", d.getSoLuong());
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
            map.put("importDate", b.getPhieuNhap().getNgayNhap());
            map.put("expiryDate", b.getHanSuDung());
            map.put("initialQty", b.getSoLuong());
            map.put("remainingQty", b.getSoLuongConLai());
            map.put("supplier", b.getPhieuNhap().getNhaCungCap());
            return map;
        }).toList();
    }

    @Transactional
    public void disposeBatch(Integer batchId, Integer userId) {
        ImportDetail batch = importDetailRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        if (batch.getSoLuongConLai() <= 0) {
            throw new RuntimeException("Lô hàng đã hết hoặc đã hủy");
        }

        User user = userRepository.findById(userId).orElseThrow();
        Product product = batch.getHangHoa();

        ExportNote exportNote = ExportNote.builder()
                .loaiXuat("HUY_HANG")
                .nguoiTao(user)
                .ngayXuat(java.time.LocalDateTime.now())
                .chiTietXuatKho(new ArrayList<>())
                .build();

        exportNote = exportNoteRepository.save(exportNote);

        product.setSoLuongTon(product.getSoLuongTon() - batch.getSoLuongConLai());
        productRepository.save(product);

        ExportDetail detail = ExportDetail.builder()
                .phieuXuatKho(exportNote)
                .hangHoa(product)
                .soLuong(batch.getSoLuongConLai())
                .donGiaXuat(BigDecimal.ZERO)
                .thanhTien(BigDecimal.ZERO)
                .build();

        exportNote.getChiTietXuatKho().add(detail);
        exportNoteRepository.save(exportNote);

        batch.setSoLuongConLai(0);
        importDetailRepository.save(batch);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getProductMovements(Integer productId) {
        List<Map<String, Object>> movements = new ArrayList<>();

        importDetailRepository.findAllByHangHoaId(productId).forEach(d -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", d.getId());
            m.put("date", d.getPhieuNhap().getNgayNhap());
            m.put("action", "NHAP_KHO");
            m.put("quantity", d.getSoLuong());
            m.put("reason", "Nhập hàng từ " + d.getPhieuNhap().getNhaCungCap());
            m.put("user", d.getPhieuNhap().getNguoiNhap() != null ? d.getPhieuNhap().getNguoiNhap().getHoTen() : "N/A");
            movements.add(m);
        });

        exportDetailRepository.findAllByHangHoaId(productId).forEach(d -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", d.getId());
            m.put("date", d.getPhieuXuatKho().getNgayXuat());
            m.put("action", d.getPhieuXuatKho().getLoaiXuat());
            m.put("quantity", -d.getSoLuong());

            String reason = "Xuất kho";
            if ("HUY_HANG".equals(d.getPhieuXuatKho().getLoaiXuat())) {
                reason = "Thanh lý lô hàng";
            } else if (d.getPhieuXuatKho().getDonHangSuaChua() != null) {
                reason = "Xuất sửa chữa xe "
                        + d.getPhieuXuatKho().getDonHangSuaChua().getPhieuTiepNhan().getXe().getBienSo();
            }
            m.put("reason", reason);
            m.put("user",
                    d.getPhieuXuatKho().getNguoiTao() != null ? d.getPhieuXuatKho().getNguoiTao().getHoTen() : "N/A");
            movements.add(m);
        });

        auditLogRepository.findByBangAndBanGhiId("InventoryCheck", productId).forEach(log -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", log.getId());
            m.put("date", log.getNgayTao());
            m.put("action", "DIEU_CHINH");
            m.put("quantity", 0);
            m.put("reason", "Kiểm kho: " + log.getLyDo());
            m.put("user", log.getNguoiThucHien() != null ? log.getNguoiThucHien().getHoTen() : "System");
            movements.add(m);
        });

        // Optimized: Fetch only relevant logs from DB
        auditLogRepository.findReturnLogsByProduct("Returned Part ID: " + productId + ",")
                .forEach(log -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", log.getId());
                    m.put("date", log.getNgayTao());
                    m.put("action", "HOAN_NHAP");

                    int qty = 0;
                    try {
                        String info = log.getDuLieuMoi();
                        String qtyStr = info.substring(info.lastIndexOf("Qty: ") + 5);
                        qty = Integer.parseInt(qtyStr);
                    } catch (Exception e) {
                    }

                    m.put("quantity", qty);
                    m.put("reason", "Thợ trả đồ: " + log.getLyDo());
                    m.put("user", log.getNguoiThucHien() != null ? log.getNguoiThucHien().getHoTen() : "N/A");
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
        result.put("code", note.getMaPhieu());
        result.put("date", note.getNgayNhap());
        result.put("supplier", note.getNhaCungCap());
        result.put("note", note.getGhiChu());
        result.put("total", note.getTongTien());
        result.put("creator", note.getNguoiNhap() != null ? note.getNguoiNhap().getHoTen() : "N/A");

        List<Map<String, Object>> items = note.getChiTietNhap().stream()
                .map(d -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("productName", d.getHangHoa().getTenHang());
                    itemMap.put("productCode", d.getHangHoa().getMaHang());
                    itemMap.put("quantity", d.getSoLuong());
                    itemMap.put("unitPrice", d.getDonGiaNhap());
                    itemMap.put("total", d.getThanhTien());
                    return itemMap;
                }).toList();

        result.put("items", items);
        return result;
    }

    public List<ImportNote> getAllImports(String status) {
        if (status != null && !status.isEmpty()) {
            return importNoteRepository.findByTrangThai(status);
        }
        return importNoteRepository.findAll(Sort.by(Sort.Direction.DESC, "ngayNhap"));
    }

    @Transactional
    public void approveImport(Integer importId, Integer userId) {
        ImportNote note = importNoteRepository.findByIdWithDetails(importId)
                .orElseThrow(() -> new RuntimeException("Import Note not found"));

        if (!"PENDING".equals(note.getTrangThai())) {
            throw new RuntimeException("Chỉ có thể duyệt phiếu nhập ở trạng thái PENDING");
        }

        for (ImportDetail detail : note.getChiTietNhap()) {
            Product product = detail.getHangHoa();

            // Update Inventory
            int oldStock = product.getSoLuongTon();
            int importQty = detail.getSoLuong();
            product.setSoLuongTon(oldStock + importQty);

            // Update Cost Price (Weighted Average)
            BigDecimal currentTotalValue = product.getGiaVon().multiply(new BigDecimal(oldStock));
            BigDecimal newImportValue = detail.getDonGiaNhap().multiply(new BigDecimal(importQty));
            BigDecimal newTotalQty = new BigDecimal(oldStock + importQty);

            if (newTotalQty.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal newAvgCost = currentTotalValue.add(newImportValue)
                        .divide(newTotalQty, 2, java.math.RoundingMode.HALF_UP);
                product.setGiaVon(newAvgCost);
            }

            // Sync VAT
            product.setThueVAT(detail.getThueVAT());

            // --- PRICING STRATEGY (Approved) ---
            BigDecimal cost = detail.getDonGiaNhap();
            BigDecimal suggestedPrice;

            if (cost.compareTo(new BigDecimal("50000")) < 0) { // < 50k
                suggestedPrice = cost.multiply(new BigDecimal("2.0"));
                suggestedPrice = roundTo(suggestedPrice, 1000);
            } else if (cost.compareTo(new BigDecimal("500000")) < 0) { // 50k - 500k
                suggestedPrice = cost.multiply(new BigDecimal("1.5"));
                suggestedPrice = roundTo(suggestedPrice, 5000);
            } else if (cost.compareTo(new BigDecimal("2000000")) < 0) { // 500k - 2m
                suggestedPrice = cost.multiply(new BigDecimal("1.3"));
                suggestedPrice = roundTo(suggestedPrice, 10000);
            } else { // > 2m
                suggestedPrice = cost.multiply(new BigDecimal("1.15"));
                suggestedPrice = roundTo(suggestedPrice, 50000);
            }
            product.setGiaBanNiemYet(suggestedPrice);
            // ----------------------------------------

            productRepository.save(product);
        }

        note.setTrangThai("COMPLETED");
        importNoteRepository.save(note);

        auditLogRepository.save(AuditLog.builder()
                .bang("PhieuNhapKho")
                .banGhiId(note.getId())
                .hanhDong("APPROVE")
                .duLieuMoi("Approved by User ID: " + userId)
                .nguoiThucHienId(userId)
                .build());
    }

    @Transactional
    public void rejectImport(Integer importId, Integer userId) {
        ImportNote note = importNoteRepository.findById(importId)
                .orElseThrow(() -> new RuntimeException("Import Note not found"));

        if (!"PENDING".equals(note.getTrangThai())) {
            throw new RuntimeException("Chỉ có thể từ chối phiếu nhập ở trạng thái PENDING");
        }

        note.setTrangThai("REJECTED");
        importNoteRepository.save(note);

        auditLogRepository.save(AuditLog.builder()
                .bang("PhieuNhapKho")
                .banGhiId(note.getId())
                .hanhDong("REJECT")
                .duLieuMoi("Rejected by User ID: " + userId)
                .nguoiThucHienId(userId)
                .build());
    }

    @Transactional
    public void updateProductPrices(List<com.gara.dto.PriceUpdateDTO> updates, Integer userId) {
        for (com.gara.dto.PriceUpdateDTO update : updates) {
            Product product = productRepository.findByIdWithLock(update.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + update.productId()));

            BigDecimal oldPrice = product.getGiaBanNiemYet();
            product.setGiaBanNiemYet(update.newPrice());
            productRepository.save(product);

            if (oldPrice.compareTo(update.newPrice()) != 0) {
                auditLogRepository.save(AuditLog.builder()
                        .bang("HangHoa")
                        .banGhiId(product.getId())
                        .hanhDong("UPDATE_PRICE")
                        .duLieuCu("Old Price: " + oldPrice)
                        .duLieuMoi("New Price: " + update.newPrice())
                        .nguoiThucHienId(userId)
                        .build());
            }
        }
    }

    private java.math.BigDecimal roundTo(java.math.BigDecimal value, int multiple) {
        java.math.BigDecimal m = new java.math.BigDecimal(multiple);
        // Divide, ceil, then multiply back
        return value.divide(m, 0, java.math.RoundingMode.CEILING).multiply(m);
    }
}
