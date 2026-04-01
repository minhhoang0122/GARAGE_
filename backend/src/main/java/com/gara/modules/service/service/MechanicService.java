package com.gara.modules.service.service;

import com.gara.modules.inventory.service.WarehouseService;
import com.gara.dto.*;
import com.gara.entity.*;
import com.gara.modules.mechanic.repository.*;
import com.gara.modules.service.repository.*;
import com.gara.modules.auth.repository.UserRepository;
import com.gara.modules.inventory.repository.*;
import com.gara.modules.reception.repository.*;
import com.gara.modules.support.service.AsyncAuditService;
import com.gara.modules.support.service.AsyncNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.gara.entity.enums.OrderStatus;
import com.gara.entity.enums.ItemStatus;

@Service
public class MechanicService {

    private final RepairOrderRepository repairOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final ReceptionRepository receptionRepository;
    private final UserRepository userRepository;
    private final WarehouseService warehouseService;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final AsyncNotificationService asyncNotificationService;
    private final AsyncAuditService asyncAuditService;
    private final TimelineService timelineService;

    public MechanicService(RepairOrderRepository repairOrderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            ReceptionRepository receptionRepository,
            UserRepository userRepository,
            WarehouseService warehouseService,
            TaskAssignmentRepository taskAssignmentRepository,
            AsyncNotificationService asyncNotificationService,
            AsyncAuditService asyncAuditService,
            TimelineService timelineService) {
        this.repairOrderRepository = repairOrderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.receptionRepository = receptionRepository;
        this.userRepository = userRepository;
        this.warehouseService = warehouseService;
        this.taskAssignmentRepository = taskAssignmentRepository;
        this.asyncNotificationService = asyncNotificationService;
        this.asyncAuditService = asyncAuditService;
        this.timelineService = timelineService;
    }

    // Helper: Mask PII for Mechanics
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

        if (user.isManager() || user.isAdmin() || user.hasPermission("VIEW_ALL_JOBS")) {
            List<JobSummaryDTO> allJobs = new ArrayList<>();
            
            // Active repair jobs
            allJobs.addAll(repairOrderRepository.findJobsForMechanic().stream()
                    .filter(o -> !o.getOrderItems().isEmpty())
                    .map(this::mapToJobSummary)
                    .toList());

            // QC jobs assigned to this manager
            allJobs.addAll(repairOrderRepository.findByStatusIn(List.of(OrderStatus.WAITING_FOR_QC)).stream()
                    .filter(o -> o.getDiagnosticMechanic() != null && o.getDiagnosticMechanic().getId().equals(userId))
                    .map(this::mapToJobSummary)
                    .toList());

            return allJobs;
        }

