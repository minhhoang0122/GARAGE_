package com.gara.modules.public_api.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gara.entity.Customer;
import com.gara.entity.Role;
import com.gara.entity.User;
import com.gara.modules.auth.entity.VerificationCode;
import com.gara.modules.auth.repository.RoleRepository;
import com.gara.modules.auth.repository.UserRepository;
import com.gara.modules.auth.repository.VerificationCodeRepository;
import com.gara.modules.customer.repository.CustomerRepository;
import com.gara.modules.support.service.EmailService;
import com.gara.modules.public_api.dto.CustomerRegisterDTO;
import com.gara.modules.public_api.dto.VerifyRegistrationDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
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
    private final VerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(CustomerAuthController.class);

    public CustomerAuthController(UserRepository userRepository,
            CustomerRepository customerRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            VerificationCodeRepository verificationCodeRepository,
            EmailService emailService,
            ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.verificationCodeRepository = verificationCodeRepository;
        this.emailService = emailService;
        this.objectMapper = objectMapper;
    }

    /**
     * Customer self-registration.
     * 3 scenarios:
     * 1. Phone already has User account -> reject (ask to login)
     * 2. Phone exists in Customer table but no User -> create User, link to existing Customer
     * 3. Brand new phone -> create both User and Customer
     */
    /**
     * Step 1: Request Registration.
     * Validates data, generates OTP, and sends email.
     */
    @Transactional
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody CustomerRegisterDTO dto) {
        String phone = dto.phone().trim();
        String email = dto.email().trim();

        if (email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email là bắt buộc để nhận mã xác thực."));
        }

        // Check if User already exists with phone or email
        if (userRepository.findByPhone(phone).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Số điện thoại này đã được đăng ký."));
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));

        try {
            // Delete old codes for this email
            verificationCodeRepository.deleteByEmail(email);

            // Store registration data temporarily as JSON
            String jsonData = objectMapper.writeValueAsString(dto);

            VerificationCode vCode = VerificationCode.builder()
                    .email(email)
                    .code(otp)
                    .registrationData(jsonData)
                    .expiryDate(LocalDateTime.now().plusMinutes(15)) // 15 mins expiry
                    .build();
            verificationCodeRepository.save(vCode);

            // LOG OTP to console for development
            logger.info("========================================");
            logger.info("REGISTRATION OTP: {} for EMAIL: {}", otp, email);
            logger.info("========================================");

            // Send Email
            emailService.sendHtml(email, "Mã xác thực đăng ký - Gara Master", 
                "<h3>Chào mừng bạn đến với Gara Master!</h3>" +
                "<p>Mã xác thực của bạn là: <strong style='font-size: 20px; color: #4F46E5;'>" + otp + "</strong></p>" +
                "<p>Mã này có hiệu lực trong 15 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>");

            return ResponseEntity.ok(Map.of("success", true, "message", "Mã xác thực đã được gửi đến email của bạn."));
        } catch (JsonProcessingException e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Lỗi xử lý dữ liệu."));
        }
    }

    /**
     * Step 2: Verify OTP and finalize registration.
     */
    @Transactional
    @PostMapping("/verify-registration")
    public ResponseEntity<?> verifyRegistration(@Valid @RequestBody VerifyRegistrationDTO verifyDto) {
        VerificationCode vCode = verificationCodeRepository.findByEmailAndCode(verifyDto.email(), verifyDto.code())
                .orElse(null);

        if (vCode == null || vCode.isExpired()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Mã xác thực không đúng hoặc đã hết hạn."));
        }

        try {
            // Restore DTO from JSON
            CustomerRegisterDTO dto = objectMapper.readValue(vCode.getRegistrationData(), CustomerRegisterDTO.class);
            String phone = dto.phone().trim();

            // Perform actual registration (Original Logic)
            Role customerRole = roleRepository.findByName("KHACH_HANG")
                    .orElseGet(() -> {
                        Role r = new Role();
                        r.setName("KHACH_HANG");
                        r.setDescription("Khách hàng đăng ký trực tuyến");
                        return roleRepository.save(r);
                    });

            User newUser = new User();
            newUser.setUsername(phone);
            newUser.setFullName(dto.fullName().trim());
            newUser.setPhone(phone);
            newUser.setEmail(dto.email());
            newUser.setPasswordHash(passwordEncoder.encode(dto.password()));
            newUser.setIsActive(true);
            newUser.setRoles(new java.util.HashSet<>(Set.of(customerRole)));
            userRepository.save(newUser);

            Customer existingCustomer = customerRepository.findByPhone(phone).orElse(null);
            if (existingCustomer != null) {
                existingCustomer.setUserId(newUser.getId());
                existingCustomer.setEmail(dto.email());
                customerRepository.save(existingCustomer);
            } else {
                Customer newCustomer = Customer.builder()
                        .fullName(dto.fullName().trim())
                        .phone(phone)
                        .email(dto.email())
                        .address(dto.address())
                        .userId(newUser.getId())
                        .build();
                customerRepository.save(newCustomer);
            }

            // Cleanup
            verificationCodeRepository.delete(vCode);

            return ResponseEntity.ok(Map.of("success", true, "message", "Xác thực thành công! Tài khoản của bạn đã sẵn sàng."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Lỗi hoàn tất đăng ký."));
        }
    }
}
