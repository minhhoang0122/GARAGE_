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
    private final com.gara.modules.support.service.AsyncNotificationService asyncNotificationService;

    public BookingService(CustomerRepository customerRepository,
            VehicleRepository vehicleRepository,
            ReceptionRepository receptionRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            com.gara.modules.support.service.AsyncNotificationService asyncNotificationService) {
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
        this.receptionRepository = receptionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.asyncNotificationService = asyncNotificationService;
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
                    newCust.setFullName(dto.fullName());
                    newCust.setPhone(dto.phone());
                    newCust.setEmail(dto.email());
                    newCust.setAddress(dto.address());
                    return customerRepository.save(newCust);
                });

        // 2. Tìm hoặc tạo xe theo biển số (Bug 24 Fix: Prevents hijacking)
        Vehicle vehicle = vehicleRepository.findByLicensePlate(dto.licensePlate())
                .map(v -> {
                    // Verification: Plate must match requester Customer ORrequester Phone
                    if (!v.getCustomer().getId().equals(customer.getId())) {
                        throw new RuntimeException("Biển số xe này đã được đăng ký bởi khách hàng khác. " +
                                "Vui lòng kiểm tra lại hoặc liên hệ Gara để được hỗ trợ.");
                    }
                    return v;
                })
                .orElseGet(() -> {
                    Vehicle newVehicle = new Vehicle();
                    newVehicle.setLicensePlate(dto.licensePlate());
                    newVehicle.setModel(dto.model());
                    newVehicle.setBrand(dto.model() != null ? dto.model() : "Unknown");
                    newVehicle.setCustomer(customer);
                    return vehicleRepository.save(newVehicle);
                });

        // 3. Tạo phiếu Tiếp nhận (Dạng đặt lịch)
        Reception reception = new Reception();
        reception.setVehicle(vehicle);
        reception.setReceptionDate(LocalDateTime.now());
        reception.setReceptionist(defaultUser);

        StringBuilder noteBuilder = new StringBuilder();
        noteBuilder.append("ĐẶT LỊCH ONLINE: ").append(dto.notes());
        noteBuilder.append("\nNgày hẹn: ").append(dto.appointmentTime());

        // 4. Liên kết dịch vụ mong muốn (nếu có)
        if (dto.selectedServiceIds() != null && !dto.selectedServiceIds().isEmpty()) {
            noteBuilder.append("\n\nDịch vụ quan tâm:");
            for (Integer id : dto.selectedServiceIds()) {
                productRepository.findById(id).ifPresent(p -> {
                    noteBuilder.append("\n- ").append(p.getName());
                });
            }
        }

        reception.setPreliminaryRequest(noteBuilder.toString());
        reception.setShellStatus("Khách đặt online - Chưa kiểm tra");

        Reception saved = receptionRepository.save(reception);

        // Notify Sale/Admin (SSE)
        asyncNotificationService.pushAsync(com.gara.entity.Notification.builder()
                .role("SALE")
                .title("Lịch hẹn mới: " + dto.licensePlate())
                .content("Khách hàng " + dto.fullName() + " vừa đặt lịch online ngày " + dto.appointmentTime())
                .type("INFO")
                .link("/sale/bookings")
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build());

        return saved.getId();
    }
}