        // THO_SUA_CHUA: Only see jobs that have items assigned to them via TaskAssignment
        return repairOrderRepository.findJobsForMechanic().stream()
                .filter(o -> !o.getOrderItems().isEmpty())
                .filter(o -> o.getOrderItems().stream().anyMatch(item ->
                        item.getTaskAssignments() != null && item.getTaskAssignments().stream()
                                .anyMatch(ta -> ta.getMechanic().getId().equals(userId))
                ))
                .map(this::mapToJobSummary)
                .toList();
    }

    private JobSummaryDTO mapToJobSummary(RepairOrder order) {
        return mapToJobSummary(order, null);
    }

    private JobSummaryDTO mapToJobSummary(RepairOrder order, List<OrderItemDTO> items) {
        Reception r = order.getReception();
        return JobSummaryDTO.builder()
                .id(order.getId())
                .plate(r.getVehicle().getLicensePlate())
                .customerName(r.getVehicle().getCustomer().getFullName())
                .customerPhone(maskPhone(r.getVehicle().getCustomer().getPhone()))
                .vehicleBrand(r.getVehicle().getBrand())
                .vehicleModel(r.getVehicle().getModel())
                .createdAt(order.getCreatedAt())
                .totalItems(order.getOrderItems().size())
                .completedItems((int) order.getOrderItems().stream()
                        .filter(i -> ItemStatus.COMPLETED.equals(i.getStatus())).count())
                .imageUrl(r.getImages())
                .status(order.getStatus().name())
                .claimedById(order.getAssignedMechanic() != null ? order.getAssignedMechanic().getId() : null)
                .claimedByName(order.getAssignedMechanic() != null ? order.getAssignedMechanic().getFullName() : null)
                .items(items)
                .build();
    }

    private AssignmentDTO mapToAssignmentDTO(TaskAssignment ta) {
        return new AssignmentDTO(
                ta.getId(),
                ta.getMechanic() != null ? ta.getMechanic().getId() : null,
                ta.getMechanic() != null ? ta.getMechanic().getFullName() : "N/A",
                Boolean.TRUE.equals(ta.getIsMainMechanic())
        );
    }

    private OrderItemDTO mapToOrderItemDTO(OrderItem item) {
        List<AssignmentDTO> assignments = (item.getTaskAssignments() != null)
                ? item.getTaskAssignments().stream().map(this::mapToAssignmentDTO).toList()
                : new ArrayList<>();

        return OrderItemDTO.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productCode(item.getProduct() != null ? item.getProduct().getSku() : "N/A")
                .productName(item.getProduct() != null ? item.getProduct().getName() : "N/A")
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .total(item.getTotalAmount())
                .itemStatus(item.getStatus() != null ? item.getStatus().name() : "PROPOSAL")
                .isWarranty(Boolean.TRUE.equals(item.getIsWarranty()))
                .assignments(assignments)
                .version(item.getVersion())
                .build();
    }

    @Transactional
    public void claimJob(Integer orderId, Integer userId) {
        RepairOrder order = repairOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));
        User quanDoc = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!quanDoc.hasPermission("ASSIGN_WORK") && !quanDoc.isAdmin()) {
            throw new RuntimeException("Chỉ Quản đốc hoặc Admin mới được nhận phụ trách.");
        }

        if (order.getAssignedMechanic() != null) {
            throw new RuntimeException("Đơn hàng đã được phụ trách bởi: " + order.getAssignedMechanic().getFullName());
        }

        // Rule 10.4: Check Deposit
        BigDecimal threshold = new BigDecimal("5000000");
        BigDecimal minRate = new BigDecimal("0.3");
        if (order.getGrandTotal().compareTo(threshold) > 0) {
            BigDecimal minDeposit = order.getGrandTotal().multiply(minRate);
            if (order.getDeposit() == null || order.getDeposit().compareTo(minDeposit) < 0) {
                throw new RuntimeException("Đơn hàng chưa đủ tiền cọc (Cần tối thiểu 30%). Vui lòng báo Sale thu tiền.");
            }
        }

        order.setAssignedMechanic(quanDoc);

        // Transition: RECEIVED → WAITING_FOR_DIAGNOSIS when manager claims
        OrderStatus oldStatus = order.getStatus();
        if (OrderStatus.RECEIVED.equals(oldStatus)) {
            order.setStatus(OrderStatus.WAITING_FOR_DIAGNOSIS);
        }
        repairOrderRepository.save(order);

        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(orderId)
                .action("UPDATE")
                .oldData(oldStatus.name())
                .newData("QD:" + quanDoc.getFullName() + " | Status:" + order.getStatus().name())
                .reason("Quản đốc " + quanDoc.getFullName() + " nhận phụ trách — chuyển sang Chờ chẩn đoán")
                .userId(userId)
                .build());
    }

    @Transactional
    public void unclaimJob(Integer orderId, Integer userId) {
        RepairOrder order = repairOrderRepository.findById(orderId).orElseThrow();
        if (order.getAssignedMechanic() != null && order.getAssignedMechanic().getId().equals(userId)) {
            order.setAssignedMechanic(null);
            repairOrderRepository.save(order);
        }
    }

    @Transactional
    public void submitAssignments(Integer orderId, Integer userId) {
        RepairOrder order = repairOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));
        User quanDoc = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!quanDoc.hasPermission("ASSIGN_WORK") && !quanDoc.isAdmin()) {
            throw new RuntimeException("Chỉ Quản đốc hoặc Admin mới được xác nhận phân công.");
        }

        if (order.getAssignedMechanic() == null || !order.getAssignedMechanic().getId().equals(userId)) {
            if (!quanDoc.isAdmin()) {
                throw new RuntimeException("Bạn không phải Quản đốc phụ trách đơn này.");
            }
        }

        List<OrderItem> items = order.getOrderItems();
        List<TaskAssignment> allAssignments = new ArrayList<>();
        for (OrderItem item : items) {
            if (item.getTaskAssignments() != null) {
                allAssignments.addAll(item.getTaskAssignments());
            }
        }
        if (allAssignments.isEmpty()) {
            throw new RuntimeException("Chưa phân công thợ cho hạng mục nào. Vui lòng gán thợ trước khi xác nhận.");
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(OrderStatus.IN_PROGRESS);
        repairOrderRepository.save(order);

        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(orderId)
                .action("UPDATE")
                .oldData(oldStatus.name())
                .newData(order.getStatus().name())
                .reason("Quản đốc " + quanDoc.getFullName() + " xác nhận phân công")
                .userId(userId)
                .build());

        String bienSo = order.getReception().getVehicle().getLicensePlate();
        allAssignments.stream()
                .map(a -> a.getMechanic().getId())
                .distinct()
                .forEach(mechanicId -> {
                    asyncNotificationService.pushUniqueAsync(Notification.builder()
                            .userId(mechanicId)
                            .role("THO_SUA_CHUA")
                            .title("Việc mới: " + bienSo)
                            .content("Quản đốc " + quanDoc.getFullName() + " đã phân công việc cho bạn. Vui lòng kiểm tra.")
                            .type("INFO")
                            .link("/mechanic/jobs/" + orderId)
                            .createdAt(LocalDateTime.now())
                            .isRead(false)
                            .build());
                });
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailableMechanics() {
        List<User> mechanics = userRepository.findAll().stream()
                .filter(u -> u.getIsActive() != null && u.getIsActive())
                .filter(u -> u.getRoles().stream().anyMatch(r -> "THO_SUA_CHUA".equals(r.getName())))
                .toList();

        List<Object[]> workloadData = taskAssignmentRepository.countActiveOrdersPerMechanic();
        Map<Integer, Long> workloadMap = new HashMap<>();
        for (Object[] row : workloadData) {
            workloadMap.put((Integer) row[0], (Long) row[1]);
        }

        return mechanics.stream().map(m -> {
            Map<String, Object> info = new HashMap<>();
            info.put("id", m.getId());
            info.put("hoTen", m.getFullName());
            info.put("chuyenMon", m.getSpecialty() != null ? m.getSpecialty().name() : null);
            info.put("chuyenMonLabel", m.getSpecialty() != null ? m.getSpecialty().getDescription() : "Chưa xác định");
            info.put("capBac", m.getLevel() != null ? m.getLevel().name() : null);
            info.put("capBacLabel", m.getLevel() != null ? m.getLevel().getDescription() : "Chưa xác định");
            info.put("soViecDangLam", workloadMap.getOrDefault(m.getId(), 0L));
            return info;
        }).toList();
    }

    @Transactional
    public void submitProposal(Integer receptionId, List<ProposalItemDTO> items, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.hasPermission("CREATE_PROPOSAL") && !user.isAdmin()) {
            throw new RuntimeException("Bạn không có quyền lập đề xuất sửa chữa.");
        }

        RepairOrder order = repairOrderRepository.findByReceptionId(receptionId)
                .orElseThrow(() -> new RuntimeException("Order not found for reception"));

        if (!List.of(OrderStatus.RECEIVED, OrderStatus.WAITING_FOR_DIAGNOSIS).contains(order.getStatus())) {
            throw new RuntimeException("Đơn hàng đã qua giai đoạn lập đề xuất chẩn đoán.");
        }

        if (order.getDiagnosticMechanic() != null && !order.getDiagnosticMechanic().getId().equals(userId) && !user.isAdmin()) {
            throw new RuntimeException("Xe này đã được tiếp nhận chẩn đoán bởi: " + order.getDiagnosticMechanic().getFullName());
        }
        order.setDiagnosticMechanic(user);

        List<Integer> existingProductIds = order.getOrderItems().stream()
                .filter(item -> !ItemStatus.CUSTOMER_REJECTED.equals(item.getStatus()))
                .map(item -> item.getProduct().getId())
                .toList();

        for (ProposalItemDTO pItem : items) {
            if (pItem.quantity() == null || pItem.quantity() <= 0) {
                throw new RuntimeException("Số lượng phải lớn hơn 0");
            }
            
            if (existingProductIds.contains(pItem.productId())) {
                throw new RuntimeException("Phụ tùng/Dịch vụ (ID: " + pItem.productId() + ") đã tồn tại. Vui lòng kiểm tra lại.");
            }
            
            Product product = productRepository.findById(pItem.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            OrderItem item = new OrderItem();
            item.setRepairOrder(order);
            item.setProduct(product);
            item.setQuantity(pItem.quantity().intValue());
            item.setUnitPrice(product.getRetailPrice());
            item.setTotalAmount(product.getRetailPrice().multiply(BigDecimal.valueOf(pItem.quantity())));
            item.setStatus(ItemStatus.PROPOSAL);
            item.setSuggestedBy(user);
            item.setNote(pItem.note());
            item.setSuggestedAt(LocalDateTime.now());

            orderItemRepository.save(item);
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(OrderStatus.WAITING_FOR_CUSTOMER_APPROVAL);
        repairOrderRepository.save(order);

        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(order.getId())
                .action("UPDATE")
                .oldData(oldStatus.name())
                .newData(order.getStatus().name())
                .reason("Thợ hoàn tất chẩn đoán & gửi đề xuất")
                .userId(userId)
                .build());

        // recalculateOrderTotals(order.getId(), items); // Logic moved to DB Triggers

        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("SALE")
                .title("Đề xuất mới: " + order.getReception().getVehicle().getLicensePlate())
                .content("Thợ đã gửi đề xuất sửa chữa. Vui lòng báo giá cho khách.")
                .type("INFO")
                .link("/sale/orders/" + order.getId())
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        timelineService.recordEvent(order.getReception().getId(), user, "MECHANIC_DIAGNOSIS",
                "Kỹ thuật viên " + user.getFullName() + " đã hoàn thành chẩn đoán và đề xuất " + items.size() + " hạng mục sửa chữa.",
                null, null, false);
    }

    // recalculateOrderTotals method removed as logic is now handled by database triggers.

    @Transactional
    public void reportTechnicalIssue(Integer orderId, List<ProposalItemDTO> items, Integer userId) {
        RepairOrder order = repairOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!List.of(OrderStatus.IN_PROGRESS, OrderStatus.APPROVED, OrderStatus.WAITING_FOR_DIAGNOSIS).contains(order.getStatus())) {
            throw new RuntimeException("Không thể báo phát sinh kỹ thuật trong trạng thái hiện tại.");
        }

        User user = userRepository.findById(userId).orElseThrow();
        if (!user.hasPermission("COMPLETE_REPAIR_JOB") && !user.isAdmin()) {
            throw new RuntimeException("Bạn không có quyền báo phát sinh kỹ thuật.");
        }

        for (ProposalItemDTO pItem : items) {
            Product product = productRepository.findById(pItem.productId()).orElseThrow();
            OrderItem item = new OrderItem();
            item.setRepairOrder(order);
            item.setProduct(product);
            item.setQuantity(pItem.quantity().intValue());
            item.setUnitPrice(product.getRetailPrice());
            item.setTotalAmount(product.getRetailPrice().multiply(BigDecimal.valueOf(pItem.quantity())));
            item.setStatus(user.isManager() || user.isAdmin() ? ItemStatus.PROPOSAL : ItemStatus.WAITING_FOR_MANAGER_APPROVAL);
            item.setSuggestedBy(user);
            item.setNote(pItem.note());
            item.setSuggestedAt(LocalDateTime.now());
            orderItemRepository.save(item);
        }

        // recalculateOrderTotals(orderId, items); // Logic moved to DB Triggers
        
        asyncAuditService.logAsync(AuditLog.builder()
                .tableName("RepairOrder")
                .recordId(order.getId())
                .action("UPDATE")
                .reason(user.isManager() || user.isAdmin() ? "Quản đốc đề xuất mới" : "Thợ báo phát sinh kỹ thuật mới")
                .userId(userId)
                .build());

        String eventMsg = (user.isManager() || user.isAdmin()) 
            ? "Quản đốc " + user.getFullName() + " đã trực tiếp đề xuất " + items.size() + " hạng mục sửa chữa bổ sung."
            : "Kỹ thuật viên " + user.getFullName() + " đã báo phát sinh kỹ thuật với " + items.size() + " hạng mục mới.";

        timelineService.recordEvent(order.getReception().getId(), user, "TECHNICAL_ISSUE",
                eventMsg, null, null, false);
    }

    @Transactional
    public void completeJob(Integer orderId) {
        RepairOrder order = repairOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!OrderStatus.IN_PROGRESS.equals(order.getStatus())) {
            throw new RuntimeException("Công việc phải ở trạng thái đang sửa mới có thể hoàn thành.");
        }
        order.setStatus(OrderStatus.WAITING_FOR_QC);
        repairOrderRepository.save(order);

        if (order.getDiagnosticMechanic() != null) {
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .userId(order.getDiagnosticMechanic().getId())
                    .role("QUAN_LY_XUONG")
                    .title("Yêu cầu nghiệm thu: " + order.getReception().getVehicle().getLicensePlate())
                    .content("Thợ sửa chữa đã hoàn thành. Vui lòng kiểm tra xe.")
                    .type("INFO")
                    .link("/mechanic/jobs/" + orderId)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }
    }

    @Transactional
    public void qcPass(Integer orderId, Integer userId) {
        RepairOrder order = repairOrderRepository.findById(orderId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!OrderStatus.WAITING_FOR_QC.equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng không ở trạng thái chờ KCS.");
        }
        order.setStatus(OrderStatus.WAITING_FOR_PAYMENT);
        repairOrderRepository.save(order);

        warehouseService.exportOrder(orderId, order.getAssignedMechanic() != null ? order.getAssignedMechanic().getId() : userId);

        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .role("SALE")
                .title("Sửa chữa hoàn tất: " + order.getReception().getVehicle().getLicensePlate())
                .content("Xe đã qua KCS và sẵn sàng thanh toán.")
                .type("SUCCESS")
                .link("/sale/orders/" + orderId)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        timelineService.recordEvent(order.getReception().getId(), user, "QC_PASS",
                "Nghiệm thu chất lượng (KCS) ĐẠT. Xe đã chuyển sang trạng thái chờ thanh toán.",
                null, null, false);
    }

    @Transactional
    public void qcFail(Integer orderId, Integer userId) {
        qcFail(orderId, userId, "KCS không đạt yêu cầu");
    }

    @Transactional
    public void qcFail(Integer orderId, Integer userId, String notes) {
        RepairOrder order = repairOrderRepository.findById(orderId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        order.setStatus(OrderStatus.IN_PROGRESS);
        // Assuming repairOrder can store QC notes in the description or a new field.
        // If the field doesn't exist, we skip or use a generic field.
        repairOrderRepository.save(order);
        
        asyncNotificationService.pushUniqueAsync(Notification.builder()
                .userId(order.getAssignedMechanic() != null ? order.getAssignedMechanic().getId() : null)
                .title("KCS thất bại: " + order.getReception().getVehicle().getLicensePlate())
                .content("Xe không đạt nghiệm thu. Lý do: " + notes)
                .type("WARNING")
                .link("/mechanic/jobs/" + orderId)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        timelineService.recordEvent(order.getReception().getId(), user, "QC_FAIL",
                "Nghiệm thu chất lượng (KCS) KHÔNG ĐẠT. Lý do: " + notes + ". Xe được chuyển lại khu vực kỹ thuật.",
                null, null, false);
    }

    // New missing methods requested by Controller or logic
    @Transactional(readOnly = true)
    public List<JobSummaryDTO> getRepairHistory(Integer userId) {
        return repairOrderRepository.findAllByAssignedMechanicIdAndStatusIn(userId, List.of(OrderStatus.COMPLETED, OrderStatus.CLOSED)).stream()
                .map(this::mapToJobSummary)
                .toList();
    }

    @Transactional
    public void assignJob(Integer orderId, Integer mechanicId, Integer userId) {
        RepairOrder order = repairOrderRepository.findById(orderId).orElseThrow();
        User mechanic = userRepository.findById(mechanicId).orElseThrow();
        order.setAssignedMechanic(mechanic);
        repairOrderRepository.save(order);
    }

    @Transactional
    public void adminAssignItem(Integer itemId, Integer mechanicId, Integer userId) {
        OrderItem item = orderItemRepository.findById(itemId).orElseThrow();
        User mechanic = userRepository.findById(mechanicId).orElseThrow();
        
        TaskAssignment assignment = TaskAssignment.builder()
                .orderItem(item)
                .mechanic(mechanic)
                .laborPercentage(BigDecimal.valueOf(100))
                .isMainMechanic(true)
                .status("APPROVED")
                .build();
        taskAssignmentRepository.save(assignment);
    }

    @Transactional
    public void adminUnassignItem(Integer itemId, Integer userId) {
        taskAssignmentRepository.deleteByOrderItemId(itemId);
    }

    @Transactional
    public void toggleItemCompletion(Integer itemId, Integer userId) {
        OrderItem item = orderItemRepository.findById(itemId).orElseThrow();
        if (ItemStatus.COMPLETED.equals(item.getStatus())) {
            item.setStatus(ItemStatus.IN_PROGRESS);
        } else {
            item.setStatus(ItemStatus.COMPLETED);
        }
        orderItemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("activeJobs", repairOrderRepository.countByStatusIn(List.of(OrderStatus.IN_PROGRESS, OrderStatus.WAITING_FOR_DIAGNOSIS)));
        stats.put("waitingQC", repairOrderRepository.countByStatus(OrderStatus.WAITING_FOR_QC));
        stats.put("completedToday", repairOrderRepository.countByStatusAndUpdatedAtAfter(OrderStatus.COMPLETED, LocalDateTime.now().withHour(0).withMinute(0)));
        return stats;
    }

    @Transactional(readOnly = true)
    public JobSummaryDTO getJobDetails(Integer orderId) {
        RepairOrder order = repairOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));

        List<OrderItemDTO> items = order.getOrderItems().stream()
                .map(this::mapToOrderItemDTO)
                .toList();

        return mapToJobSummary(order, items);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getTopProducts() {
        return productRepository.findAll().stream().limit(10)
                .map(p -> ProductDTO.builder().id(p.getId()).name(p.getName()).retailPrice(p.getRetailPrice()).sku(p.getSku()).isService(p.getIsService()).build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(query, query).stream()
                .map(p -> ProductDTO.builder().id(p.getId()).name(p.getName()).retailPrice(p.getRetailPrice()).sku(p.getSku()).isService(p.getIsService()).build())
                .toList();
    }

    @Transactional
    public void removeProposedItem(Integer itemId) {
        OrderItem item = orderItemRepository.findById(itemId).orElseThrow();
        if (List.of(ItemStatus.PROPOSAL, ItemStatus.WAITING_FOR_MANAGER_APPROVAL).contains(item.getStatus())) {
            orderItemRepository.delete(item);
        } else {
            throw new RuntimeException("Chỉ có thể xóa hạng mục đang chờ duyệt hoặc đề xuất.");
        }
    }

    @Transactional(readOnly = true)
    public ReceptionInspectDTO getReceptionDetail(Integer receptionId) {
        Reception r = receptionRepository.findById(receptionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu tiếp nhận: " + receptionId));

        RepairOrder order = r.getRepairOrder();
        List<ProposalItemDTO> existingItems = List.of();
        String status = "RECEIVED";
        Integer orderId = null;

        if (order != null) {
            orderId = order.getId();
            status = order.getStatus().name();
            existingItems = order.getOrderItems().stream()
                    .map(item -> {
                        User proposer = item.getSuggestedBy();
                        if (proposer == null && item.getSuggestedById() != null) {
                            proposer = userRepository.findById(item.getSuggestedById()).orElse(null);
                        }
                        
                        // Smart Fallback cho đơn cũ: Nếu vẫn null, lấy người tiếp nhận hoặc quản đốc
                        if (proposer == null) {
                            if (r.getReceptionist() != null) {
                                proposer = r.getReceptionist();
                            } else if (order != null && order.getDiagnosticMechanic() != null) {
                                proposer = order.getDiagnosticMechanic();
                            }
                        }

                        String proposerName = proposer != null ? proposer.getFullName() : "Hệ thống";
                        String proposerRole = proposer != null && proposer.getRoles() != null
                                ? proposer.getRoles().stream().map(Role::getName).collect(Collectors.joining(", "))
                                : "SALE";

                        return ProposalItemDTO.builder()
                                .id(item.getId())
                                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                                .productCode(item.getProduct() != null ? item.getProduct().getSku() : "N/A")
                                .productName(item.getProduct() != null ? item.getProduct().getName() : "Không rõ")
                                .quantity(item.getQuantity().doubleValue())
                                .unitPrice(item.getUnitPrice())
                                .note(item.getNote())
                                .isService(item.getProduct() != null ? item.getProduct().getIsService() : false)
                                .status(item.getStatus() != null ? item.getStatus().name() : "DE_XUAT")
                                .isTechnicalAddition(Boolean.TRUE.equals(item.getIsWarranty()))
                                .proposedByName(proposerName)
                                .proposedByRole(proposerRole)
                                .proposedAt(item.getSuggestedAt() != null ? item.getSuggestedAt().toString() : null)
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        Vehicle v = r.getVehicle();
        String plate = v != null ? v.getLicensePlate() : "N/A";
        String brand = v != null ? v.getBrand() : "N/A";
        String model = v != null ? v.getModel() : "N/A";
        String customerName = (v != null && v.getCustomer() != null) ? v.getCustomer().getFullName() : "N/A";
        String customerPhone = (v != null && v.getCustomer() != null) ? v.getCustomer().getPhone() : "N/A";

        return ReceptionInspectDTO.builder()
                .id(r.getId())
                .plate(plate)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .vehicleBrand(brand)
                .vehicleModel(model)
                .request(r.getPreliminaryRequest())
                .odo(r.getOdo())
                .fuelLevel(r.getFuelLevel() != null ? r.getFuelLevel().toString() : "—")
                .bodyCondition(r.getShellStatus())
                .createdAt(r.getReceptionDate())
                .orderId(orderId)
                .status(status)
                .imageUrl(r.getImages())
                .existingItems(existingItems)
                .proposedItemsCount(existingItems.size())
                .build();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getReceptionsToInspect() {
        return repairOrderRepository.findByStatusIn(List.of(OrderStatus.RECEIVED, OrderStatus.WAITING_FOR_DIAGNOSIS)).stream()
                .map(o -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", o.getReception().getId());
                    map.put("orderId", o.getId());
                    map.put("plate", o.getReception().getVehicle().getLicensePlate());
                    map.put("request", o.getReception().getPreliminaryRequest());
                    map.put("date", o.getReception().getReceptionDate());
                    return map;
                }).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getInspectedHistory(Integer userId) {
        return repairOrderRepository.findByDiagnosticMechanicIdAndStatusNotIn(userId, List.of(OrderStatus.RECEIVED, OrderStatus.WAITING_FOR_DIAGNOSIS)).stream()
                .map(o -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", o.getReception().getId());
                    map.put("plate", o.getReception().getVehicle().getLicensePlate());
                    map.put("status", o.getStatus());
                    map.put("date", o.getCreatedAt());
                    return map;
                }).toList();
    }

    @Transactional(readOnly = true)
    public List<JobSummaryDTO> getOrdersForTechnicalReview() {
        return repairOrderRepository.findOrdersByItemStatus(ItemStatus.WAITING_FOR_MANAGER_APPROVAL).stream()
                .map(this::mapToJobSummary)
                .toList();
    }

    @Transactional
    public void confirmTechnicalIssue(Integer orderId, List<Integer> itemIds, Integer userId) {
        RepairOrder order = repairOrderRepository.findById(orderId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        List<OrderItem> items = orderItemRepository.findAllById(itemIds);
        int approvedCount = 0;
        for (OrderItem item : items) {
            if (ItemStatus.WAITING_FOR_MANAGER_APPROVAL.equals(item.getStatus())) {
                item.setStatus(ItemStatus.PROPOSAL);
                orderItemRepository.save(item);
                approvedCount++;
            }
        }

        if (approvedCount > 0) {
            timelineService.recordEvent(order.getReception().getId(), user, "TECHNICAL_ISSUE",
                    "Quản đốc " + user.getFullName() + " đã duyệt " + approvedCount + " hạng mục phát sinh kỹ thuật từ Thợ.",
                    null, null, false);
        }
    }

    @Transactional
    public void requestJoinTask(Integer itemId, Integer userId) {
        OrderItem item = orderItemRepository.findById(itemId).orElseThrow();
        User mechanic = userRepository.findById(userId).orElseThrow();
        
        TaskAssignment assignment = TaskAssignment.builder()
                .orderItem(item)
                .mechanic(mechanic)
                .laborPercentage(BigDecimal.ZERO)
                .isMainMechanic(false)
                .status("PENDING")
                .build();
        taskAssignmentRepository.save(assignment);
    }

    @Transactional
    public void approveJoinTask(Integer assignmentId, Integer userId) {
        TaskAssignment ta = taskAssignmentRepository.findById(assignmentId).orElseThrow();
        ta.setStatus("APPROVED");
        taskAssignmentRepository.save(ta);
    }

    @Transactional
    public void updateItemMaxMechanics(Integer itemId, Integer limit, Integer userId) {
        OrderItem item = orderItemRepository.findById(itemId).orElseThrow();
        item.setNote((item.getNote() != null ? item.getNote() : "") + " [Max mechanics: " + limit + "]");
        orderItemRepository.save(item);
    }

    @Transactional
    public void updateTaskDistribution(Integer itemId, Map<Integer, BigDecimal> distributions, Integer userId) {
        taskAssignmentRepository.deleteByOrderItemId(itemId);
        OrderItem item = orderItemRepository.findById(itemId).orElseThrow();
        
        distributions.forEach((mId, percent) -> {
            User m = userRepository.findById(mId).orElseThrow();
            TaskAssignment ta = TaskAssignment.builder()
                    .orderItem(item)
                    .mechanic(m)
                    .laborPercentage(percent)
                    .isMainMechanic(mId.equals(userId))
                    .status("APPROVED")
                    .build();
            taskAssignmentRepository.save(ta);
        });
    }

    public RepairOrder getOrderDetail(Integer id) {
        return repairOrderRepository.findByIdWithFullDetails(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }
}