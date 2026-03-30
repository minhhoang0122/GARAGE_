package com.gara.modules.service.service;

import com.gara.dto.ReceptionDetailDTO;
import com.gara.dto.ReceptionFormData;
import com.gara.dto.VehicleSearchResultDTO;
import com.gara.entity.*;
import com.gara.modules.reception.repository.*;
import com.gara.modules.service.repository.*;
import com.gara.modules.customer.repository.*;
import com.gara.modules.support.service.AsyncAuditService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import com.gara.entity.enums.OrderStatus;

@Service
public class ReceptionService {

    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final ReceptionRepository receptionRepository;
    private final RepairOrderRepository orderRepository;
    private final com.gara.modules.support.service.AsyncNotificationService asyncNotificationService;
    private final AsyncAuditService asyncAuditService;
    private final TimelineService timelineService;

    public ReceptionService(VehicleRepository vehicleRepository,
            CustomerRepository customerRepository,
            ReceptionRepository receptionRepository,
            RepairOrderRepository orderRepository,
            com.gara.modules.support.service.AsyncNotificationService asyncNotificationService,
            AsyncAuditService asyncAuditService,
            TimelineService timelineService) {
        this.vehicleRepository = vehicleRepository;
        this.customerRepository = customerRepository;
        this.receptionRepository = receptionRepository;
        this.orderRepository = orderRepository;
        this.asyncNotificationService = asyncNotificationService;
        this.asyncAuditService = asyncAuditService;
        this.timelineService = timelineService;
    }

    private long countActiveWarranties(String plate) {
        // Optimized: Use native SQL query for performance and correctness
        // This handles Date logic directly in DB
        return orderRepository.countActiveWarrantiesByPlate(plate);
    }

    @Transactional(readOnly = true)
    public VehicleSearchResultDTO searchVehicle(String plate) {
        Optional<Vehicle> vehicleOpt = vehicleRepository.findByLicensePlate(plate);
        if (vehicleOpt.isEmpty()) {
            return null;
        }

        Vehicle vehicle = vehicleOpt.get();
        int warrantyCount = (int) countActiveWarranties(plate);

        // Get history
        List<RepairOrder> history = orderRepository.findTop5ByReception_Vehicle_LicensePlateOrderByCreatedAtDesc(plate);
        List<Map<String, Object>> historyMaps = history.stream().map(o -> {
            Map<String, Object> m = new HashMap<>();
            m.put("ID", o.getId());
            m.put("NgayTao", o.getCreatedAt());
            m.put("TongCong", o.getGrandTotal());
            m.put("TrangThai", o.getStatus() != null ? o.getStatus().name() : null);
            m.put("ChiTietDonHang", o.getOrderItems().stream().map(i -> {
                Map<String, Object> im = new HashMap<>();
                String tenHang = (i.getProduct() != null) ? i.getProduct().getName() : "Nội dung khác";
                im.put("TenHang", tenHang);
                return im;
            }).toList());
            return m;
        }).toList();

        return VehicleSearchResultDTO.builder()
                .exists(true)
                .plate(vehicle.getLicensePlate())
                .customerName(vehicle.getCustomer().getFullName())
                .customerPhone(vehicle.getCustomer().getPhone())
                .customerAddress(vehicle.getCustomer().getAddress())
                .customerEmail(vehicle.getCustomer().getEmail())
                .customer(null)
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .soKhung(vehicle.getVin())
                .soMay(vehicle.getEngineNumber())
                .odo(vehicle.getCurrentOdo())
                .history(historyMaps)
                .activeWarrantyCount(warrantyCount)
                .build();
    }


