package com.gara.modules.identity.controller;

import com.gara.dto.LoginRequest;
import com.gara.dto.LoginResponse;
import com.gara.entity.User;
import com.gara.modules.identity.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
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
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));
        }

        String token = authHeader.substring(7);
        User user = authService.getCurrentUser(token);

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Token không hợp lệ"));
        }

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getTenDangNhap(),
                "fullName", user.getHoTen(),
                "roles",
                user.getRoles().stream().map(com.gara.entity.Role::getName)
                        .collect(java.util.stream.Collectors.toList()),
                "permissions", user.getRoles().stream()
                        .flatMap(role -> role.getPermissions().stream())
                        .map(com.gara.entity.Permission::getCode)
                        .distinct()
                        .collect(java.util.stream.Collectors.toList())));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // JWT is stateless, client just needs to remove token
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
