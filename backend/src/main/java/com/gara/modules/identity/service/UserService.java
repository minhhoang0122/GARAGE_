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
    private final com.gara.modules.support.service.SseService sseService;

    public UserService(UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            com.gara.modules.support.service.SseService sseService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.sseService = sseService;
    }

    @org.springframework.cache.annotation.Cacheable(value = "users_list")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getStaffOnly() {
        return userRepository.findAll().stream()
                .filter(u -> u.getUserType() == com.gara.entity.enums.UserType.STAFF)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<User> getCustomersOnly() {
        return userRepository.findAll().stream()
                .filter(u -> u.getUserType() == com.gara.entity.enums.UserType.CUSTOMER)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "users_list", allEntries = true)
    public User createUser(UserReqDTO req) {
        if (userRepository.findByUsername(req.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new RuntimeException("Mật khẩu không được để trống khi tạo mới");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setFullName(req.getFullName());
        user.setAvatar(req.getAvatar());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setIsActive(true);

        Set<Role> roles = new HashSet<>();
        if (req.getRoleCodes() != null) {
            for (String code : req.getRoleCodes()) {
                roleRepository.findByName(code).ifPresent(roles::add);
            }
        }
        user.setRoles(roles);

        // Tự động gán UserType dựa trên Roles
        if (roles.stream().anyMatch(r -> r.getName().equals("KHACH_HANG"))) {
            user.setUserType(com.gara.entity.enums.UserType.CUSTOMER);
        } else {
            user.setUserType(com.gara.entity.enums.UserType.STAFF);
        }

        return userRepository.save(user);
    }

    @Transactional
    @CacheEvict(value = "users_list", allEntries = true)
    public User updateUser(Integer id, UserReqDTO req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getFullName() != null)
            user.setFullName(req.getFullName());
        if (req.getPhone() != null)
            user.setPhone(req.getPhone());
        if (req.getAvatar() != null)
            user.setAvatar(req.getAvatar());
        if (req.getEmail() != null)
            user.setEmail(req.getEmail());

        // Cập nhật Roles nếu có
        if (req.getRoleCodes() != null) {
            Set<Role> roles = new HashSet<>();
            for (String code : req.getRoleCodes()) {
                roleRepository.findByName(code).ifPresent(roles::add);
            }
            user.setRoles(roles);
        }

        // Update password if provided
        if (req.getPassword() != null && !req.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        }

        User savedUser = userRepository.save(user);
        
        // Phát sự kiện bảo mật (để logout/refresh token nếu cần)
        sseService.send(savedUser.getId(), "user_security_updated", java.util.Map.of("userId", savedUser.getId()));
        
        // Phát sự kiện cập nhật thông tin (để đồng bộ UI: avatar, tên)
        sseService.send(savedUser.getId(), "user_updated", java.util.Map.of(
            "userId", savedUser.getId(),
            "avatar", savedUser.getAvatar() != null ? savedUser.getAvatar() : "",
            "fullName", savedUser.getFullName()
        ));
        
        return savedUser;
    }

    @Transactional
    @CacheEvict(value = "users_list", allEntries = true)
    public void updateAvatar(Integer id, String avatarUrl) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setAvatar(avatarUrl);
        userRepository.save(user);
        
        // Gửi sự kiện SSE để đồng bộ hóa giao diện trên toàn hệ thống
        sseService.send(id, "user_updated", java.util.Map.of(
            "userId", id,
            "avatar", avatarUrl,
            "fullName", user.getFullName()
        ));
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
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
        sseService.send(id, "user_security_updated", java.util.Map.of("userId", id));
    }

    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
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
            return userRepository.findByUsername((String) principal).orElse(null);
        }

        if (principal instanceof Integer) {
            return userRepository.findById((Integer) principal).orElse(null);
        }

        return null;
    }
}
