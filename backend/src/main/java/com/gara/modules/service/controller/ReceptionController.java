package com.gara.modules.service.controller;

import com.gara.dto.ReceptionFormData;
import com.gara.entity.User;
import com.gara.modules.identity.service.UserService;
import com.gara.modules.service.service.ReceptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/reception")
public class ReceptionController {

    private final ReceptionService receptionService;
    private final UserService userService;

    public ReceptionController(ReceptionService receptionService, UserService userService) {
        this.receptionService = receptionService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getAllReceptions() {
        return ResponseEntity.ok(receptionService.getAllReceptions());
    }

    @GetMapping("/vehicle")
    public ResponseEntity<?> searchVehicle(@RequestParam String plate) {
        return ResponseEntity.ok(receptionService.searchVehicle(plate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReceptionById(@PathVariable Integer id) {
        return receptionService.getReceptionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createReception(@RequestBody @Valid ReceptionFormData request,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            Integer receptionId = receptionService.createReception(request, user);
            return ResponseEntity.ok(Map.of("success", true, "receptionId", receptionId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
