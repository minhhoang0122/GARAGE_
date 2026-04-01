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
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final com.gara.modules.support.service.RealtimeService realtimeService;

    public UserController(UserService userService, com.gara.modules.support.service.RealtimeService realtimeService) {
        this.userService = userService;
        this.realtimeService = realtimeService;
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

    @GetMapping("/staff")
    public ResponseEntity<?> getStaffOnly() {
        try {
            var users = userService.getStaffOnly().stream()
                    .map(this::mapUserToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching staff", e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/customers")
    public ResponseEntity<?> getCustomersOnly() {
        try {
            var users = userService.getCustomersOnly().stream()
                    .map(this::mapUserToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching customer accounts", e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        try {
            var user = userService.getUserById(id);
            return ResponseEntity.ok(mapUserToDTO(user));
        } catch (Exception e) {
            log.error("Error fetching user by id: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/online-status")
    public ResponseEntity<?> getOnlineStatus() {
        return ResponseEntity.ok(Map.of(
            "onlineUsers", realtimeService.getOnlineUserIds()
        ));
    }

    @GetMapping("/online-details")
    public ResponseEntity<?> getOnlineDetails() {
        var onlineIds = realtimeService.getOnlineUserIds();
        var details = userService.getAllUsers().stream()
                .filter(u -> onlineIds.contains(u.getId()))
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("fullName", u.getFullName());
                    map.put("avatar", u.getAvatar());
                    map.put("vaiTro", u.getRoles() != null && !u.getRoles().isEmpty()
                            ? u.getRoles().iterator().next().getName()
                            : "N/A");
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(details);
    }



    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody @Valid UserReqDTO req) {
        return ResponseEntity.ok(mapUserToDTO(userService.createUser(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody @Valid UserReqDTO req) {
        return ResponseEntity.ok(mapUserToDTO(userService.updateUser(id, req)));
    }

    @PostMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable Integer id) {
        userService.toggleActive(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/avatar")
    public ResponseEntity<?> updateAvatar(@PathVariable Integer id, @RequestBody Map<String, String> req) {
        String avatarUrl = req.get("avatar");
        userService.updateAvatar(id, avatarUrl);
        return ResponseEntity.ok().build();
    }

    private Map<String, Object> mapUserToDTO(com.gara.entity.User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("fullName", user.getFullName());
        dto.put("avatar", user.getAvatar());
        dto.put("email", user.getEmail());
        dto.put("createdAt", user.getCreatedAt());
        dto.put("phone", user.getPhone());
        dto.put("username", user.getUsername());
        dto.put("isActive", user.getIsActive());
        dto.put("userType", user.getUserType() != null ? user.getUserType().name() : null);
        dto.put("vaiTro", user.getRoles() != null && !user.getRoles().isEmpty()
                ? user.getRoles().iterator().next().getName()
                : "N/A");

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
