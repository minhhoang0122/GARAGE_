package com.gara.modules.identity.controller;

import com.gara.dto.LoginRequest;
import com.gara.dto.LoginResponse;
import com.gara.entity.User;
import com.gara.entity.Role;
import com.gara.modules.identity.service.AuthService;
import com.gara.modules.identity.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getTenDangNhap(),
                "fullName", user.getHoTen(),
                "roles", user.getRoles().stream().map(Role::getName).toArray(),
                "permissions", user.getAllPermissions()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }

    @GetMapping("/reset-admin")
    public LoginResponse resetAdminPassword() {
        return authService.resetAdminPassword();
    }

    @GetMapping("/seed-users")
    public ResponseEntity<?> seedUsers() {
        authService.seedDefaultUsers();
        return ResponseEntity
                .ok(Map.of("message", "Đã khởi tạo các user mẫu: admin, sale1, tho1, tho2, kho1 (Pass: 123456)"));
    }
}
