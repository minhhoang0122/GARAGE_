package com.gara.modules.service.controller;

import com.gara.modules.service.service.SaleService;
import com.gara.dto.*;
import com.gara.entity.User;
import com.gara.entity.RepairOrder;
import com.gara.entity.Reception;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import com.gara.entity.enums.ItemStatus;
import com.gara.modules.service.service.TimelineService;

@RestController
@RequestMapping("/api/sale")
public class SaleController {

    private static final Logger log = LoggerFactory.getLogger(SaleController.class);
    private final SaleService saleService;
    private final com.gara.modules.identity.service.UserService userService;
    private final com.gara.modules.service.repository.RepairOrderRepository repairOrderRepository;
    private final com.gara.modules.reception.repository.ReceptionRepository receptionRepository;
    private final TimelineService timelineService;

    public SaleController(SaleService saleService, 
            com.gara.modules.identity.service.UserService userService,
            com.gara.modules.service.repository.RepairOrderRepository repairOrderRepository, 
            com.gara.modules.reception.repository.ReceptionRepository receptionRepository,
            TimelineService timelineService) {
        this.saleService = saleService;
        this.userService = userService;
        this.repairOrderRepository = repairOrderRepository;
        this.receptionRepository = receptionRepository;
        this.timelineService = timelineService;
    }

    private ResponseEntity<?> handleUnauthorized() {
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(saleService.getOrders(status));
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body, @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null) return handleUnauthorized();
            
            Integer receptionId = (Integer) body.get("receptionId");
            if (receptionId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu receptionId"));
            }
            
            RepairOrder order = saleService.createOrderFromReception(receptionId, user);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("Error creating order from reception: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/customers")
    public ResponseEntity<?> getCustomers(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(saleService.searchCustomers(search));
    }

