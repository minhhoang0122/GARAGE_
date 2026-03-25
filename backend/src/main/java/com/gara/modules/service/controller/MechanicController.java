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

    private Integer extractUserId(Object principal) {
        if (principal instanceof Integer) {
            return (Integer) principal;
        } else if (principal instanceof User) {
            return ((User) principal).getId();
        } else if (principal != null) {
            try {
                return Integer.parseInt(principal.toString());
            } catch (NumberFormatException ignored) {}
        }
        throw new RuntimeException("Unauthorized: Không tìm thấy thông tin định danh người dùng.");
    }

    @GetMapping("/jobs")
    public ResponseEntity<?> getAssignedJobs(@AuthenticationPrincipal Object principal) {
        return ResponseEntity.ok(mechanicService.getAssignedJobs(extractUserId(principal)));
    }

    @GetMapping("/jobs/history")
    public ResponseEntity<?> getRepairHistory(@AuthenticationPrincipal Object principal) {
        return ResponseEntity.ok(mechanicService.getRepairHistory(extractUserId(principal)));
    }

    @PostMapping("/jobs/{id}/claim")
    public ResponseEntity<?> claimJob(@PathVariable Integer id, @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.claimJob(id, extractUserId(principal));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/jobs/{id}/unclaim")
    public ResponseEntity<?> unclaimJob(@PathVariable Integer id, @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.unclaimJob(id, extractUserId(principal));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/jobs/{id}/submit-assignments")
    public ResponseEntity<?> submitAssignments(@PathVariable Integer id, @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.submitAssignments(id, extractUserId(principal));
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã xác nhận phân công. Thợ sẽ nhận thông báo."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/jobs/{id}/assign")
    public ResponseEntity<?> assignJob(@PathVariable Integer id,
            @RequestParam Integer mechanicId,
            @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.assignJob(id, mechanicId, extractUserId(principal));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/items/{itemId}/assign-direct")
    public ResponseEntity<?> adminAssignItem(@PathVariable Integer itemId,
            @RequestParam Integer mechanicId,
            @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.adminAssignItem(itemId, mechanicId, extractUserId(principal));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @DeleteMapping("/items/assign-direct/{taskId}")
    public ResponseEntity<?> adminUnassignItem(@PathVariable Integer taskId,
            @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.adminUnassignItem(taskId, extractUserId(principal));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/mechanics")
    public ResponseEntity<?> getAvailableMechanics(@AuthenticationPrincipal Object principal) {
        return ResponseEntity.ok(mechanicService.getAvailableMechanics());
    }

    @PostMapping("/items/{itemId}/toggle")
    public ResponseEntity<?> toggleItemCompletion(@PathVariable Integer itemId,
            @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.toggleItemCompletion(itemId, extractUserId(principal));
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
    public ResponseEntity<?> getInspectedHistory(@AuthenticationPrincipal Object principal) {
        return ResponseEntity.ok(mechanicService.getInspectedHistory(extractUserId(principal)));
    }

    @PostMapping("/inspect/{id}/proposal")
    public ResponseEntity<?> submitProposal(@PathVariable Integer id, @RequestBody List<ProposalItemDTO> items,
            @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.submitProposal(id, items, extractUserId(principal));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/jobs/{id}/report-issue")
    public ResponseEntity<?> reportIssue(@PathVariable Integer id, @RequestBody List<ProposalItemDTO> items,
            @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.reportTechnicalIssue(id, items, extractUserId(principal));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/technical-review")
    public ResponseEntity<?> getOrdersForTechnicalReview() {
        return ResponseEntity.ok(mechanicService.getOrdersForTechnicalReview());
    }

    @PostMapping("/jobs/{id}/confirm-technical")
    public ResponseEntity<?> confirmTechnicalIssue(@PathVariable Integer id, @RequestBody List<Integer> itemIds,
            @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.confirmTechnicalIssue(id, itemIds, extractUserId(principal));
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
    public ResponseEntity<?> qcPass(@PathVariable Integer id, @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.qcPass(id, extractUserId(principal));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/jobs/{id}/qc-fail")
    public ResponseEntity<?> qcFail(@PathVariable Integer id, @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.qcFail(id, extractUserId(principal));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // Party / Multi-mechanic Endpoints

    @PostMapping("/items/{itemId}/join")
    public ResponseEntity<?> requestJoinTask(@PathVariable Integer itemId,
            @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.requestJoinTask(itemId, extractUserId(principal));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/assignments/{id}/approve")
    public ResponseEntity<?> approveJoinTask(@PathVariable Integer id,
            @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.approveJoinTask(id, extractUserId(principal));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/items/{itemId}/distribution")
    public ResponseEntity<?> updateTaskDistribution(@PathVariable Integer itemId,
            @RequestBody Map<Integer, java.math.BigDecimal> distribution,
            @AuthenticationPrincipal Object principal) {
        try {
            mechanicService.updateTaskDistribution(itemId, distribution, extractUserId(principal));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PutMapping("/items/{itemId}/max-mechanics")
    public ResponseEntity<?> updateItemMaxMechanics(
            @PathVariable Integer itemId,
            @RequestParam Integer limit,
            @AuthenticationPrincipal Object principal) {
        mechanicService.updateItemMaxMechanics(itemId, limit, extractUserId(principal));
        return ResponseEntity.ok(Map.of("success", true, "message", "Updated max mechanics limit."));
    }

    @PutMapping("/items/{itemId}/max-mechanics-v2")
    public ResponseEntity<?> updateItemMaxMechanicsV2(
            @PathVariable Integer itemId,
            @RequestParam Integer limit,
            @org.springframework.security.core.annotation.AuthenticationPrincipal Object principal) {
        mechanicService.updateItemMaxMechanics(itemId, limit, extractUserId(principal));
        return ResponseEntity.ok(Map.of("success", true, "message", "Updated max mechanics limit."));
    }
}
