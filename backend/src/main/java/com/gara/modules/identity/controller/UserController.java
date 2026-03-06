package com.gara.modules.identity.controller;

import com.gara.entity.User;
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
    public ResponseEntity<?> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @PostMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable Integer id) {
        userService.toggleActive(id);
        return ResponseEntity.ok().build();
    }
}
