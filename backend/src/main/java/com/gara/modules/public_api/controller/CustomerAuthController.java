package com.gara.modules.public_api.controller;

import com.gara.entity.Customer;
import com.gara.entity.Role;
import com.gara.entity.User;
import com.gara.modules.auth.repository.RoleRepository;
import com.gara.modules.auth.repository.UserRepository;
import com.gara.modules.customer.repository.CustomerRepository;
import com.gara.modules.public_api.dto.CustomerRegisterDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

/**
 * Public endpoints for customer self-service authentication.
 * No JWT required - these are public APIs.
 */
@RestController
@RequestMapping("/api/public/customer")
public class CustomerAuthController {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerAuthController(UserRepository userRepository,
            CustomerRepository customerRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Customer self-registration.
     * 3 scenarios:
     * 1. Phone already has User account -> reject (ask to login)
     * 2. Phone exists in Customer table but no User -> create User, link to existing Customer
     * 3. Brand new phone -> create both User and Customer
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody CustomerRegisterDTO dto) {
        String phone = dto.soDienThoai().trim();

        // Case 1: Phone already registered as a User
        if (userRepository.findBySoDienThoai(phone).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Số điện thoại này đã được đăng ký. Vui lòng đăng nhập."));
        }

        // Get or create KHACH_HANG role
        Role customerRole = roleRepository.findByName("KHACH_HANG")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("KHACH_HANG");
                    r.setDescription("Khách hàng đăng ký trực tuyến");
                    return roleRepository.save(r);
                });

        // Create User account (username = phone number for customers)
        User newUser = new User();
        newUser.setTenDangNhap(phone);
        newUser.setHoTen(dto.hoTen().trim());
        newUser.setSoDienThoai(phone);
        newUser.setEmail(dto.email());
        newUser.setMatKhauHash(passwordEncoder.encode(dto.matKhau()));
        newUser.setTrangThaiHoatDong(true);
        newUser.setRoles(new java.util.HashSet<>(Set.of(customerRole)));
        userRepository.save(newUser);

        // Case 2: Link to existing Customer record (from previous garage visits)
        Customer existingCustomer = customerRepository.findBySoDienThoai(phone).orElse(null);
        if (existingCustomer != null) {
            existingCustomer.setUserId(newUser.getId());
            if (dto.email() != null && existingCustomer.getEmail() == null) {
                existingCustomer.setEmail(dto.email());
            }
            customerRepository.save(existingCustomer);
        } else {
            // Case 3: Create new Customer record
            Customer newCustomer = Customer.builder()
                    .hoTen(dto.hoTen().trim())
                    .soDienThoai(phone)
                    .email(dto.email())
                    .diaChi(dto.diaChi())
                    .userId(newUser.getId())
                    .build();
            customerRepository.save(newCustomer);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đăng ký thành công! Vui lòng đăng nhập."));
    }
}
