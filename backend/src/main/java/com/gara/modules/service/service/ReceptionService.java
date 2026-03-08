package com.gara.modules.service.service;

import com.gara.dto.ReceptionFormData;
import com.gara.dto.VehicleSearchResultDTO;
import com.gara.entity.*;
import com.gara.modules.reception.repository.*;
import com.gara.modules.service.repository.*;
import com.gara.modules.customer.repository.*;
import com.gara.modules.notification.repository.*;
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
    private final NotificationRepository notificationRepository;

    public ReceptionService(VehicleRepository vehicleRepository,
            CustomerRepository customerRepository,
            ReceptionRepository receptionRepository,
            RepairOrderRepository orderRepository,
            NotificationRepository notificationRepository) {
        this.vehicleRepository = vehicleRepository;
        this.customerRepository = customerRepository;
        this.receptionRepository = receptionRepository;
        this.orderRepository = orderRepository;
        this.notificationRepository = notificationRepository;
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
                .customer(vehicle.getKhachHang())
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
        // 1. Find or Create Vehicle & Customer
        Vehicle vehicle = vehicleRepository.findByBienSo(data.bienSo()).orElse(null);

        if (vehicle == null) {
            // Create Customer
            Customer customer = new Customer();
            customer.setHoTen(data.tenKhach());
            customer.setSoDienThoai(data.sdtKhach());
            customer.setDiaChi(data.diaChiKhach());
            customer.setEmail(data.emailKhach());
            customer = customerRepository.save(customer);

            // Create Vehicle
            vehicle = new Vehicle();
            vehicle.setBienSo(data.bienSo());
            vehicle.setKhachHang(customer);
            vehicle.setNhanHieu(data.nhanHieu());
            vehicle.setModel(data.model());
            vehicle.setSoKhung(data.soKhung());
            vehicle.setSoMay(data.soMay());
            vehicle.setOdoHienTai(data.odo());
            vehicleRepository.save(vehicle);
        } else {
            if (data.odo() > vehicle.getOdoHienTai()) {
                vehicle.setOdoHienTai(data.odo());
                vehicleRepository.save(vehicle);
            }
            // Update Email if provided and currently empty
            if (data.emailKhach() != null && !data.emailKhach().isEmpty()) {
                Customer cust = vehicle.getKhachHang();
                if (cust.getEmail() == null || cust.getEmail().isEmpty()) {
                    cust.setEmail(data.emailKhach());
                    customerRepository.save(cust);
                }
            }
        }

        // 2. Create Reception (PhieuTiepNhan)
        Reception reception = new Reception();
        reception.setXe(vehicle);
        reception.setNguoiTiepNhan(user);
        reception.setMucXang(BigDecimal.valueOf(data.mucXang()));
        reception.setTinhTrangVoXe(data.tinhTrangVo());
        reception.setYeuCauSoBo(data.yeuCauKhach());
        reception.setHinhAnh(data.hinhAnh());
        reception.setOdo(data.odo());
        reception.setNgayGio(LocalDateTime.now());
        receptionRepository.save(reception);

        // 3. Create RepairOrder (DonHangSuaChua) - Status: TIEP_NHAN
        RepairOrder order = new RepairOrder();
        order.setPhieuTiepNhan(reception);
        order.setNguoiPhuTrach(user); // Sale Owner
        order.setTrangThai(OrderStatus.TIEP_NHAN);
        order.setTongTienHang(BigDecimal.ZERO);
        order.setTongTienCong(BigDecimal.ZERO);
        order.setTongCong(BigDecimal.ZERO);
        order.setChietKhauTong(BigDecimal.ZERO);
        order.setThueVAT(BigDecimal.ZERO);
        order.setTienCoc(BigDecimal.ZERO);
        orderRepository.save(order);

        // 4. Notify Diagnosis Mechanic
        Notification notif = Notification.builder()
                .role("THO_CHAN_DOAN")
                .title("Xe mới tiếp nhận: " + vehicle.getBienSo())
                .content("Xe " + vehicle.getBienSo() + " đã được tiếp nhận. Yêu cầu chẩn đoán.")
                .type("INFO")
                .link("/mechanic/inspect/" + reception.getId())
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build();
        notificationRepository.save(notif);

        return reception.getId(); // Or return OrderID? FE expects receptionId & orderId
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
    public Optional<Reception> getReceptionById(Integer id) {
        return receptionRepository.findByIdWithDetails(id);
    }
}
