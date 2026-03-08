package com.gara.modules.identity.service;

import com.gara.dto.LoginRequest;
import com.gara.dto.LoginResponse;
import com.gara.entity.User;
import com.gara.entity.Role;
import com.gara.entity.Permission;
import com.gara.modules.auth.repository.UserRepository;
import com.gara.modules.auth.repository.RoleRepository;
import com.gara.modules.identity.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.HashSet;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final com.gara.modules.support.service.LoginAttemptService loginAttemptService;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
            PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
            com.gara.modules.support.service.LoginAttemptService loginAttemptService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.loginAttemptService = loginAttemptService;
    }

    public LoginResponse login(LoginRequest request) {
        String username = request.username();
        if (loginAttemptService.isBlocked(username)) {
            throw new RuntimeException("Tài khoản đã bị tạm khóa (15 phút) do đăng nhập sai quá nhiều lần");
        }

        User user = userRepository.findByTenDangNhap(username)
                .orElseThrow(() -> {
                    loginAttemptService.loginFailed(username);
                    return new RuntimeException("Tên đăng nhập không tồn tại");
                });

        if (!user.getTrangThaiHoatDong()) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }

        if (!passwordEncoder.matches(request.password(), user.getMatKhauHash())) {
            loginAttemptService.loginFailed(username);
            throw new RuntimeException("Mật khẩu không đúng");
        }

        loginAttemptService.loginSucceeded(username);

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        List<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getCode)
                .distinct()
                .collect(Collectors.toList());

        String token = jwtUtil.generateToken(user.getId(), user.getTenDangNhap(), roles, permissions);

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getTenDangNhap())
                .fullName(user.getHoTen())
                .roles(roles)
                .permissions(permissions)
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

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        List<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getCode)
                .distinct()
                .collect(Collectors.toList());

        String token = jwtUtil.generateToken(user.getId(), user.getTenDangNhap(), roles, permissions);

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getTenDangNhap())
                .fullName(user.getHoTen())
                .roles(roles)
                .permissions(permissions)
                .build();
    }

    public void seedDefaultUsers() {
        seedUser("admin", "Quản Trị Viên", "ADMIN");
        seedUser("sale1", "Nhân Viên Sale", "SALE");
        seedUser("tho1", "Thợ Chẩn Đoán", "THO_CHAN_DOAN");
        seedUser("tho2", "Thợ Sửa Chữa", "THO_SUA_CHUA");
        seedUser("kho1", "Thủ Kho", "KHO");
    }

    private void seedUser(String username, String fullName, String roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    return roleRepository.save(newRole);
                });

        var userOptional = userRepository.findByTenDangNhap(username);
        if (userOptional.isEmpty()) {
            User user = new User();
            user.setTenDangNhap(username);
            user.setHoTen(fullName);
            user.setRoles(new HashSet<>(Set.of(role)));
            user.setMatKhauHash(passwordEncoder.encode("123456"));
            user.setTrangThaiHoatDong(true);
            user.setSoDienThoai("0900000000");
            userRepository.save(user);
        } else {
            User user = userOptional.get();
            // Force reset password to ensure login works with '123456'
            user.setMatKhauHash(passwordEncoder.encode("123456"));
            if (user.getRoles().stream().noneMatch(r -> r.getName().equals(roleName))) {
                user.getRoles().add(role);
            }
            userRepository.save(user);
        }
    }
}
