package com.gara.modules.identity.controller;

import com.gara.dto.UserReqDTO;
import com.gara.modules.identity.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            var users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching users", e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserReqDTO req) {
        return ResponseEntity.ok(userService.createUser(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody UserReqDTO req) {
        return ResponseEntity.ok(userService.updateUser(id, req));
    }

    @PostMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable Integer id) {
        userService.toggleActive(id);
        return ResponseEntity.ok().build();
    }
}
