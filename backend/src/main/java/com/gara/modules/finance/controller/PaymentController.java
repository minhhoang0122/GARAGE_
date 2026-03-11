package com.gara.modules.finance.controller;

import com.gara.modules.finance.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final com.gara.modules.identity.service.UserService userService;

    public PaymentController(PaymentService paymentService, com.gara.modules.identity.service.UserService userService) {
        this.paymentService = paymentService;
        this.userService = userService;
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getPaymentSummary(@PathVariable Integer orderId) {
        return ResponseEntity.ok(paymentService.getPaymentSummary(orderId));
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getOrdersWaitingPayment() {
        return ResponseEntity.ok(paymentService.getOrdersWaitingPayment());
    }

    @PostMapping("/{orderId}/process")
    public ResponseEntity<?> processPayment(@PathVariable Integer orderId, @RequestBody Map<String, Object> body) {
        try {
            BigDecimal amount = new BigDecimal(body.get("amount").toString());
            String method = body.get("method").toString();
            Integer userId = userService.getCurrentUser().getId();

            paymentService.processPayment(orderId, amount, method, userId);

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
