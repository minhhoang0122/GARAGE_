package com.gara.modules.service.controller;

import com.gara.dto.*;
import com.gara.entity.*;
import com.gara.modules.service.service.MechanicService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mechanic")
public class MechanicController {

    private final MechanicService mechanicService;

    public MechanicController(MechanicService mechanicService) {
        this.mechanicService = mechanicService;
    }

    @GetMapping("/jobs")
    public ResponseEntity<?> getAssignedJobs(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(mechanicService.getAssignedJobs(user.getId()));
    }

    @GetMapping("/jobs/history")
    public ResponseEntity<?> getRepairHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(mechanicService.getRepairHistory(user.getId()));
    }

    @PostMapping("/jobs/{id}/claim")
    public ResponseEntity<?> claimJob(@PathVariable Integer id, @AuthenticationPrincipal User user) {
        try {
            mechanicService.claimJob(id, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/jobs/{id}/unclaim")
    public ResponseEntity<?> unclaimJob(@PathVariable Integer id) {
        try {
            mechanicService.unclaimJob(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/items/{itemId}/toggle")
    public ResponseEntity<?> toggleItemCompletion(@PathVariable Integer itemId,
            @AuthenticationPrincipal User user) {
        try {
            mechanicService.toggleItemCompletion(itemId, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(mechanicService.getDashboardStats());
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<?> getJobDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(mechanicService.getJobDetails(id));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeProposedItem(@PathVariable Integer itemId) {
        try {
            mechanicService.removeProposedItem(itemId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/inspect/{id}")
    public ResponseEntity<?> getReceptionDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(mechanicService.getReceptionDetail(id));
    }

    @GetMapping("/inspect")
    public ResponseEntity<?> getReceptionsToInspect() {
        return ResponseEntity.ok(mechanicService.getReceptionsToInspect());
    }

    @GetMapping("/inspect/history")
    public ResponseEntity<?> getInspectedHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(mechanicService.getInspectedHistory(user.getId()));
    }

    @PostMapping("/inspect/{id}/proposal")
    public ResponseEntity<?> submitProposal(@PathVariable Integer id, @RequestBody List<ProposalItemDTO> items,
            @AuthenticationPrincipal User user) {
        try {
            mechanicService.submitProposal(id, items, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/jobs/{id}/report-issue")
    public ResponseEntity<?> reportIssue(@PathVariable Integer id, @RequestBody List<ProposalItemDTO> items,
            @AuthenticationPrincipal User user) {
        try {
            mechanicService.reportTechnicalIssue(id, items, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/jobs/{id}/complete")
    public ResponseEntity<?> completeJob(@PathVariable Integer id) {
        try {
            mechanicService.completeJob(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/jobs/{id}/qc-pass")
    public ResponseEntity<?> qcPass(@PathVariable Integer id, @AuthenticationPrincipal User user) {
        try {
            mechanicService.qcPass(id, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/jobs/{id}/qc-fail")
    public ResponseEntity<?> qcFail(@PathVariable Integer id, @AuthenticationPrincipal User user) {
        try {
            mechanicService.qcFail(id, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // Party / Multi-mechanic Endpoints

    @PostMapping("/items/{itemId}/join")
    public ResponseEntity<?> requestJoinTask(@PathVariable Integer itemId,
            @AuthenticationPrincipal User user) {
        try {
            mechanicService.requestJoinTask(itemId, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/assignments/{id}/approve")
    public ResponseEntity<?> approveJoinTask(@PathVariable Integer id,
            @AuthenticationPrincipal User user) {
        try {
            mechanicService.approveJoinTask(id, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/items/{itemId}/distribution")
    public ResponseEntity<?> updateTaskDistribution(@PathVariable Integer itemId,
            @RequestBody Map<Integer, java.math.BigDecimal> distribution,
            @AuthenticationPrincipal User user) {
        try {
            mechanicService.updateTaskDistribution(itemId, distribution, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PutMapping("/items/{itemId}/max-mechanics")
    public ResponseEntity<?> updateItemMaxMechanics(
            @PathVariable Integer itemId,
            @RequestParam Integer limit,
            @AuthenticationPrincipal User user) {
        mechanicService.updateItemMaxMechanics(itemId, limit, user.getId());
        return ResponseEntity.ok(Map.of("success", true, "message", "Updated max mechanics limit."));
    }

    @PutMapping("/items/{itemId}/max-mechanics-v2")
    public ResponseEntity<?> updateItemMaxMechanicsV2(
            @PathVariable Integer itemId,
            @RequestParam Integer limit,
            @org.springframework.security.core.annotation.AuthenticationPrincipal User user) {
        mechanicService.updateItemMaxMechanics(itemId, limit, user.getId());
        return ResponseEntity.ok(Map.of("success", true, "message", "Updated max mechanics limit."));
    }
}
