package com.gara.modules.service.service;

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

    public ReceptionService(VehicleRepository vehicleRepository,
            CustomerRepository customerRepository,
            ReceptionRepository receptionRepository,
            RepairOrderRepository orderRepository,
            com.gara.modules.support.service.AsyncNotificationService asyncNotificationService,
            AsyncAuditService asyncAuditService) {
        this.vehicleRepository = vehicleRepository;
        this.customerRepository = customerRepository;
        this.receptionRepository = receptionRepository;
        this.orderRepository = orderRepository;
        this.asyncNotificationService = asyncNotificationService;
        this.asyncAuditService = asyncAuditService;
    }

    private long countActiveWarranties(String plate) {
        // Optimized: Use native SQL query for performance and correctness
        // This handles Date logic directly in DB
        return orderRepository.countActiveWarrantiesByPlate(plate);
    }

    public VehicleSearchResultDTO searchVehicle(String plate) {
        Optional<Vehicle> vehicleOpt = vehicleRepository.findByBienSo(plate);
        if (vehicleOpt.isEmpty()) {
            return VehicleSearchResultDTO.builder().exists(false).build();
        }

        Vehicle vehicle = vehicleOpt.get(); // Integer ID is now available
        // Cast lookup result to int for DTO (DTO expects int, Repo returns long)
        int warrantyCount = (int) countActiveWarranties(plate);

        // Get history
        List<RepairOrder> history = orderRepository.findTop5ByPhieuTiepNhan_Xe_BienSoOrderByNgayTaoDesc(plate);
        List<Map<String, Object>> historyMaps = history.stream().map(o -> {
            Map<String, Object> m = new HashMap<>();
            m.put("ID", o.getId());
            m.put("NgayTao", o.getNgayTao());
            m.put("TongCong", o.getTongCong());
            m.put("TrangThai", o.getTrangThai() != null ? o.getTrangThai().name() : null);
            m.put("ChiTietDonHang", o.getChiTietDonHang().stream().map(i -> {
                Map<String, Object> im = new HashMap<>();
                im.put("HangHoa", Map.of("TenHang", i.getHangHoa().getTenHang()));
                return im;
            }).toList());
            return m;
        }).toList();

        return VehicleSearchResultDTO.builder()
                .exists(true)
                .plate(vehicle.getBienSo())
                .customerName(vehicle.getKhachHang().getHoTen())
                .customerPhone(vehicle.getKhachHang().getSoDienThoai())
                .customer(null) // Bug 101 Fix: Don't leak full customer entity
                .brand(vehicle.getNhanHieu())
                .model(vehicle.getModel())
                .soKhung(vehicle.getSoKhung())
                .soMay(vehicle.getSoMay())
                .odo(vehicle.getOdoHienTai())
                .history(historyMaps)
                .activeWarrantyCount(warrantyCount)
                .build();
    }


    @Transactional
    public Integer createReception(ReceptionFormData data, User user) {
        try {
            // 1. Find or Create Vehicle & Customer
            // Use pessimistic lock to prevent race conditions for existing vehicles
            Vehicle vehicle = vehicleRepository.findByBienSoWithLock(data.bienSo()).orElse(null);

            // Check for active orders to prevent double reception
            if (vehicle != null) {
                List<OrderStatus> activeStatuses = java.util.Arrays.asList(
                        OrderStatus.TIEP_NHAN, OrderStatus.CHO_CHAN_DOAN, OrderStatus.BAO_GIA,
                        OrderStatus.BAO_GIA_LAI, OrderStatus.CHO_KH_DUYET, OrderStatus.DA_DUYET,
                        OrderStatus.CHO_SUA_CHUA, OrderStatus.DANG_SUA,
                        OrderStatus.CHO_KCS, OrderStatus.CHO_THANH_TOAN);
                List<RepairOrder> activeOrders = orderRepository.findByPhieuTiepNhan_Xe_BienSoAndTrangThaiIn(data.bienSo(),
                        activeStatuses);
                if (!activeOrders.isEmpty()) {
                    throw new RuntimeException(
                            "Tạo thất bại: Xe " + data.bienSo() + " hiện đang có Đơn Hàng chưa hoàn tất trong xưởng.");
                }

                // Bug 103 Fix: Verify ownership (Phone match)
                if (!vehicle.getKhachHang().getSoDienThoai().equals(data.sdtKhach())) {
                    throw new RuntimeException("Lỗi xác minh: Số điện thoại không khớp với chủ sở hữu hệ thống của xe " + data.bienSo());
                }

                // Bug 72 Fix: ODO Consistency Check
                if (data.odo() < vehicle.getOdoHienTai()) {
                    throw new RuntimeException("Lỗi: Số ODO mới (" + data.odo() +
                            " km) nhỏ hơn số ODO ghi nhận lần trước (" + vehicle.getOdoHienTai() + " km).");
                }

                if (data.odo() > vehicle.getOdoHienTai()) {
                    vehicle.setOdoHienTai(data.odo());
                    vehicleRepository.save(vehicle);
                }

                // Bug 102 Fix: Update Customer info if provided
                Customer cust = vehicle.getKhachHang();
                if (data.tenKhach() != null && !data.tenKhach().isBlank()) {
                    cust.setHoTen(data.tenKhach());
                }
                if (data.diaChiKhach() != null && !data.diaChiKhach().isBlank()) {
                    cust.setDiaChi(data.diaChiKhach());
                }
                if (data.emailKhach() != null && !data.emailKhach().isBlank()) {
                    cust.setEmail(data.emailKhach());
                }
                customerRepository.save(cust);

            } else {
                // Check if existing Customer by phone to prevent fragmentation (Bug 80)
                Customer customer = customerRepository.findBySoDienThoai(data.sdtKhach()).orElse(null);

                if (customer == null) {
                    customer = new Customer();
                    customer.setHoTen(data.tenKhach());
                    customer.setSoDienThoai(data.sdtKhach());
                    customer.setDiaChi(data.diaChiKhach());
                    customer.setEmail(data.emailKhach());
                    customer = customerRepository.save(customer);
                } else {
                    if (customer.getEmail() == null || customer.getEmail().isEmpty()) {
                        customer.setEmail(data.emailKhach());
                        customerRepository.save(customer);
                    }
                }

                vehicle = new Vehicle();
                vehicle.setBienSo(data.bienSo());
                vehicle.setKhachHang(customer);
                vehicle.setNhanHieu(data.nhanHieu());
                vehicle.setModel(data.model());
                vehicle.setSoKhung(data.soKhung());
                vehicle.setSoMay(data.soMay());
                vehicle.setOdoHienTai(data.odo());
                vehicleRepository.save(vehicle);
            }

            // 2. Create Reception (PhieuTiepNhan)
            Reception reception = new Reception();
            reception.setXe(vehicle);
            reception.setNguoiTiepNhan(user);
            reception.setMucXang(BigDecimal.valueOf(data.mucXang()));
            // Bug 104 Fix: Basic XSS Sanitation
            reception.setTinhTrangVoXe(sanitizeHtml(data.tinhTrangVo()));
            reception.setYeuCauSoBo(sanitizeHtml(data.yeuCauKhach()));
            reception.setHinhAnh(data.hinhAnh());
            reception.setOdo(data.odo());
            reception.setNgayGio(LocalDateTime.now());
            receptionRepository.save(reception);

            // 3. Create RepairOrder (DonHangSuaChua)
            RepairOrder order = new RepairOrder();
            order.setPhieuTiepNhan(reception);
            order.setNguoiPhuTrach(user);
            order.setTrangThai(OrderStatus.TIEP_NHAN);
            order.setTongTienHang(BigDecimal.ZERO);
            order.setTongTienCong(BigDecimal.ZERO);
            order.setTongCong(BigDecimal.ZERO);
            order.setChietKhauTong(BigDecimal.ZERO);
            order.setThueVAT(BigDecimal.ZERO);
            order.setTienCoc(BigDecimal.ZERO);
            orderRepository.save(order);

            // Bug 117 Fix: Audit order creation
            asyncAuditService.logAsync(AuditLog.builder()
                    .bang("DonHangSuaChua")
                    .banGhiId(order.getId())
                    .hanhDong("CREATE")
                    .duLieuMoi(OrderStatus.TIEP_NHAN.name())
                    .lyDo("Tiếp nhận xe: " + vehicle.getBienSo())
                    .nguoiThucHienId(user.getId())
                    .build());

            // Notify
            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .role("SALE")
                    .title("Xe mới tiếp nhận: " + vehicle.getBienSo())
                    .content("Đã tạo phiếu tiếp nhận cho xe " + vehicle.getBienSo() + ". Vui lòng lập báo giá.")
                    .type("INFO")
                    .link("/sale/orders/" + order.getId())
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build());

            asyncNotificationService.pushUniqueAsync(Notification.builder()
                    .role("THO_CHAN_DOAN")
                    .title("Xe chờ chẩn đoán: " + vehicle.getBienSo())
                    .content("Xe " + vehicle.getBienSo() + " đã tiếp nhận. Vui lòng tiến hành chẩn đoán.")
                    .type("INFO")
                    .link("/mechanic/jobs")
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
    public java.util.Optional<com.gara.dto.ReceptionDetailDTO> getReceptionById(Integer id) {
        return receptionRepository.findByIdWithDetails(id).map(r -> {
            var builder = com.gara.dto.ReceptionDetailDTO.builder()
                    .id(r.getId())
                    .ngayGio(r.getNgayGio())
                    .mucXang(r.getMucXang())
                    .tinhTrangVoXe(r.getTinhTrangVoXe())
                    .yeuCauSoBo(r.getYeuCauSoBo())
                    .hinhAnh(r.getHinhAnh())
                    .odo(r.getOdo());

            if (r.getXe() != null) {
                builder.bienSo(r.getXe().getBienSo())
                        .nhanHieu(r.getXe().getNhanHieu())
                        .model(r.getXe().getModel())
                        .soKhung(r.getXe().getSoKhung())
                        .soMay(r.getXe().getSoMay());

                if (r.getXe().getKhachHang() != null) {
                    builder.tenKhach(r.getXe().getKhachHang().getHoTen())
                            .sdtKhach(r.getXe().getKhachHang().getSoDienThoai())
                            .diaChiKhach(r.getXe().getKhachHang().getDiaChi())
                            .emailKhach(r.getXe().getKhachHang().getEmail());
                }
            }

            if (r.getDonHangSuaChua() != null) {
                builder.orderId(r.getDonHangSuaChua().getId())
                        .orderStatus(r.getDonHangSuaChua().getTrangThai() != null ? r.getDonHangSuaChua().getTrangThai().name() : null);
            }

            return builder.build();
        });
    }

    private String sanitizeHtml(String input) {
        if (input == null) return null;
        // Basic escaping to prevent script injection in common fields
        return input.replace("<", "&lt;").replace(">", "&gt;")
                    .replace("\"", "&quot;").replace("'", "&#39;");
    }
}