    @PostMapping("/customers")
    public ResponseEntity<?> createCustomer(@RequestBody com.gara.entity.Customer customer) {
        try {
            return ResponseEntity.ok(saleService.createCustomer(customer));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable Integer id) {
        return ResponseEntity.ok(saleService.getCustomerById(id));
    }

    @PatchMapping("/customers/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Integer id, @RequestBody com.gara.entity.Customer customer) {
        try {
            return ResponseEntity.ok(saleService.updateCustomer(id, customer));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderDetailDTO> getOrderDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(saleService.getOrderDetails(id));
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> searchProducts(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(saleService.searchProducts(search));
    }

    @PostMapping("/orders/{id}/claim")
    public ResponseEntity<?> claimOrder(@PathVariable Integer id, @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            saleService.claimOrder(id, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/items")
    public ResponseEntity<?> addItem(@PathVariable Integer id, @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            Integer productId = Integer.parseInt(body.get("productId").toString());
            Integer quantity = Integer.parseInt(body.get("quantity").toString());
            saleService.addItem(id, productId, quantity, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PatchMapping("/items/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Integer id, @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            Integer quantity = body.containsKey("quantity") ? Integer.parseInt(body.get("quantity").toString()) : null;
            Double discountPercent = body.containsKey("discountPercent")
                    ? Double.parseDouble(body.get("discountPercent").toString())
                    : null;
            Integer version = body.containsKey("version") ? Integer.parseInt(body.get("version").toString()) : null;

            saleService.updateItem(id, quantity, discountPercent, version, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PatchMapping("/items/{id}/status")
    public ResponseEntity<?> updateItemStatus(@PathVariable Integer id, @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            String statusStr = body.get("status");
            if (statusStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trạng thái không được để trống"));
            }
            
            ItemStatus status = ItemStatus.valueOf(statusStr.toUpperCase().trim());
            saleService.updateItemStatus(id, status, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Trạng thái không hợp lệ: " + body.get("status")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> removeItem(@PathVariable Integer id,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            saleService.removeItem(id, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/submit")
    public ResponseEntity<?> submitToCustomer(@PathVariable Integer id,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            saleService.submitToCustomer(id, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/submit-replenishment")
    public ResponseEntity<?> submitReplenishment(@PathVariable Integer id,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            saleService.submitReplenishmentQuote(id, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/finalize")
    public ResponseEntity<?> finalizeOrder(@PathVariable Integer id,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            saleService.finalizeOrder(id, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Integer id, @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            String reason = body.getOrDefault("reason", "Hủy theo yêu cầu khách hàng");
            saleService.cancelOrder(id, reason, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/deposit")
    public ResponseEntity<?> updateDeposit(@PathVariable Integer id, @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            java.math.BigDecimal amount = new java.math.BigDecimal(body.get("amount").toString());
            saleService.updateDeposit(id, amount, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PatchMapping("/orders/{id}/totals")
    public ResponseEntity<?> updateOrderTotals(@PathVariable Integer id, @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            java.math.BigDecimal discount = body.containsKey("discount") 
                    ? new java.math.BigDecimal(body.get("discount").toString()) : null;
            java.math.BigDecimal vatPercent = body.containsKey("vatPercent") 
                    ? new java.math.BigDecimal(body.get("vatPercent").toString()) : null;

            saleService.updateOrderTotals(id, discount, vatPercent, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/close")
    public ResponseEntity<?> closeOrder(@PathVariable Integer id,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            saleService.closeOrder(id, user);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/warranty")
    public ResponseEntity<?> createWarranty(@PathVariable Integer id, @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            @SuppressWarnings("unchecked")
            java.util.List<Integer> itemIds = (java.util.List<Integer>) body.get("itemIds");
            Integer currentOdo = body.containsKey("odo") ? Integer.parseInt(body.get("odo").toString()) : null;
            Integer warrantyOrderId = saleService.createWarrantyOrder(id, itemIds, currentOdo, user);
            return ResponseEntity.ok(Map.of("success", true, "warrantyOrderId", warrantyOrderId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            return ResponseEntity.ok(saleService.getDashboardStats());
        } catch (Exception e) {
            log.error("Dashboard stats error", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage(), "type", e.getClass().getSimpleName()));
        }
    }

    /**
     * List all warranty orders for management
     */
    @GetMapping("/warranties")
    public List<Map<String, Object>> getAllWarranties() {
        return repairOrderRepository.findByIsWarrantyOrderTrue().stream().map(order -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", order.getId());
            map.put("uuid", order.getUuid());
            map.put("status", order.getStatus());
            map.put("createdAt", order.getCreatedAt());
            map.put("grandTotal", order.getGrandTotal());

            if (order.getReception() != null && order.getReception().getVehicle() != null) {
                map.put("licensePlate", order.getReception().getVehicle().getLicensePlate());
                map.put("customerName", order.getReception().getVehicle().getCustomer().getFullName());
                map.put("customerPhone", order.getReception().getVehicle().getCustomer().getPhone());
            }

            // Simple item summary
            String items = order.getOrderItems().stream()
                    .filter(i -> Boolean.TRUE.equals(i.getIsWarranty()))
                    .map(i -> i.getProduct() != null ? i.getProduct().getName() : "Unknown")
                    .collect(Collectors.joining(", "));
            map.put("warrantyItems", items);

            return map;
        }).collect(Collectors.toList());
    }

    /**
     * List all bookings (Reception created from online booking)
     */
    @GetMapping("/bookings")
    public List<Map<String, Object>> getAllBookings() {
        return receptionRepository.findAllBookings().stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("receptionDate", r.getReceptionDate());
            map.put("preliminaryRequest", r.getPreliminaryRequest());
            map.put("hasOrder", r.getRepairOrder() != null);
            map.put("orderId", r.getRepairOrder() != null ? r.getRepairOrder().getId() : null);
            map.put("orderStatus", r.getRepairOrder() != null ? r.getRepairOrder().getStatus() : null);

            if (r.getVehicle() != null) {
                map.put("licensePlate", r.getVehicle().getLicensePlate());
                map.put("customerName", r.getVehicle().getCustomer().getFullName());
                map.put("customerPhone", r.getVehicle().getCustomer().getPhone());
            }

            // Parse booking info if present in request
            String req = r.getPreliminaryRequest();
            if (req != null && req.startsWith("BOOKING ONLINE")) {
                map.put("isOnline", true);
            }

            return map;
        }).collect(Collectors.toList());
    }

    @PutMapping("/bookings/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        Reception reception = receptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reception not found"));

        if (updates.containsKey("receptionDate")) {
            String dateStr = (String) updates.get("receptionDate");
            LocalDateTime oldDate = reception.getReceptionDate();
            LocalDateTime newDate = LocalDateTime.parse(dateStr);
            reception.setReceptionDate(newDate);

            timelineService.recordEvent(id, null, "BOOKING_UPDATE",
                    "Cập nhật thời gian hẹn từ " + oldDate + " sang " + newDate,
                    "OLD: " + oldDate, "NEW: " + newDate, false);
        }

        if (updates.containsKey("preliminaryRequest")) {
            String oldReq = reception.getPreliminaryRequest();
            String newReq = (String) updates.get("preliminaryRequest");
            reception.setPreliminaryRequest(newReq);

            timelineService.recordEvent(id, null, "BOOKING_UPDATE",
                    "Cập nhật yêu cầu sơ bộ.",
                    "OLD: " + oldReq, "NEW: " + newReq, false);
        }

        receptionRepository.save(reception);
        return ResponseEntity.ok().build();
    }

    /**
     * Reschedule a booking (Drag & Drop on Calendar)
     */
    @PatchMapping("/bookings/{id}/reschedule")
    public ResponseEntity<?> rescheduleBooking(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        try {
            String newDate = body.get("newDate"); // format: yyyy-MM-dd
            if (newDate == null || newDate.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "newDate is required"));
            }

            com.gara.entity.Reception reception = receptionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Update receptionDate to the new date but keep the time
            java.time.LocalDate targetDate = java.time.LocalDate.parse(newDate);
            java.time.LocalDateTime oldDateTime = reception.getReceptionDate();
            java.time.LocalDateTime newDateTime = oldDateTime != null
                    ? targetDate.atTime(oldDateTime.toLocalTime())
                    : targetDate.atStartOfDay();
            reception.setReceptionDate(newDateTime);

            // Update "Ngày hẹn:" line in preliminaryRequest
            String notes = reception.getPreliminaryRequest() != null ? reception.getPreliminaryRequest() : "";
            StringBuilder sb = new StringBuilder();
            boolean foundNgayHen = false;
            for (String line : notes.split("\\n")) {
                if (line.startsWith("Ngày hẹn:")) {
                    sb.append("Ngày hẹn: ").append(newDate).append("\n");
                    foundNgayHen = true;
                } else {
                    sb.append(line).append("\n");
                }
            }
            if (!foundNgayHen) {
                sb.append("Ngày hẹn: ").append(newDate).append("\n");
            }
            reception.setPreliminaryRequest(sb.toString().trim());

            receptionRepository.save(reception);

            return ResponseEntity.ok(Map.of("success", true, "newDate", newDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
