package com.gara.modules.service.service;

import com.gara.modules.inventory.service.WarehouseService;
import com.gara.dto.*;
import com.gara.entity.*;
import com.gara.modules.mechanic.repository.*;
import com.gara.modules.service.repository.*;
import com.gara.modules.auth.repository.*;
import com.gara.modules.inventory.repository.*;
import com.gara.modules.reception.repository.*;
import com.gara.modules.support.service.AsyncAuditService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.gara.entity.enums.OrderStatus;
import com.gara.entity.enums.ItemStatus;

@Service
public class MechanicService {

    private final RepairOrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final ReceptionRepository receptionRepository;
    private final UserRepository userRepository;
    private final WarehouseService warehouseService;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final OrderCalculationService orderCalculationService;
    private final com.gara.modules.support.service.AsyncNotificationService asyncNotificationService;
    private final AsyncAuditService asyncAuditService;

    public MechanicService(RepairOrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            ReceptionRepository receptionRepository,
            UserRepository userRepository,
            WarehouseService warehouseService,
            TaskAssignmentRepository taskAssignmentRepository,
            OrderCalculationService orderCalculationService,
            com.gara.modules.support.service.AsyncNotificationService asyncNotificationService,
            AsyncAuditService asyncAuditService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.receptionRepository = receptionRepository;
        this.userRepository = userRepository;
        this.warehouseService = warehouseService;
        this.taskAssignmentRepository = taskAssignmentRepository;
        this.orderCalculationService = orderCalculationService;
        this.asyncNotificationService = asyncNotificationService;
        this.asyncAuditService = asyncAuditService;
    }

    // Helper: Mask PII for Mechanics (Bug 94)
    private String maskPhone(String fullPhone) {
        if (fullPhone == null || fullPhone.equals("N/A")) return "N/A";
        if (fullPhone.length() > 6) {
            return fullPhone.substring(0, 3) + "****" + fullPhone.substring(fullPhone.length() - 3);
        }
        return fullPhone;
    }

    // 1. Get Assigned Jobs - Role-based filtering
    @Transactional(readOnly = true)
    public List<JobSummaryDTO> getAssignedJobs(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // QUAN_LY_XUONG / Admin: See ALL jobs + QC jobs
        if (user.isQuanLy() || user.isAdmin() || user.hasPermission("VIEW_ALL_JOBS")) {
            List<JobSummaryDTO> allJobs = new ArrayList<>();

            // Active repair jobs
            allJobs.addAll(orderRepository.findJobsForMechanic().stream()
                    .filter(o -> !o.getChiTietDonHang().isEmpty())
                    .map(this::mapToJobSummary)
                    .toList());

            // QC jobs assigned to this manager
            allJobs.addAll(orderRepository.findByTrangThaiIn(List.of(OrderStatus.CHO_KCS)).stream()
                    .filter(o -> o.getThoChanDoan() != null && o.getThoChanDoan().getId().equals(userId))
                    .map(this::mapToJobSummary)
                    .toList());

            return allJobs;
        }

        // THO_SUA_CHUA: Only see jobs assigned to them
        return orderRepository.findJobsForMechanic().stream()
                .filter(o -> !o.getChiTietDonHang().isEmpty())
                .filter(o -> o.getThoPhanCong() != null && o.getThoPhanCong().getId().equals(userId))
                .map(this::mapToJobSummary)
                .toList();
    }