    @Transactional
    public Integer createReception(ReceptionFormData data, User user) {
        try {
            // 1. Find or Create Vehicle & Customer
            // Use pessimistic lock to prevent race conditions for existing vehicles
            Vehicle vehicle = vehicleRepository.findByLicensePlateWithLock(data.bienSo()).orElse(null);

            // Check for active orders to prevent double reception
            if (vehicle != null) {
                List<OrderStatus> activeStatuses = java.util.Arrays.asList(
                        OrderStatus.RECEIVED, OrderStatus.WAITING_FOR_DIAGNOSIS, OrderStatus.QUOTING,
                        OrderStatus.RE_QUOTATION, OrderStatus.WAITING_FOR_CUSTOMER_APPROVAL, OrderStatus.APPROVED,
                        OrderStatus.WAITING_FOR_PARTS, OrderStatus.IN_PROGRESS,
                        OrderStatus.WAITING_FOR_QC, OrderStatus.WAITING_FOR_PAYMENT);
                List<RepairOrder> activeOrders = orderRepository.findByReception_Vehicle_LicensePlateAndStatusIn(data.bienSo(),
                        activeStatuses);
                if (!activeOrders.isEmpty()) {
                    throw new RuntimeException("Xe đang có phiếu sửa chữa chưa hoàn thành.");
                }

                // Bug 103 Fix: Verify ownership (Phone match with normalization)
                String normalizedProvidedPhone = normalizePhone(data.sdtKhach());
                String normalizedExistingPhone = normalizePhone(vehicle.getCustomer().getPhone());
                
                if (!normalizedExistingPhone.equals(normalizedProvidedPhone)) {
                    throw new RuntimeException("Biển số này (" + data.bienSo() + ") đã được đăng ký với số điện thoại khác (" + vehicle.getCustomer().getPhone() + "). Vui lòng kiểm tra lại.");
                }

                // Bug 72 Fix: ODO Consistency Check
                if (data.odo() < vehicle.getCurrentOdo()) {
                    throw new RuntimeException("Lỗi: Số ODO mới (" + data.odo() +
                            " km) nhỏ hơn số ODO ghi nhận lần trước (" + vehicle.getCurrentOdo() + " km).");
                }

                if (data.odo() > vehicle.getCurrentOdo()) {
                    vehicle.setCurrentOdo(data.odo());
                    vehicleRepository.save(vehicle);
                }

                // Bug 102 Fix: Update Customer info if provided
                Customer cust = vehicle.getCustomer();
                if (data.tenKhach() != null && !data.tenKhach().isBlank()) {
                    cust.setFullName(data.tenKhach());
                }
                if (data.diaChiKhach() != null && !data.diaChiKhach().isBlank()) {
                    cust.setAddress(data.diaChiKhach());
                }
                if (data.emailKhach() != null && !data.emailKhach().isBlank()) {
                    cust.setEmail(data.emailKhach());
                }
                customerRepository.save(cust);

            } else {
                // Check if existing Customer by phone to prevent fragmentation (Bug 80)
                Customer customer = customerRepository.findByPhone(data.sdtKhach()).orElse(null);

                if (customer == null) {
                    customer = new Customer();
                    customer.setFullName(data.tenKhach());
                    customer.setPhone(data.sdtKhach());
                    customer.setAddress(data.diaChiKhach());
                    customer.setEmail(data.emailKhach());
                    customer = customerRepository.save(customer);
                }

                vehicle = new Vehicle();
                vehicle.setLicensePlate(data.bienSo());
                vehicle.setCustomer(customer);
                vehicle.setBrand(data.nhanHieu());
                vehicle.setModel(data.model());
                vehicle.setVin(data.soKhung());
                vehicle.setEngineNumber(data.soMay());
                vehicle.setCurrentOdo(data.odo());
                vehicleRepository.save(vehicle);
            }

            // 2. Create Reception (PhieuTiepNhan)
            Reception reception = new Reception();
            reception.setVehicle(vehicle);
            reception.setReceptionist(user);
            reception.setFuelLevel(data.mucXang() != null ? BigDecimal.valueOf(data.mucXang()) : BigDecimal.ZERO);
            // Bug 104 Fix: Basic XSS Sanitation
            reception.setShellStatus(sanitizeHtml(data.tinhTrangVo()));
            reception.setPreliminaryRequest(sanitizeHtml(data.yeuCauKhach()));
            // Tránh lỗi "invalid input syntax for type json" ở PostgreSQL khi chuỗi rỗng
            reception.setImages(data.hinhAnh() != null && !data.hinhAnh().isBlank() ? data.hinhAnh() : null);
            reception.setOdo(data.odo());
            reception.setReceptionDate(LocalDateTime.now());
            receptionRepository.save(reception);

            // Timeline Log: Initial Event
            timelineService.recordEvent(reception.getId(), user, "RECEPTION", 
                    "Tiếp nhận xe " + vehicle.getLicensePlate() + " vào xưởng. Yêu cầu: " + reception.getPreliminaryRequest(),
                    null, null, false);

            // 3. Create RepairOrder (DonHangSuaChua)
            RepairOrder order = new RepairOrder();
            order.setReception(reception);
            order.setServiceAdvisor(user);
            order.setStatus(OrderStatus.WAITING_FOR_DIAGNOSIS);
            order.setPartsTotal(BigDecimal.ZERO);
            order.setLaborTotal(BigDecimal.ZERO);
            order.setGrandTotal(BigDecimal.ZERO);
            order.setTotalDiscount(BigDecimal.ZERO);
            order.setVatAmount(BigDecimal.ZERO);
            order.setDeposit(BigDecimal.ZERO);
            orderRepository.save(order);

            // Bug 117 Fix: Audit order creation
            asyncAuditService.logAsync(AuditLog.builder()
                    .tableName("RepairOrder")
                    .recordId(order.getId())
                    .action("CREATE")
                    .newData(OrderStatus.WAITING_FOR_DIAGNOSIS.name())
                    .reason("Tiếp nhận xe: " + vehicle.getLicensePlate())
                    .userId(user.getId())
                    .build());

            // Notify
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .role("SALE")
                    .title("Xe mới tiếp nhận: " + vehicle.getLicensePlate())
                    .content("Đã tạo phiếu tiếp nhận cho xe " + vehicle.getLicensePlate() + ". Vui lòng lập báo giá.")
                    .type("INFO")
                    .link("/sale/orders/" + order.getId())
                    .refId(order.getId())
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());

            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .role("QUAN_LY_XUONG")
                    .title("Xe chờ chẩn đoán: " + vehicle.getLicensePlate())
                    .content("Xe " + vehicle.getLicensePlate() + " đã tiếp nhận. Vui lòng tiến hành chẩn đoán.")
                    .type("INFO")
                    .link("/mechanic/inspect/" + reception.getId())
                    .refId(order.getId())
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());

