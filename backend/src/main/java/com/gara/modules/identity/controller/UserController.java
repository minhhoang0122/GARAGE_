package com.gara.modules.identity.controller;

import com.gara.dto.UserReqDTO;
import com.gara.modules.identity.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            var users = userService.getAllUsers().stream()
                    .map(this::mapUserToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching users", e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserReqDTO req) {
        return ResponseEntity.ok(mapUserToDTO(userService.createUser(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody UserReqDTO req) {
        return ResponseEntity.ok(mapUserToDTO(userService.updateUser(id, req)));
    }

    @PostMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable Integer id) {
        userService.toggleActive(id);
        return ResponseEntity.ok().build();
    }

    private Map<String, Object> mapUserToDTO(com.gara.entity.User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("hoTen", user.getHoTen());
        dto.put("soDienThoai", user.getSoDienThoai());
        dto.put("tenDangNhap", user.getTenDangNhap());
        dto.put("trangThaiHoatDong", user.getTrangThaiHoatDong());

        if (user.getRoles() != null) {
            dto.put("roles", user.getRoles().stream().map(r -> {
                Map<String, Object> roleMap = new HashMap<>();
                roleMap.put("name", r.getName());
                roleMap.put("description", r.getDescription());
                // Strictly DO NOT map permissions to prevent Jackson loop
                return roleMap;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
