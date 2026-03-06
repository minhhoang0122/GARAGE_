package com.gara.modules.identity.service;

import com.gara.dto.LoginRequest;
import com.gara.dto.LoginResponse;
import com.gara.entity.User;
import com.gara.modules.auth.repository.UserRepository;
import com.gara.modules.identity.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByTenDangNhap(request.username())
                .orElseThrow(() -> new RuntimeException("Tên đăng nhập không tồn tại"));

        if (!user.getTrangThaiHoatDong()) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }

        if (!passwordEncoder.matches(request.password(), user.getMatKhauHash())) {
            throw new RuntimeException("Mật khẩu không đúng");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getTenDangNhap(), user.getVaiTro());

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getTenDangNhap())
                .fullName(user.getHoTen())
                .role(user.getVaiTro())
                .build();
    }

    public User getCurrentUser(String token) {
        if (token == null || !jwtUtil.isTokenValid(token)) {
            return null;
        }
        Integer userId = jwtUtil.extractUserId(token);
        return userRepository.findById(userId).orElse(null);
    }

    public LoginResponse resetAdminPassword() {
        User user = userRepository.findByTenDangNhap("admin")
                .orElseThrow(() -> new RuntimeException("User admin not found"));

        user.setMatKhauHash(passwordEncoder.encode("123456"));
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getTenDangNhap(), user.getVaiTro());

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getTenDangNhap())
                .fullName(user.getHoTen())
                .role(user.getVaiTro())
                .build();
    }

    public void seedDefaultUsers() {
        seedUser("admin", "Quản Trị Viên", "ADMIN");
        seedUser("sale1", "Nhân Viên Sale", "SALE");
        seedUser("tho1", "Thợ Chẩn Đoán", "THO_CHAN_DOAN");
        seedUser("tho2", "Thợ Sửa Chữa", "THO_SUA_CHUA");
        seedUser("kho1", "Thủ Kho", "KHO");
    }

    private void seedUser(String username, String fullName, String role) {
        var userOptional = userRepository.findByTenDangNhap(username);
        if (userOptional.isEmpty()) {
            User user = new User();
            user.setTenDangNhap(username);
            user.setHoTen(fullName);
            user.setVaiTro(role);
            user.setMatKhauHash(passwordEncoder.encode("123456"));
            user.setTrangThaiHoatDong(true);
            user.setSoDienThoai("0900000000");
            userRepository.save(user);
        } else {
            // Update role if exists (fix for existing users with wrong role)
            User user = userOptional.get();
            if (!user.getVaiTro().equals(role)) {
                user.setVaiTro(role);
                userRepository.save(user);
            }
        }
    }
}