            return reception.getId();

        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Bug 105 Fix: Handle race condition for duplicate license plate
            throw new RuntimeException("Lỗi: Xe với biển số " + data.bienSo() + " đã được tạo bởi một yêu cầu khác. Vui lòng thử lại.");
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllReceptions() {
        List<Object[]> results = receptionRepository.findAllReceptionsRaw(
                org.springframework.data.domain.PageRequest.of(0, 50));

        return results.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("ID", row[0]);
            m.put("NgayGio", row[1]);
            m.put("XeBienSo", row[2]);
            m.put("KhachHangName", row[3]);
            m.put("KhachHangPhone", row[4]);
            m.put("XeNhanHieu", row[5]);
            m.put("XeModel", row[6]);
            m.put("HinhAnh", row[9]);

            if (row[7] != null) {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("ID", row[7]);

                // Assuming row[8] contains the enum status, handle accordingly
                String statusStr = null;
                if (row[8] != null) {
                    if (row[8] instanceof OrderStatus) {
                        statusStr = ((OrderStatus) row[8]).name();
                    } else {
                        statusStr = row[8].toString();
                    }
                }
                orderMap.put("TrangThai", statusStr);
                m.put("DonHangSuaChua", orderMap);
            }
            return m;
        }).toList();
    }

    @Transactional(readOnly = true)
    public java.util.Optional<ReceptionDetailDTO> getReceptionById(Integer id) {
        return receptionRepository.findByIdWithDetails(id).map(reception -> {
            return ReceptionDetailDTO.builder()
                .id(reception.getId())
                .ngayGio(reception.getReceptionDate())
                .yeuCauSoBo(reception.getPreliminaryRequest())
                .mucXang(reception.getFuelLevel())
                .tinhTrangVoXe(reception.getShellStatus())
                .hinhAnh(reception.getImages())
                .bienSo(reception.getVehicle().getLicensePlate())
                .nhanHieu(reception.getVehicle().getBrand())
                .model(reception.getVehicle().getModel())
                .soKhung(reception.getVehicle().getVin())
                .soMay(reception.getVehicle().getEngineNumber())
                .odo(reception.getOdo())
                .tenKhach(reception.getVehicle().getCustomer() != null ? reception.getVehicle().getCustomer().getFullName() : null)
                .sdtKhach(
                        reception.getVehicle().getCustomer() != null ? reception.getVehicle().getCustomer().getPhone() : null)
                .diaChiKhach(
                        reception.getVehicle().getCustomer() != null ? reception.getVehicle().getCustomer().getAddress() : null)
                .emailKhach(
                        reception.getVehicle().getCustomer() != null ? reception.getVehicle().getCustomer().getEmail() : null)
                .orderId(reception.getRepairOrder() != null ? reception.getRepairOrder().getId() : null)
                .orderStatus(reception.getRepairOrder() != null ? reception.getRepairOrder().getStatus().name() : null)
                .build();
        });
    }

    private String sanitizeHtml(String input) {
        if (input == null) return null;
        // Basic escaping to prevent script injection in common fields
        return input.replace("<", "&lt;").replace(">", "&gt;")
                    .replace("\"", "&quot;").replace("'", "&#39;");
    }
    
    private String normalizePhone(String phone) {
        if (phone == null) return null;
        // Loại bỏ tất cả ký tự không phải số
        String digits = phone.replaceAll("[^0-9]", "");
        // Nếu bắt đầu bằng 84 (mã quốc gia), chuyển về đầu 0
        if (digits.startsWith("84")) {
            digits = "0" + digits.substring(2);
        }
        return digits;
    }
}
