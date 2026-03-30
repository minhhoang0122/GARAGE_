package com.gara.modules.service.controller;

import com.gara.dto.ReceptionFormData;
import com.gara.entity.User;
import com.gara.modules.identity.service.UserService;
import com.gara.modules.service.service.ReceptionService;
import com.gara.modules.service.service.TimelineService;
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
    private final TimelineService timelineService;

    public ReceptionController(ReceptionService receptionService, UserService userService, TimelineService timelineService) {
        this.receptionService = receptionService;
        this.userService = userService;
        this.timelineService = timelineService;
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

    @GetMapping("/{id}/timeline")
    public ResponseEntity<?> getTimeline(@PathVariable Integer id) {
        return ResponseEntity.ok(timelineService.getTimeline(id));
    }

    @PostMapping("/{id}/timeline/note")
    public ResponseEntity<?> addTimelineNote(@PathVariable Integer id,
                                           @RequestBody Map<String, Object> body,
                                           @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String content = (String) body.get("content");
            Boolean isInternal = (Boolean) body.getOrDefault("isInternal", false);

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Content is required"));
            }

            timelineService.recordEvent(id, user, "NOTE", content, null, null, isInternal);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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
