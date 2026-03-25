package com.gara.modules.service.controller;

import com.gara.modules.service.service.SaleService;
import com.gara.modules.identity.service.UserService;
import com.gara.modules.service.repository.RepairOrderRepository;
import com.gara.modules.reception.repository.ReceptionRepository;
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
import com.gara.entity.enums.ItemStatus;

@RestController
@RequestMapping("/api/sale")
public class SaleController {

    private static final Logger log = LoggerFactory.getLogger(SaleController.class);
    private final SaleService saleService;
    private final UserService userService;
    private final RepairOrderRepository repairOrderRepository;
    private final ReceptionRepository receptionRepository;

    public SaleController(SaleService saleService, UserService userService,
            RepairOrderRepository repairOrderRepository, ReceptionRepository receptionRepository) {
        this.saleService = saleService;
        this.userService = userService;
        this.repairOrderRepository = repairOrderRepository;
        this.receptionRepository = receptionRepository;
    }

    private ResponseEntity<?> handleUnauthorized() {
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(saleService.getOrders(status));
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

            ItemStatus status = ItemStatus.valueOf(body.get("status"));
            saleService.updateItemStatus(id, status, user);
            return ResponseEntity.ok(Map.of("success", true));
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
    @GetMapping("/warranty-claims")
    public ResponseEntity<?> getWarrantyClaims() {
        List<RepairOrder> warrantyOrders = repairOrderRepository.findByLaDonBaoHanhTrue();
        List<Map<String, Object>> result = warrantyOrders.stream().map(order -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", order.getId());
            m.put("trangThai", order.getTrangThai() != null ? order.getTrangThai().name() : null);
            m.put("ngayTao", order.getNgayTao());
            m.put("tongCong", order.getTongCong());
            try {
                m.put("plate", order.getPhieuTiepNhan().getXe().getBienSo());
                m.put("customer", order.getPhieuTiepNhan().getXe().getKhachHang().getHoTen());
                m.put("phone", order.getPhieuTiepNhan().getXe().getKhachHang().getSoDienThoai());
            } catch (Exception e) {
                m.put("plate", "");
                m.put("customer", "");
                m.put("phone", "");
            }
            long warItemCount = order.getChiTietDonHang() != null
                    ? order.getChiTietDonHang().stream().filter(i -> Boolean.TRUE.equals(i.getLaHangBaoHanh())).count()
                    : 0;
            m.put("warrantyItemCount", warItemCount);
            return m;
        }).toList();

        return ResponseEntity.ok(result);
    }

    /**
     * List all bookings (Reception created from online booking)
     */
    @GetMapping("/bookings")
    public ResponseEntity<?> getBookings() {
        List<Reception> bookings = receptionRepository.findAllBookings();
        List<Map<String, Object>> result = bookings.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.getId());
            m.put("ngayGio", r.getNgayGio());
            m.put("yeuCauSoBo", r.getYeuCauSoBo());
            m.put("hasOrder", r.getDonHangSuaChua() != null);
            m.put("orderId", r.getDonHangSuaChua() != null ? r.getDonHangSuaChua().getId() : null);
            m.put("orderStatus", r.getDonHangSuaChua() != null && r.getDonHangSuaChua().getTrangThai() != null
                    ? r.getDonHangSuaChua().getTrangThai().name() : null);
            try {
                m.put("plate", r.getXe().getBienSo());
                m.put("customer", r.getXe().getKhachHang().getHoTen());
                m.put("phone", r.getXe().getKhachHang().getSoDienThoai());
            } catch (Exception e) {
                m.put("plate", "");
                m.put("customer", "");
                m.put("phone", "");
            }
            // Parse ngayHen from notes
            String notes = r.getYeuCauSoBo() != null ? r.getYeuCauSoBo() : "";
            String ngayHen = "";
            for (String line : notes.split("\\n")) {
                if (line.startsWith("Ngày hẹn:")) {
                    ngayHen = line.replace("Ngày hẹn:", "").trim();
                    break;
                }
            }
            m.put("ngayHen", ngayHen);
            return m;
        }).toList();

        return ResponseEntity.ok(result);
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

            Reception reception = receptionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Update ngayGio to the new date but keep the time
            java.time.LocalDate targetDate = java.time.LocalDate.parse(newDate);
            java.time.LocalDateTime oldDateTime = reception.getNgayGio();
            java.time.LocalDateTime newDateTime = oldDateTime != null
                    ? targetDate.atTime(oldDateTime.toLocalTime())
                    : targetDate.atStartOfDay();
            reception.setNgayGio(newDateTime);

            // Update "Ngày hẹn:" line in yeuCauSoBo
            String notes = reception.getYeuCauSoBo() != null ? reception.getYeuCauSoBo() : "";
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
            reception.setYeuCauSoBo(sb.toString().trim());

            receptionRepository.save(reception);

            return ResponseEntity.ok(Map.of("success", true, "newDate", newDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
