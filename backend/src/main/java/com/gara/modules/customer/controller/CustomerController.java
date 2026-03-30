package com.gara.modules.customer.controller;

import com.gara.dto.CustomerOrderDTO;
import com.gara.entity.*;
import com.gara.modules.customer.repository.*;
import com.gara.modules.identity.service.UserService;
import com.gara.modules.service.repository.*;
import com.gara.modules.service.service.SaleService;
import com.gara.modules.public_api.service.BookingService;
import com.gara.modules.public_api.dto.PublicBookingDTO;
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
    private final VehicleRepository vehicleRepository;
    private final SaleService saleService;
    private final BookingService bookingService;
    private final UserService userService;

    public CustomerController(RepairOrderRepository orderRepository,
            CustomerRepository customerRepository,
            VehicleRepository vehicleRepository,
            SaleService saleService,
            BookingService bookingService,
            UserService userService) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
        this.saleService = saleService;
        this.bookingService = bookingService;
        this.userService = userService;
    }

    /**
     * Get vehicles for the logged-in customer
     */
    @GetMapping("/my-vehicles")
    public ResponseEntity<?> getMyVehicles(@AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<Vehicle> vehicles = vehicleRepository.findByCustomerId(customer.getId());
        return ResponseEntity.ok(vehicles.stream().map(v -> Map.of(
                "id", v.getId(),
                "licensePlate", v.getLicensePlate(),
                "brand", v.getBrand() != null? v.getBrand() : "",
                "model", v.getModel() != null? v.getModel() : "",
                "currentOdo", v.getCurrentOdo() != null? v.getCurrentOdo() : 0)).toList());
    }

    /**
     * Get orders for the logged-in customer
     */
    @GetMapping("/orders")
    public ResponseEntity<?> getMyOrders(@AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<RepairOrder> orders = orderRepository.findByCustomerId(customer.getId());

        List<CustomerOrderDTO> result = orders.stream()
                .map(order -> CustomerOrderDTO.builder().id(order.getId())
                        .plate(order.getReception().getVehicle().getLicensePlate())
                        .status(order.getStatus() != null? order.getStatus().name() : null)
                        .createdAt(order.getCreatedAt()).total(order.getGrandTotal()).paid(order.getAmountPaid())
                        .debt(order.getBalanceDue()).build())
                .toList();

        return ResponseEntity.ok(result);
    }

    /**
     * Get order details for customer view
     */
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Integer orderId, @AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Không tìm thấy thông tin khách hàng"));
        }

        Integer orderCustomerId = order.getReception().getVehicle().getCustomer().getId();
        if (!orderCustomerId.equals(customer.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền xem đơn hàng này"));
        }

        return ResponseEntity.ok(saleService.getOrderDetails(orderId));
    }

    /**
     * Generate VietQR payment info for an order
     */
    @GetMapping("/qr-payment/{orderId}")
    public ResponseEntity<?> getQrPayment(@PathVariable Integer orderId, @AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify ownership
        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Không tìm thấy thông tin khách hàng"));
        }
        Integer orderCustomerId = order.getReception().getVehicle().getCustomer().getId();
        if (!orderCustomerId.equals(customer.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền thao tác"));
        }

        // Build VietQR info
        long amountDue = order.getBalanceDue() != null? order.getBalanceDue().longValue() : 0;
        String content = "GarageMaster DH" + order.getId();

        return ResponseEntity.ok(Map.of(
                "orderId", order.getId(),
                "amount", amountDue,
                "bankId", "MB",
                "accountNo", "0123456789012",
                "accountName", "GARAGE MASTER",
                "content", content,
                "qrUrl", String.format(
                        "https://img.vietqr.io/image/MB-0123456789012-compact.jpg?amount=%d&addInfo=%s&accountName=GARAGE+MASTER",
                        amountDue, content.replace(" ", "+"))));
    }

    /**
     * Create booking as authenticated customer (auto-fill customer info)
     */
    @PostMapping("/booking")
    public ResponseEntity<?> createBooking(@RequestBody PublicBookingDTO bookingDto,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(401).build();
            }
            Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
            if (customer != null) {
                bookingDto = new PublicBookingDTO(
                        customer.getFullName(),
                        customer.getPhone(),
                        customer.getEmail(), // use stored email
                        customer.getAddress(), // use stored address
                        bookingDto.licensePlate(),
                        bookingDto.model(),
                        bookingDto.appointmentTime(),
                        bookingDto.notes(),
                        bookingDto.selectedServiceIds(),
                        user.getId());
            }
            Integer receptionId = bookingService.createBooking(bookingDto);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đặt lịch thành công",
                    "receptionId", receptionId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    /**
     * Approve quote - Customer accepts the quote
     */
    @PostMapping("/orders/{orderId}/approve")
    public ResponseEntity<?> approveQuote(@PathVariable Integer orderId, @AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null ||!order.getReception().getVehicle().getCustomer().getId().equals(customer.getId())) {
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
            @AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null ||!order.getReception().getVehicle().getCustomer().getId().equals(customer.getId())) {
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
     * Request quote revision
     */
    @PostMapping("/orders/{orderId}/request-revision")
    public ResponseEntity<?> requestRevision(@PathVariable Integer orderId, @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null ||!order.getReception().getVehicle().getCustomer().getId().equals(customer.getId())) {
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

    /**
     * Get warranty info: list items still under warranty for the customer
     */
    @GetMapping("/warranty")
    public ResponseEntity<?> getWarrantyItems(@AuthenticationPrincipal Object principal) {
        User user = userService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<RepairOrder> orders = orderRepository.findByCustomerId(customer.getId());
        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        java.util.List<Map<String, Object>> warrantyItems = new java.util.ArrayList<>();

        for (RepairOrder order : orders) {
            // Only completed/closed orders have warranty
            if (order.getStatus() == null) continue;
            String status = order.getStatus().name();
            if (!status.equals("COMPLETED") && !status.equals("CLOSED")) continue;

            if (order.getOrderItems() == null) continue;

            Integer orderOdo = 0;
            if (order.getReception() != null && order.getReception().getOdo() != null) {
                orderOdo = order.getReception().getOdo();
            }

            String plate = order.getReception() != null && order.getReception().getVehicle() != null
                   ? order.getReception().getVehicle().getLicensePlate() : "";

            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                if (product == null) continue;

                int baoHanhThang = product.getWarrantyMonths() != null? product.getWarrantyMonths() : 0;
                int baoHanhKm = product.getWarrantyKm() != null? product.getWarrantyKm() : 0;

                // Skip items without warranty policy
                if (baoHanhThang == 0 && baoHanhKm == 0) continue;

                // Check time-based warranty
                boolean dateValid = true;
                java.time.LocalDateTime expiryDate = null;
                if (baoHanhThang > 0 && order.getCreatedAt() != null) {
                    expiryDate = order.getCreatedAt().plusMonths(baoHanhThang);
                    if (now.isAfter(expiryDate)) {
                        dateValid = false;
                    }
                }

                // Check km-based warranty
                boolean kmValid = true;
                Integer maxKm = null;
                if (baoHanhKm > 0) {
                    maxKm = orderOdo + baoHanhKm;
                    Vehicle vehicle = order.getReception().getVehicle();
                    if (vehicle != null && vehicle.getCurrentOdo() != null && vehicle.getCurrentOdo() > maxKm) {
                        kmValid = false;
                    }
                }

                // Already claimed warranty
                boolean daBaoHanh = item.getIsWarrantyProcessed() != null && item.getIsWarrantyProcessed();

                // Determine overall status
                String warrantyStatus;
                if (daBaoHanh) {
                    warrantyStatus = "DA_BAO_HANH";
                } else if (!dateValid ||!kmValid) {
                    warrantyStatus = "HET_HAN";
                } else {
                    warrantyStatus = "CON_HAN";
                }

                Map<String, Object> entry = new java.util.HashMap<>();
                entry.put("orderId", order.getId());
                entry.put("orderItemId", item.getId());
                entry.put("plate", plate);
                entry.put("productName", product.getName());
                entry.put("baoHanhThang", baoHanhThang);
                entry.put("baoHanhKm", baoHanhKm);
                entry.put("ngaySuaChua", order.getCreatedAt());
                entry.put("ngayHetHan", expiryDate);
                entry.put("maxKm", maxKm);
                entry.put("warrantyStatus", warrantyStatus);
                entry.put("daBaoHanh", daBaoHanh);

                warrantyItems.add(entry);
            }
        }

        return ResponseEntity.ok(warrantyItems);
    }

    /**
     * Submit warranty claim - Customer requests warranty for specific items
     */
    @PostMapping("/warranty-claim")
    public ResponseEntity<?> submitWarrantyClaim(@RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(401).build();
            }
            Integer orderId = (Integer) body.get("orderId");
            @SuppressWarnings("unchecked")
            List<Integer> itemIds = (List<Integer>) body.get("itemIds");
            Integer currentOdo = body.get("currentOdo") != null? (Integer) body.get("currentOdo") : null;

            if (orderId == null || itemIds == null || itemIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Vui lòng chọn đơn hàng và hạng mục cần bảo hành"));
            }

            // Verify customer owns this order
            Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
            if (customer == null) {
                return ResponseEntity.status(403).body(Map.of("error", "Không tìm thấy thông tin khách hàng"));
            }

            RepairOrder order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
            Integer orderCustomerId = order.getReception().getVehicle().getCustomer().getId();
            if (!orderCustomerId.equals(customer.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền yêu cầu bảo hành đơn này"));
            }

            Integer warrantyOrderId = saleService.createWarrantyOrder(orderId, itemIds, currentOdo, user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Yêu cầu bảo hành đã được ghi nhận. Đội ngũ sẽ liên hệ xác nhận.",
                    "warrantyOrderId", warrantyOrderId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }
}
