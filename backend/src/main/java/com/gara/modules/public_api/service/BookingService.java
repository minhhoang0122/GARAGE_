package com.gara.modules.public_api.service;

import com.gara.entity.*;
import com.gara.modules.public_api.dto.PublicBookingDTO;
import com.gara.modules.customer.repository.CustomerRepository;
import com.gara.modules.customer.repository.VehicleRepository;
import com.gara.modules.reception.repository.ReceptionRepository;
import com.gara.modules.inventory.repository.ProductRepository;
import com.gara.modules.auth.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class BookingService {

    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final ReceptionRepository receptionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public BookingService(CustomerRepository customerRepository,
            VehicleRepository vehicleRepository,
            ReceptionRepository receptionRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
        this.receptionRepository = receptionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Integer createBooking(PublicBookingDTO dto) {
        // 0. Tìm người nhận mặc định (Admin đầu tiên)
        User defaultUser = userRepository.findAll().stream()
                .filter(u -> u.isAdmin())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Hệ thống chưa có Admin để tiếp nhận lịch hẹn."));

        // 1. Tìm hoặc tạo khách hàng (Bắt buộc userId)
        if (dto.userId() == null) {
            throw new RuntimeException("Bạn cần đăng nhập bằng tài khoản khách hàng để thực hiện chức năng này.");
        }

        Customer customer = customerRepository.findByUserId(dto.userId())
                .orElseGet(() -> {
                    // Nếu đã có SĐT này dưới dạng Guest, có thể cân nhắc link. 
                    // Nhưng ở đây ưu tiên tạo mới và link userId.
                    Customer newCust = new Customer();
                    newCust.setUserId(dto.userId());
                    newCust.setHoTen(dto.hoTen());
                    newCust.setSoDienThoai(dto.soDienThoai());
                    newCust.setEmail(dto.email());
                    newCust.setDiaChi(dto.diaChi());
                    return customerRepository.save(newCust);
                });

        // 2. Tìm hoặc tạo xe theo biển số (Bug 24 Fix: Prevents hijacking)
        Vehicle vehicle = vehicleRepository.findByBienSo(dto.bienSoXe())
                .map(v -> {
                    // Verification: Plate must match requester Customer ORrequester Phone
                    if (!v.getKhachHang().getId().equals(customer.getId())) {
                        throw new RuntimeException("Biển số xe này đã được đăng ký bởi khách hàng khác. " +
                                "Vui lòng kiểm tra lại hoặc liên hệ Gara để được hỗ trợ.");
                    }
                    return v;
                })
                .orElseGet(() -> {
                    Vehicle newVehicle = new Vehicle();
                    newVehicle.setBienSo(dto.bienSoXe());
                    newVehicle.setModel(dto.modelXe());
                    newVehicle.setNhanHieu(dto.modelXe() != null ? dto.modelXe() : "Unknown");
                    newVehicle.setKhachHang(customer);
                    return vehicleRepository.save(newVehicle);
                });

        // 3. Tạo phiếu Tiếp nhận (Dạng đặt lịch)
        Reception reception = new Reception();
        reception.setXe(vehicle);
        reception.setNgayGio(LocalDateTime.now());
        reception.setNguoiTiepNhan(defaultUser);

        StringBuilder noteBuilder = new StringBuilder();
        noteBuilder.append("ĐẶT LỊCH ONLINE: ").append(dto.ghiChu());
        noteBuilder.append("\nNgày hẹn: ").append(dto.ngayHen());

        // 4. Liên kết dịch vụ mong muốn (nếu có)
        if (dto.selectedServiceIds() != null && !dto.selectedServiceIds().isEmpty()) {
            noteBuilder.append("\n\nDịch vụ quan tâm:");
            for (Integer id : dto.selectedServiceIds()) {
                productRepository.findById(id).ifPresent(p -> {
                    noteBuilder.append("\n- ").append(p.getTenHang());
                });
            }
        }

        reception.setYeuCauSoBo(noteBuilder.toString());
        reception.setTinhTrangVoXe("Khách đặt online - Chưa kiểm tra");

        Reception saved = receptionRepository.save(reception);
        return saved.getId();
    }
}
