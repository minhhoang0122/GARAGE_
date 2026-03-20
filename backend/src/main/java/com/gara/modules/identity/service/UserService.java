package com.gara.modules.identity.service;

import com.gara.dto.UserReqDTO;
import com.gara.entity.Role;
import com.gara.entity.User;
import com.gara.modules.auth.repository.RoleRepository;
import com.gara.modules.auth.repository.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @org.springframework.cache.annotation.Cacheable(value = "users_list")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getStaffOnly() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles() != null && u.getRoles().stream()
                        .anyMatch(r -> !r.getName().equals("KHACH_HANG")))
                .collect(java.util.stream.Collectors.toList());
    }

    public List<User> getCustomersOnly() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles() != null && u.getRoles().stream()
                        .anyMatch(r -> r.getName().equals("KHACH_HANG")))
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "users_list", allEntries = true)
    public User createUser(UserReqDTO req) {
        if (userRepository.findByTenDangNhap(req.getTenDangNhap()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if (req.getMatKhauHash() == null || req.getMatKhauHash().isBlank()) {
            throw new RuntimeException("Mật khẩu không được để trống khi tạo mới");
        }

        User user = new User();
        user.setTenDangNhap(req.getTenDangNhap());
        user.setHoTen(req.getHoTen());
        user.setSoDienThoai(req.getSoDienThoai());
        user.setMatKhauHash(passwordEncoder.encode(req.getMatKhauHash()));
        user.setTrangThaiHoatDong(true);

        Set<Role> roles = new HashSet<>();
        if (req.getRoleCodes() != null) {
            for (String code : req.getRoleCodes()) {
                roleRepository.findByName(code).ifPresent(roles::add);
            }
        }
        user.setRoles(roles);

        return userRepository.save(user);
    }

    @Transactional
    @CacheEvict(value = "users_list", allEntries = true)
    public User updateUser(Integer id, UserReqDTO req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getHoTen() != null)
            user.setHoTen(req.getHoTen());
        if (req.getSoDienThoai() != null)
            user.setSoDienThoai(req.getSoDienThoai());

        // Cập nhật Roles nếu có
        if (req.getRoleCodes() != null) {
            Set<Role> roles = new HashSet<>();
            for (String code : req.getRoleCodes()) {
                roleRepository.findByName(code).ifPresent(roles::add);
            }
            user.setRoles(roles);
        }

        // Update password if provided
        if (req.getMatKhauHash() != null && !req.getMatKhauHash().isEmpty()) {
            user.setMatKhauHash(passwordEncoder.encode(req.getMatKhauHash()));
        }

        return userRepository.save(user);
    }

    @Transactional
    @CacheEvict(value = "users_list", allEntries = true)
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

        if (principal instanceof Integer) {
            return userRepository.findById((Integer) principal).orElse(null);
        }

        return null;
    }
}
