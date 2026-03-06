package com.gara.modules.system.controller;

import com.gara.entity.User;
import com.gara.modules.auth.repository.UserRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@Profile("dev")
public class TestController {

    private final UserRepository userRepository;

    public TestController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Spring Boot Backend is running!");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}