    // Assign Job - Only QUAN_LY_XUONG or Admin can assign work to mechanics
    @Transactional
    public void assignJob(Integer orderId, Integer mechanicId, Integer assignedById) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));
        User assigner = userRepository.findById(assignedById)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User mechanic = userRepository.findById(mechanicId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thợ."));

        // Permission check: Only QUAN_LY_XUONG or Admin
        if (!assigner.hasPermission("ASSIGN_WORK") && !assigner.isAdmin()) {
            throw new RuntimeException("Chỉ Quản đốc hoặc Admin mới được chia việc.");
        }

        // Prevent double-assign
        if (order.getThoPhanCong() != null) {
            throw new RuntimeException("Đơn hàng đã được giao cho: " + order.getThoPhanCong().getHoTen());
        }

        // Rule 10.4: Check Deposit
        java.math.BigDecimal threshold = new java.math.BigDecimal("5000000");
        java.math.BigDecimal minRate = new java.math.BigDecimal("0.3");
        if (order.getTongCong().compareTo(threshold) > 0) {
            java.math.BigDecimal minDeposit = order.getTongCong().multiply(minRate);
            if (order.getTienCoc().compareTo(minDeposit) < 0) {
                throw new RuntimeException(
                        "Đơn hàng chưa đủ tiền cọc (Cần tối thiểu 30%). Vui lòng báo Sale thu tiền.");
            }
        }

        OrderStatus oldStatus = order.getTrangThai();
        order.setThoPhanCong(mechanic);
        if (OrderStatus.DA_DUYET.equals(order.getTrangThai())) {
            order.setTrangThai(OrderStatus.DANG_SUA);
        }
        orderRepository.save(order);

        // Audit log
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("UPDATE")
                .duLieuCu(oldStatus.name())
                .duLieuMoi(order.getTrangThai().name())
                .lyDo("Quản đốc " + assigner.getHoTen() + " giao việc cho " + mechanic.getHoTen())
                .nguoiThucHienId(assignedById)
                .build());

        // Notify mechanic about new assignment
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .userId(mechanicId)
                .role("THO_SUA_CHUA")
                .title("Việc mới: " + order.getPhieuTiepNhan().getXe().getBienSo())
                .content("Quản đốc đã giao việc sửa chữa cho bạn. Vui lòng kiểm tra.")
                .type("INFO")
                .link("/mechanic/jobs/" + orderId)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());
    }

    // Backward compat: claimJob now requires ASSIGN_WORK (Quan doc self-assigns)
    @Transactional
    public void claimJob(Integer orderId, Integer userId) {
        assignJob(orderId, userId, userId);
    }

    // Get Available Mechanics with specialty, level, and workload
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailableMechanics() {
        // Find all users with THO_SUA_CHUA role
        List<User> allUsers = userRepository.findAll();
        List<User> mechanics = allUsers.stream()
                .filter(u -> u.getTrangThaiHoatDong() != null && u.getTrangThaiHoatDong())
                .filter(u -> u.getRoles().stream().anyMatch(r -> "THO_SUA_CHUA".equals(r.getName())))
                .toList();

        // Count active jobs per mechanic
        List<RepairOrder> activeOrders = orderRepository.findByTrangThaiIn(
                List.of(OrderStatus.DANG_SUA, OrderStatus.CHO_SUA_CHUA));

        return mechanics.stream().map(m -> {
            Map<String, Object> info = new java.util.HashMap<>();
            info.put("id", m.getId());
            info.put("hoTen", m.getHoTen());
            info.put("chuyenMon", m.getChuyenMon() != null ? m.getChuyenMon().name() : null);
            info.put("chuyenMonLabel", m.getChuyenMon() != null ? m.getChuyenMon().getDescription() : "Chưa xác định");
            info.put("capBac", m.getCapBac() != null ? m.getCapBac().name() : null);
            info.put("capBacLabel", m.getCapBac() != null ? m.getCapBac().getDescription() : "Chưa xác định");

            long activeJobs = activeOrders.stream()
                    .filter(o -> o.getThoPhanCong() != null && o.getThoPhanCong().getId().equals(m.getId()))
                    .count();
            info.put("soViecDangLam", activeJobs);
            return info;
        }).toList();
    }

    // 3. Unclaim Job (Secured)
    @Transactional
    public void unclaimJob(Integer orderId, Integer userId) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        User user = userRepository.findById(userId).orElseThrow();

        // Ownership Check: Only the assigned mechanic or Admin can unclaim
        if (order.getThoPhanCong() != null && !order.getThoPhanCong().getId().equals(userId) && !user.isAdmin()) {
            throw new RuntimeException("Bạn không có quyền hủy nhận việc trên đơn của người khác.");
        }

        OrderStatus oldStatus = order.getTrangThai();
        order.setThoPhanCong(null);
        order.setTrangThai(OrderStatus.DA_DUYET);
        orderRepository.save(order);

        // Bug 117 Fix: Add Audit Log
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(orderId)
                .hanhDong("UPDATE")
                .duLieuCu(oldStatus.name())
                .duLieuMoi(order.getTrangThai().name())
                .lyDo("Thợ hủy nhận việc")
                .nguoiThucHienId(userId)
                .build());
    }

    // 4. Get Receptions for Inspection
    @Transactional(readOnly = true)
    public List<ReceptionInspectDTO> getReceptionsToInspect() {
        // Optimized: Use dedicated query with JOIN FETCH instead of findAll().filter()
        return orderRepository.findOrdersForInspection().stream()
                .map(order -> {
                    Reception r = order.getPhieuTiepNhan();
                    return ReceptionInspectDTO.builder()
                            .id(r.getId())
                            .plate(r.getXe().getBienSo())
                            .customerName(r.getXe().getKhachHang().getHoTen())
                            .vehicleBrand(r.getXe().getNhanHieu())
                            .vehicleModel(r.getXe().getModel())
                            .request(r.getYeuCauSoBo())
                            .imageUrl(r.getHinhAnh())
                            .createdAt(r.getNgayGio())
                            .proposedItemsCount(order.getChiTietDonHang().size())
                            .orderId(order.getId())
                            .build();
                })
                .toList();
    }

    // 4b. Get Repair History
    @Transactional(readOnly = true)
    public List<JobSummaryDTO> getRepairHistory(Integer userId) {
        return orderRepository
                .findRepairHistoryByMechanic(userId, org.springframework.data.domain.PageRequest.of(0, 50))
                .stream()
                .map(this::mapToJobSummary)
                .toList();
    }

    // 5. Get Inspected History
    @Transactional(readOnly = true)
    public List<ReceptionInspectDTO> getInspectedHistory(Integer userId) {
        // Use filtered query for Diagnostic Mechanic
        return orderRepository
                .findHistoryByDiagnosticMechanic(userId, org.springframework.data.domain.PageRequest.of(0, 50)).stream()
                .map(order -> {
                    Reception r = order.getPhieuTiepNhan();
                    return ReceptionInspectDTO.builder()
                            .id(r.getId())
                            .plate(r.getXe().getBienSo())
                            .customerName(r.getXe().getKhachHang().getHoTen())
                            .vehicleBrand(r.getXe().getNhanHieu())
                            .vehicleModel(r.getXe().getModel())
                            .request(r.getYeuCauSoBo())
                            .imageUrl(r.getHinhAnh())
                            .createdAt(r.getNgayGio())
                            .proposedItemsCount(order.getChiTietDonHang().size())
                            .orderId(order.getId())
                            .build();
                })
                .toList();
    }

    @Transactional
    public void submitProposal(Integer receptionId, List<ProposalItemDTO> items, Integer userId) {
        // Rule: Thợ có quyền gửi đề xuất trống để xác nhận xe không hỏng (Chẩn đoán
        // xong)

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.hasPermission("CREATE_PROPOSAL") && !user.isAdmin()) {
            throw new RuntimeException("Bạn không có quyền lập đề xuất sửa chữa.");
        }

        RepairOrder order = orderRepository.findByPhieuTiepNhanId(receptionId)
                .orElseThrow(() -> new RuntimeException("Order not found for reception"));

        // Bug 91 Guard: Only allow proposal in initial stages
        if (!List.of(OrderStatus.TIEP_NHAN, OrderStatus.CHO_CHAN_DOAN).contains(order.getTrangThai())) {
            throw new RuntimeException("Đơn hàng đã qua giai đoạn lập đề xuất chẩn đoán.");
        }

        // Assign/Verify Diagnostic Mechanic (Bug 10 Guard)
        if (order.getThoChanDoan() != null && !order.getThoChanDoan().getId().equals(userId) && !user.isAdmin()) {
            throw new RuntimeException("Xe này đã được tiếp nhận chẩn đoán bởi: " + order.getThoChanDoan().getHoTen());
        }
        order.setThoChanDoan(user);

        for (ProposalItemDTO pItem : items) {
            if (pItem.quantity() <= 0) {
                throw new RuntimeException("Số lượng phải lớn hơn 0");
            }
            Product product = productRepository.findById(pItem.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            OrderItem item = new OrderItem();
            item.setDonHangSuaChua(order);
            item.setHangHoa(product);
            item.setSoLuong(pItem.quantity());
            item.setDonGiaGoc(product.getGiaBanNiemYet());
            item.setThanhTien(product.getGiaBanNiemYet().multiply(BigDecimal.valueOf(pItem.quantity())));
            item.setTrangThai(ItemStatus.DE_XUAT);
            item.setGiamGiaTien(BigDecimal.ZERO);
            item.setGiamGiaPhanTram(BigDecimal.ZERO);
            item.setNguoiDeXuat(user);

            orderItemRepository.save(item);
        }

        // Update order status to CHO_KH_DUYET
        OrderStatus oldStatus = order.getTrangThai();
        order.setTrangThai(OrderStatus.CHO_KH_DUYET);
        orderRepository.save(order);

        // Bug 117 Fix: Audit status transition
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(order.getId())
                .hanhDong("UPDATE")
                .duLieuCu(oldStatus.name())
                .duLieuMoi(order.getTrangThai().name())
                .lyDo("Thợ hoàn tất chẩn đoán & gửi đề xuất")
                .nguoiThucHienId(userId)
                .build());

        // Recalculate totals
        orderCalculationService.recalculateTotals(order);

        // Notification
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("SALE")
                .title("Đề xuất mới: " + order.getPhieuTiepNhan().getXe().getBienSo())
                .content("Thợ đã gửi đề xuất sửa chữa. Vui lòng báo giá cho khách.")
                .type("INFO")
                .link("/sale/orders/" + order.getId())
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());
    }

    // 5b. Report Technical Issue (Mid-repair)
    @Transactional
    public void reportTechnicalIssue(Integer orderId, List<ProposalItemDTO> items, Integer userId) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Bug 92 Guard: Only allow technical issues during active repair/diag
        if (!List.of(OrderStatus.DANG_SUA, OrderStatus.DA_DUYET, OrderStatus.CHO_CHAN_DOAN).contains(order.getTrangThai())) {
            throw new RuntimeException("Không thể báo phát sinh kỹ thuật trong trạng thái hiện tại.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.hasPermission("COMPLETE_REPAIR_JOB") && !user.isAdmin()) {
            throw new RuntimeException("Bạn không có quyền báo phát sinh kỹ thuật.");
        }

        if (order.getThoPhanCong() != null && !order.getThoPhanCong().getId().equals(userId)
                && !user.isAdmin()) {
            throw new RuntimeException("Bạn không được gán cho lệnh này.");
        }

        for (ProposalItemDTO pItem : items) {
            if (pItem.quantity() <= 0) {
                throw new RuntimeException("Số lượng phải lớn hơn 0");
            }
            Product product = productRepository.findById(pItem.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            OrderItem item = new OrderItem();
            item.setDonHangSuaChua(order);
            item.setHangHoa(product);
            item.setSoLuong(pItem.quantity());
            item.setDonGiaGoc(product.getGiaBanNiemYet());
            item.setThanhTien(product.getGiaBanNiemYet().multiply(BigDecimal.valueOf(pItem.quantity())));
            item.setTrangThai(ItemStatus.CHO_KY_THUAT_DUYET); // Waiting for Manager approval
            item.setGiamGiaTien(BigDecimal.ZERO);
            item.setGiamGiaPhanTram(BigDecimal.ZERO);
            item.setNguoiDeXuat(user);

            orderItemRepository.save(item);
        }

        // Bug 127 Fix: Recalculate totals immediately to avoid stale prices
        orderCalculationService.recalculateTotals(order);
        
        orderRepository.save(order);

        // Audit log
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(order.getId())
                .hanhDong("UPDATE")
                .duLieuCu(order.getTrangThai().name())
                .duLieuMoi(order.getTrangThai().name())
                .lyDo("Thợ báo phát sinh kỹ thuật mới - Chờ Quản đốc duyệt")
                .nguoiThucHienId(userId)
                .build());

        // Notify Workshop Manager (Quản đốc)
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("QUAN_LY_XUONG")
                .title("Phát sinh kỹ thuật mới: " + order.getPhieuTiepNhan().getXe().getBienSo())
                .content("Thợ " + user.getHoTen() + " báo phát sinh phụ tùng/dịch vụ mới. Vui lòng kiểm tra và duyệt kỹ thuật.")
                .type("WARNING")
                .link("/admin/technical-review")
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());
    }

    // Manager confirms technical items to move them to Sale for pricing
    @Transactional
    public void confirmTechnicalIssue(Integer orderId, List<Integer> itemIds, Integer managerId) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        if (!manager.isQuanLy() && !manager.isAdmin()) {
            throw new RuntimeException("Chỉ Quản lý xưởng mới có quyền duyệt kỹ thuật.");
        }

        List<OrderItem> items = orderItemRepository.findAllById(itemIds);
        for (OrderItem item : items) {
            if (!item.getDonHangSuaChua().getId().equals(orderId)) {
                throw new RuntimeException("Item " + item.getId() + " does not belong to order " + orderId);
            }
            if (ItemStatus.CHO_KY_THUAT_DUYET.equals(item.getTrangThai())) {
                item.setTrangThai(ItemStatus.DE_XUAT);
                orderItemRepository.save(item);
            }
        }

        // Notify Sale about development
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("SALE")
                .title("Đề xuất đã duyệt kỹ thuật: " + order.getPhieuTiepNhan().getXe().getBienSo())
                .content("Quản đốc đã duyệt kỹ thuật các hạng mục phát sinh. Vui lòng báo giá cho khách.")
                .type("INFO")
                .link("/sale/orders/" + order.getId())
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        asyncAuditService.logAsync(AuditLog.builder()
                .bang("DonHangSuaChua")
                .banGhiId(order.getId())
                .hanhDong("UPDATE")
                .lyDo("Quản lý xưởng duyệt kỹ thuật các hạng mục phát sinh")
                .nguoiThucHienId(managerId)
                .build());
    }

    // Fetch all orders that have items waiting for technical approval
    @Transactional(readOnly = true)
    public List<OrderDetailDTO> getOrdersForTechnicalReview() {
        // Find all items in CHO_KY_THUAT_DUYET
        List<OrderItem> waitingItems = orderItemRepository.findByTrangThai(ItemStatus.CHO_KY_THUAT_DUYET);
        
        // Group by order and map to Detail DTOs
        return waitingItems.stream()
                .map(OrderItem::getDonHangSuaChua)
                .distinct()
                .map(order -> {
                    // Reuse existing mapping logic or a simplified version
                    // For now, let's use a simplified version to avoid huge DTOs if not needed
                    // but usually the review page needs enough info to decide
                    return mapToOrderDetailDTO(order);
                })
                .toList();
    }

    private OrderDetailDTO mapToOrderDetailDTO(RepairOrder order) {
        // Implementation of mapping (simplified for this context)
        return OrderDetailDTO.builder()
                .id(order.getId())
                .status(order.getTrangThai().name())
                .plateNumber(order.getPhieuTiepNhan().getXe().getBienSo())
                .carBrand(order.getPhieuTiepNhan().getXe().getNhanHieu())
                .carModel(order.getPhieuTiepNhan().getXe().getModel())
                .createdAt(order.getNgayTao())
                .customerName(order.getPhieuTiepNhan().getXe().getKhachHang().getHoTen())
                .items(order.getChiTietDonHang().stream()
                        .map(i -> OrderItemDTO.builder()
                                .id(i.getId())
                                .productName(i.getHangHoa().getTenHang())
                                .quantity(i.getSoLuong())
                                .itemStatus(i.getTrangThai().name())
                                .proposedByName(i.getNguoiDeXuat() != null ? i.getNguoiDeXuat().getHoTen() : null)
                                .build())
                        .toList())
                .build();
    }

    // 6. Complete Job -> Send to QC
    @Transactional
    public void completeJob(Integer orderId) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!OrderStatus.DANG_SUA.equals(order.getTrangThai())) {
            throw new RuntimeException("Job must be in progress to complete.");
        }

        // Transition to QC
        order.setTrangThai(OrderStatus.CHO_KCS);
        orderRepository.save(order);

        // Notify Workshop Manager (Quản đốc)
        if (order.getThoChanDoan() != null) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .userId(order.getThoChanDoan().getId())
                    .role("QUAN_LY_XUONG")
                    .title("Yêu cầu nghiệm thu: " + order.getPhieuTiepNhan().getXe().getBienSo())
                    .content("Thợ sửa chữa đã hoàn thành. Vui lòng kiểm tra xe.")
                    .type("INFO")
                    .link("/mechanic/jobs/" + orderId)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }
    }

    // 6b. QC Pass
    @Transactional
    public void qcPass(Integer orderId, Integer userId) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!OrderStatus.CHO_KCS.equals(order.getTrangThai())) {
            throw new RuntimeException("Order is not waiting for QC.");
        }

        // Permission: User has APPROVE_QC and is assigned, or Admin
        boolean hasPermission = user.hasPermission("APPROVE_QC");
        boolean isOwner = order.getThoChanDoan() != null && order.getThoChanDoan().getId().equals(userId);
        boolean isAdmin = user.isAdmin();

        if ((!hasPermission || !isOwner) && !isAdmin) {
            throw new RuntimeException("Chỉ kỹ thuật viên phụ trách nghiệm thu hoặc Admin mới được duyệt QC.");
        }

        order.setTrangThai(OrderStatus.CHO_THANH_TOAN);
        orderRepository.save(order);

        // Bug 93: Export all approved items to Warehouse
        warehouseService.exportOrder(orderId,
                order.getThoPhanCong() != null ? order.getThoPhanCong().getId() : userId);

        // Notify Sale
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("SALE")
                .title("Sửa chữa hoàn tất: " + order.getPhieuTiepNhan().getXe().getBienSo())
                .content("Xe đã qua kiểm tra chất lượng (QC). Vui lòng thu tiền.")
                .type("SUCCESS")
                .link("/sale/orders/" + orderId)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        // Notify Customer
        Customer customer = order.getPhieuTiepNhan().getXe().getKhachHang();
        if (customer.getUserId() != null) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .userId(customer.getUserId())
                    .role("CUSTOMER")
                    .title("Xe đã sửa xong: " + order.getPhieuTiepNhan().getXe().getBienSo())
                    .content("Xe của bạn đã hoàn thành sửa chữa. Vui lòng đến nhận xe và thanh toán.")
                    .type("SUCCESS")
                    .link("/customer/orders/" + orderId)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }
    }

    // 6c. QC Fail
    @Transactional
    public void qcFail(Integer orderId, Integer userId) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!OrderStatus.CHO_KCS.equals(order.getTrangThai())) {
            throw new RuntimeException("Order is not waiting for QC.");
        }

        // Permission: User has REJECT_QC and is assigned, or Admin
        boolean hasPermission = user.hasPermission("REJECT_QC");
        boolean isOwner = order.getThoChanDoan() != null && order.getThoChanDoan().getId().equals(userId);
        boolean isAdmin = user.isAdmin();

        if ((!hasPermission || !isOwner) && !isAdmin) {
            throw new RuntimeException("Chỉ kỹ thuật viên phụ trách nghiệm thu hoặc Admin mới được từ chối QC.");
        }

        order.setTrangThai(OrderStatus.DANG_SUA);
        orderRepository.save(order);

        // Notify Repair Lead
        if (order.getThoPhanCong() != null) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .userId(order.getThoPhanCong().getId())
                    .role("THO_SUA_CHUA")
                    .title("QC Từ chối: " + order.getPhieuTiepNhan().getXe().getBienSo())
                    .content("Xe chưa đạt kiểm tra chất lượng. Vui lòng kiểm tra lại.")
                    .type("WARNING")
                    .link("/mechanic/jobs/" + orderId)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }
    }

    private JobSummaryDTO mapToJobSummary(RepairOrder o) {
        long completed = o.getChiTietDonHang().stream()
                .filter(i -> ItemStatus.HOAN_THANH.equals(i.getTrangThai()))
                .count();
        String fullPhone = "N/A";
        try {
            fullPhone = o.getPhieuTiepNhan().getXe().getKhachHang().getSoDienThoai();
        } catch (Exception ignored) {
        }
        String phone = maskPhone(fullPhone);

        return JobSummaryDTO.builder()
                .id(o.getId())
                .plate(o.getPhieuTiepNhan().getXe().getBienSo())
                .customerName(o.getPhieuTiepNhan().getXe().getKhachHang().getHoTen())
                .customerPhone(phone)
                .vehicleBrand(o.getPhieuTiepNhan().getXe().getNhanHieu())
                .vehicleModel(o.getPhieuTiepNhan().getXe().getModel())
                .imageUrl(o.getPhieuTiepNhan().getHinhAnh())
                .createdAt(o.getNgayTao())
                .totalItems(o.getChiTietDonHang().size())
                .completedItems((int) completed)
                .status(o.getTrangThai() != null ? o.getTrangThai().name() : null)
                .claimedById(o.getThoPhanCong() != null ? o.getThoPhanCong().getId() : null)
                .claimedByName(o.getThoPhanCong() != null ? o.getThoPhanCong().getHoTen() : null)
                .build();
    }

    // 7d. Update Task Distribution
    @Transactional
    public void updateTaskDistribution(Integer itemId, Map<Integer, BigDecimal> distribution, Integer leadId) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Permission check: Lead or Admin
        RepairOrder order = item.getDonHangSuaChua();
        User lead = order.getThoPhanCong();
        if (lead == null || !lead.getId().equals(leadId)) {
            User user = userRepository.findById(leadId).orElseThrow();
            if (!user.isAdmin()) {
                throw new RuntimeException("Only Order Lead or Admin can distribute tasks.");
            }
        }

        List<TaskAssignment> assignments = taskAssignmentRepository.findByChiTietDonHangId(itemId);

        // Apply updates in memory first
        for (TaskAssignment ta : assignments) {
            if (distribution.containsKey(ta.getTho().getId())) {
                ta.setPhanTramCong(distribution.get(ta.getTho().getId()));
            }
        }

        // Validate Total 100% of ALL assignments
        BigDecimal total = assignments.stream()
                .map(TaskAssignment::getPhanTramCong)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (total.compareTo(new BigDecimal("100")) != 0) {
            throw new RuntimeException("Tổng phần trăm công việc phải là 100%. Hiện tại: " + total + "%");
        }

        // Save all
        taskAssignmentRepository.saveAll(assignments);
    }

    // 7a. Toggle Item Completion (Secured)
    @Transactional
    public void toggleItemCompletion(Integer itemId, Integer userId) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Security: Check Task Ownership
        List<TaskAssignment> assignments = taskAssignmentRepository.findByChiTietDonHangId(itemId);
        boolean isAssigned = assignments.stream()
                .anyMatch(ta -> ta.getTho().getId().equals(userId) && "APPROVED".equals(ta.getTrangThai()));

        // Fallback: Order Lead/Admin also allowed?
        RepairOrder order = item.getDonHangSuaChua();
        boolean isOrderLead = order.getThoPhanCong() != null && order.getThoPhanCong().getId().equals(userId);
        User user = userRepository.findById(userId).orElseThrow();
        boolean isAdmin = user.isAdmin();

        if (!isAssigned && !isOrderLead && !isAdmin) {
            throw new RuntimeException("You are not assigned to this task.");
        }

        if (ItemStatus.HOAN_THANH.equals(item.getTrangThai())) {
            item.setTrangThai(ItemStatus.DANG_SUA);
            item.setNguoiThucHien(null);
        } else {
            // Only allow toggling if it's approved or in progress
            if (ItemStatus.KHACH_DONG_Y.equals(item.getTrangThai())
                    || ItemStatus.DANG_SUA.equals(item.getTrangThai())) {
                item.setTrangThai(ItemStatus.HOAN_THANH);
                User completedBy = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                item.setNguoiThucHien(completedBy);
            }
        }
        orderItemRepository.save(item);
    }

    // 7b. Request Join Task (Party Mode)
    @Transactional
    public void requestJoinTask(Integer itemId, Integer userId) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        User mechanic = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!ItemStatus.KHACH_DONG_Y.equals(item.getTrangThai()) && !ItemStatus.DANG_SUA.equals(item.getTrangThai())) {
            throw new RuntimeException("Item is not available for work.");
        }

        List<TaskAssignment> currentAssignments = taskAssignmentRepository.findByChiTietDonHangId(itemId);
        boolean alreadyAssigned = currentAssignments.stream()
                .anyMatch(ta -> ta.getTho().getId().equals(userId));

        if (alreadyAssigned) {
            throw new RuntimeException("You are already assigned or have a pending request for this task.");
        }

        // Check slots (max mechanics set by lead)
        int maxMechanics = item.getSoLuongThoToiDa() != null ? item.getSoLuongThoToiDa() : 4;
        long activeCount = currentAssignments.stream().filter(ta -> "APPROVED".equals(ta.getTrangThai())).count();
        if (activeCount >= maxMechanics) {
            throw new RuntimeException("Task is full (Max " + maxMechanics + " active mechanics).");
        }

        // Anti-spam: Max 10 total requests per item
        if (currentAssignments.size() >= 10) {
            throw new RuntimeException("Too many pending requests.");
        }

        // Auto-approve if Lead or Admin
        RepairOrder order = item.getDonHangSuaChua();
        boolean isLead = order.getThoPhanCong() != null && userId.equals(order.getThoPhanCong().getId());
        boolean isAdmin = mechanic.isAdmin();

        String status = (isLead || isAdmin) ? "APPROVED" : "PENDING";

        TaskAssignment assignment = TaskAssignment.builder()
                .chiTietDonHang(item)
                .tho(mechanic)
                .trangThai(status)
                .laThoChinh(isLead) // Lead is the main tech by default
                .phanTramCong(isLead ? new java.math.BigDecimal(100) : new java.math.BigDecimal(0))
                .build();
        taskAssignmentRepository.save(assignment);

        // Notify Lead if it's a PENDING request from someone else
        if ("PENDING".equals(status)) {
            User lead = order.getThoPhanCong();
            if (lead != null && !lead.getId().equals(userId)) {
                asyncNotificationService.pushUniqueAsync(Notification.builder()
                        .userId(lead.getId())
                        .role("THO_SUA_CHUA")
                        .title("Yêu cầu tham gia: " + mechanic.getHoTen())
                        .content(mechanic.getHoTen() + " muốn tham gia vào hạng mục: " + item.getHangHoa().getTenHang())
                        .type("INFO")
                        .link("/mechanic/jobs/" + item.getDonHangSuaChua().getId())
                        .createdAt(LocalDateTime.now())
                        .isRead(false)
                        .build());
            }
        }
    }

    @Transactional
    public void updateItemMaxMechanics(Integer itemId, Integer maxMechanics, Integer userId) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        RepairOrder order = item.getDonHangSuaChua();
        User lead = order.getThoPhanCong();

        boolean isLead = lead != null && lead.getId().equals(userId);
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = user.isAdmin();

        if (!isLead && !isAdmin) {
            throw new RuntimeException("Only the Lead Mechanic or Admin can set the maximum number of mechanics.");
        }

        if (maxMechanics < 1)
            maxMechanics = 1;
        if (maxMechanics > 10)
            maxMechanics = 10; // Cap at 10 to prevents abuse

        item.setSoLuongThoToiDa(maxMechanics);
        orderItemRepository.save(item);
    }

    // 7c. Approve Join Task
    @Transactional
    public void approveJoinTask(Integer assignmentId, Integer approverId) {
        TaskAssignment assignment = taskAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment request not found"));

        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver not found"));

        // Check permission: Approver must be Order Lead or Admin
        RepairOrder order = assignment.getChiTietDonHang().getDonHangSuaChua();
        boolean isLead = order.getThoPhanCong() != null && order.getThoPhanCong().getId().equals(approverId);
        boolean isAdmin = approver.isAdmin();

        if (!isLead && !isAdmin) {
            throw new RuntimeException("Only Order Lead or Admin can approve requests.");
        }

        if ("APPROVED".equals(assignment.getTrangThai())) {
            throw new RuntimeException("Already approved.");
        }

        assignment.setTrangThai("APPROVED");
        taskAssignmentRepository.save(assignment);
    }

    // 8. Get Dashboard Stats - Optimized with COUNT queries
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getDashboardStats() {
        // Use COUNT queries instead of fetching all records (O(1) vs O(n))
        long inProgress = orderRepository.countByTrangThai(OrderStatus.DANG_SUA);
        long completed = orderRepository.countByTrangThai(OrderStatus.CHO_THANH_TOAN);

        return java.util.Map.of(
                "inProgressJobs", inProgress,
                "completedToday", completed);
    }

    // 9. Get Job Details (For Worker View) - Optimized with batch loading
    @Transactional(readOnly = true)
    public Map<String, Object> getJobDetails(Integer orderId) {
        RepairOrder order = orderRepository.findByIdWithFullDetails(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Filter approved items first
        List<OrderItem> filteredItems = order.getChiTietDonHang().stream()
                .filter(i -> ItemStatus.KHACH_DONG_Y.equals(i.getTrangThai())
                        || ItemStatus.DANG_SUA.equals(i.getTrangThai())
                        || ItemStatus.HOAN_THANH.equals(i.getTrangThai()))
                .toList();

        // Batch load ALL task assignments in ONE query (O(1) instead of O(n))
        List<Integer> itemIds = filteredItems.stream().map(OrderItem::getId).toList();
        List<TaskAssignment> allAssignments = itemIds.isEmpty() ? new ArrayList<>()
                : taskAssignmentRepository.findByChiTietDonHangIdIn(itemIds);

        // Group assignments by item ID for O(1) lookup
        Map<Integer, List<TaskAssignment>> assignmentsByItem = allAssignments.stream()
                .collect(Collectors.groupingBy(ta -> ta.getChiTietDonHang().getId()));

        // Map items with pre-loaded assignments
        List<Map<String, Object>> items = filteredItems.stream()
                .map(i -> {
                    Map<String, Object> m = new java.util.HashMap<>();
                    m.put("id", i.getId());
                    m.put("productCode", i.getHangHoa().getMaHang());
                    m.put("productName", i.getHangHoa().getTenHang());
                    m.put("isService", i.getHangHoa().getLaDichVu());
                    m.put("quantity", i.getSoLuong());
                    m.put("isCompleted", ItemStatus.HOAN_THANH.equals(i.getTrangThai()));
                    m.put("completedById", i.getNguoiThucHien() != null ? i.getNguoiThucHien().getId() : null);
                    m.put("completedByName", i.getNguoiThucHien() != null ? i.getNguoiThucHien().getHoTen() : null);
                    m.put("maxMechanics", i.getSoLuongThoToiDa() != null ? i.getSoLuongThoToiDa() : 4);

                    // Use pre-loaded assignments (O(1) lookup)
                    List<TaskAssignment> assignments = assignmentsByItem.getOrDefault(i.getId(), new ArrayList<>());
                    List<Map<String, Object>> assignmentList = assignments.stream().map(ta -> {
                        Map<String, Object> am = new java.util.HashMap<>();
                        am.put("id", ta.getId());
                        am.put("mechanicId", ta.getTho().getId());
                        am.put("mechanicName", ta.getTho().getHoTen());
                        am.put("percentage", ta.getPhanTramCong());
                        am.put("isMain", ta.getLaThoChinh());
                        am.put("status", ta.getTrangThai());
                        return am;
                    }).toList();
                    m.put("assignments", assignmentList);

                    return m;
                }).toList();

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", order.getId());
        result.put("plate", order.getPhieuTiepNhan().getXe().getBienSo());
        result.put("customerName", order.getPhieuTiepNhan().getXe().getKhachHang().getHoTen());
        result.put("customerPhone", maskPhone(order.getPhieuTiepNhan().getXe().getKhachHang().getSoDienThoai()));
        result.put("vehicleBrand", order.getPhieuTiepNhan().getXe().getNhanHieu());
        result.put("vehicleModel", order.getPhieuTiepNhan().getXe().getModel());
        result.put("imageUrl", order.getPhieuTiepNhan().getHinhAnh());
        result.put("request", order.getPhieuTiepNhan().getYeuCauSoBo());
        result.put("status", order.getTrangThai() != null ? order.getTrangThai().name() : null);
        result.put("items", items);
        result.put("totalItems", items.size());
        result.put("completedItems", items.stream().filter(m -> (Boolean) m.get("isCompleted")).count());
        result.put("claimedById", order.getThoPhanCong() != null ? order.getThoPhanCong().getId() : null);
        result.put("claimedByName", order.getThoPhanCong() != null ? order.getThoPhanCong().getHoTen() : null);

        // Deposit Info
        result.put("tienCoc", order.getTienCoc());
        result.put("tongCong", order.getTongCong());

        return result;
    }

    // 10. Get Reception Detail (For Inspect View)
    @Transactional(readOnly = true)
    public Map<String, Object> getReceptionDetail(Integer receptionId) {
        Reception reception = receptionRepository.findById(receptionId)
                .orElseThrow(() -> new RuntimeException("Reception not found"));

        RepairOrder order = orderRepository.findByPhieuTiepNhanIdWithDetails(receptionId).orElse(null);

        List<Map<String, Object>> existingItems = new ArrayList<>();
        if (order != null) {
            existingItems = order.getChiTietDonHang().stream()
                    .map(i -> {
                        Map<String, Object> m = new java.util.HashMap<>();
                        m.put("id", i.getId());
                        m.put("productId", i.getHangHoa().getId());
                        m.put("productCode", i.getHangHoa().getMaHang());
                        m.put("productName", i.getHangHoa().getTenHang());
                        m.put("quantity", i.getSoLuong());
                        m.put("isService", i.getHangHoa().getLaDichVu());
                        return m;
                    })
                    .toList();
        }

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", reception.getId());
        result.put("plate", reception.getXe().getBienSo());
        result.put("customerName", reception.getXe().getKhachHang().getHoTen());
        result.put("customerPhone", maskPhone(reception.getXe().getKhachHang().getSoDienThoai()));
        result.put("vehicleBrand", reception.getXe().getNhanHieu());
        result.put("vehicleModel", reception.getXe().getModel());
        result.put("odo", reception.getXe().getOdoHienTai());
        result.put("fuelLevel", reception.getMucXang());
        result.put("bodyCondition", reception.getTinhTrangVoXe());
        result.put("request", reception.getYeuCauSoBo());
        result.put("imageUrl", reception.getHinhAnh());
        result.put("hasOrder", order != null);
        result.put("orderId", order != null ? order.getId() : null);
        result.put("status", order != null && order.getTrangThai() != null ? order.getTrangThai().name() : null);
        result.put("existingItems", existingItems);

        return result;
    }

    // 11. Remove Proposed Item
    @Transactional
    public void removeProposedItem(Integer itemId) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (!ItemStatus.DE_XUAT.equals(item.getTrangThai())) {
            throw new RuntimeException("Chỉ có thể xóa hạng mục đề xuất");
        }

        RepairOrder order = item.getDonHangSuaChua();

        // Bug 87 Guard: Disable deletion if finalized
        if (List.of(OrderStatus.HOAN_THANH, OrderStatus.DONG, OrderStatus.HUY, OrderStatus.CHO_THANH_TOAN)
                .contains(order.getTrangThai())) {
            throw new RuntimeException("Không thể xóa hạng mục khi đơn hàng đã chốt/hoàn thành.");
        }
        String plate = order.getPhieuTiepNhan().getXe().getBienSo();
        String productName = item.getHangHoa().getTenHang();

        order.getChiTietDonHang().remove(item);
        orderItemRepository.delete(item);

        orderCalculationService.recalculateTotals(order);

        // Notify Sale
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("SALE")
                .title("Thợ xóa đề xuất: " + plate)
                .content("Thợ đã xóa hạng mục '" + productName + "' khỏi xe " + plate)
                .type("WARNING")
                .link("/sale/orders/" + order.getId())
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());
    }

}
