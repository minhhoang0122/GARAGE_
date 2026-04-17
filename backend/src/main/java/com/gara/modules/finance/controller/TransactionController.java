package com.gara.modules.finance.controller;

import com.gara.entity.FinancialTransaction;
import com.gara.entity.User;
import com.gara.modules.finance.service.TransactionService;
import com.gara.modules.identity.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;
    private final com.gara.modules.service.repository.RepairOrderRepository orderRepository;

    public TransactionController(TransactionService transactionService, UserService userService, com.gara.modules.service.repository.RepairOrderRepository orderRepository) {
        this.transactionService = transactionService;
        this.userService = userService;
        this.orderRepository = orderRepository;
    }

    private ResponseEntity<?> handleUnauthorized() {
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getByOrder(@PathVariable Integer orderId) {
        return ResponseEntity.ok(transactionService.getTransactionsByOrder(orderId));
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecent() {
        return ResponseEntity.ok(transactionService.getRecentTransactions());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(transactionService.getTransactionStats());
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal Object principal) {
        try {
            User user = userService.getCurrentUser();
            if (user == null)
                return handleUnauthorized();

            Integer orderId = Integer.parseInt(payload.get("orderId").toString());
            BigDecimal amount = new BigDecimal(payload.get("amount").toString());
            String typeStr = (String) payload.get("type");
            String methodStr = (String) payload.get("method");
            String refCode = (String) payload.get("referenceCode");
            String note = (String) payload.get("note");

            FinancialTransaction.TransactionType type = FinancialTransaction.TransactionType.valueOf(typeStr);
            FinancialTransaction.PaymentMethod method = FinancialTransaction.PaymentMethod.valueOf(methodStr);

            transactionService.createTransaction(orderId, amount, type, method, refCode, note, user.getId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Value("${payment.bank.id:MB}")
    private String bankId;

    @Value("${payment.bank.account:0123456789}")
    private String bankAccount;

    @Value("${payment.bank.name:GARAGE MASTER}")
    private String bankAccountName;

    @GetMapping("/qr-payment/{orderId}")
    public ResponseEntity<?> getQrPayment(
            @PathVariable Integer orderId,
            @RequestParam(required = false) Long amount) {
        try {
            User user = userService.getCurrentUser();
            if (user == null) {
                return handleUnauthorized();
            }

            com.gara.entity.RepairOrder order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            long amountDue = amount != null ? amount : (order.getBalanceDue() != null ? order.getBalanceDue().longValue() : 0);
            String content = "GarageMaster DH" + order.getId();

            return ResponseEntity.ok(Map.of(
                    "orderId", order.getId(),
                    "amount", amountDue,
                    "bankId", bankId,
                    "accountNo", bankAccount,
                    "accountName", bankAccountName,
                    "content", content,
                    "qrUrl", String.format(
                            "https://img.vietqr.io/image/%s-%s-compact.jpg?amount=%d&addInfo=%s&accountName=%s",
                            bankId, bankAccount, amountDue, content.replace(" ", "+"), bankAccountName.replace(" ", "+"))));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
