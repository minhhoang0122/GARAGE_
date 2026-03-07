package com.gara.modules.identity.service;

import com.gara.entity.User;
import com.gara.modules.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User createUser(User user) {
        if (userRepository.findByTenDangNhap(user.getTenDangNhap()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        user.setMatKhauHash(passwordEncoder.encode(user.getMatKhauHash()));
        user.setTrangThaiHoatDong(true);
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Integer id, User req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getHoTen() != null)
            user.setHoTen(req.getHoTen());
        if (req.getSoDienThoai() != null)
            user.setSoDienThoai(req.getSoDienThoai());

        // Cập nhật Roles nếu có
        if (req.getRoles() != null && !req.getRoles().isEmpty()) {
            user.setRoles(new java.util.HashSet<>(req.getRoles()));
        }

        // Update password if provided
        if (req.getMatKhauHash() != null && !req.getMatKhauHash().isEmpty()) {
            user.setMatKhauHash(passwordEncoder.encode(req.getMatKhauHash()));
        }

        return userRepository.save(user);
    }

    @Transactional
    public void toggleActive(Integer id) {
        User currentUser = getCurrentUser();
        if (currentUser != null && currentUser.getId().equals(id)) {
            throw new RuntimeException("Không thể tự khóa tài khoản của chính mình");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setTrangThaiHoatDong(!user.getTrangThaiHoatDong());
        userRepository.save(user);
    }

    public User getCurrentUser() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }

        if (principal instanceof String) {
            return userRepository.findByTenDangNhap((String) principal).orElse(null);
        }

        return null;
    }
}
