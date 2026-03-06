package com.gara.modules.customer.controller;

import com.gara.dto.CustomerOrderDTO;
import com.gara.entity.*;
import com.gara.modules.customer.repository.*;
import com.gara.modules.service.repository.*;
import com.gara.modules.service.service.SaleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Collections;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final RepairOrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final SaleService saleService;

    public CustomerController(RepairOrderRepository orderRepository,
            CustomerRepository customerRepository,
            SaleService saleService) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.saleService = saleService;
    }

    /**
     * Get orders for the logged-in customer
     */
    @GetMapping("/orders")
    public ResponseEntity<?> getMyOrders(@AuthenticationPrincipal User user) {
        // Find customer linked to this user
        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        // Use repository query to get all orders for this customer
        List<RepairOrder> orders = orderRepository.findByCustomerId(customer.getId());

        // Map to response format
        List<CustomerOrderDTO> result = orders.stream()
                .map(order -> CustomerOrderDTO.builder().id(order.getId())
                        .plate(order.getPhieuTiepNhan().getXe().getBienSo()).status(order.getTrangThai())
                        .createdAt(order.getNgayTao()).total(order.getTongCong()).paid(order.getSoTienDaTra())
                        .debt(order.getCongNo()).build())
                .toList();

        return ResponseEntity.ok(result);
    }

    /**
     * Get order details for customer view
     */
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Integer orderId, @AuthenticationPrincipal User user) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify customer owns this order
        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Không tìm thấy thông tin khách hàng"));
        }

        Integer orderCustomerId = order.getPhieuTiepNhan().getXe().getKhachHang().getId();
        if (!orderCustomerId.equals(customer.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền xem đơn hàng này"));
        }

        return ResponseEntity.ok(saleService.getOrderDetails(orderId));
    }

    /**
     * Approve quote - Customer accepts the quote
     */
    @PostMapping("/orders/{orderId}/approve")
    public ResponseEntity<?> approveQuote(@PathVariable Integer orderId, @AuthenticationPrincipal User user) {
        // Ownership check is delegated to Service (or double checked here if paranoid)
        // For optimizing code, we can move ownership check to Service if we pass
        // "customer user"
        // But Controller usually does basic ACL.

        // Let's rely on Controller ACL for now, then delegate action.
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null || !order.getPhieuTiepNhan().getXe().getKhachHang().getId().equals(customer.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Không có quyền thao tác"));
        }

        try {
            saleService.approveQuoteByCustomer(orderId, user);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã duyệt báo giá thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reject quote - Customer declines the quote
     */
    @PostMapping("/orders/{orderId}/reject")
    public ResponseEntity<?> rejectQuote(@PathVariable Integer orderId, @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {

        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null || !order.getPhieuTiepNhan().getXe().getKhachHang().getId().equals(customer.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Không có quyền thao tác"));
        }

        String reason = body.getOrDefault("reason", "Không rõ lý do");
        try {
            saleService.rejectQuoteByCustomer(orderId, reason, user);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã từ chối báo giá"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Request quote revision - Customer asks for changes (BAO_GIA_LAI flow)
     */
    @PostMapping("/orders/{orderId}/request-revision")
    public ResponseEntity<?> requestRevision(@PathVariable Integer orderId, @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {

        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null || !order.getPhieuTiepNhan().getXe().getKhachHang().getId().equals(customer.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Không có quyền thao tác"));
        }

        String note = body.getOrDefault("note", "");
        try {
            saleService.requestRevisionByCustomer(orderId, note, user);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã gửi yêu cầu chỉnh sửa báo giá"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
