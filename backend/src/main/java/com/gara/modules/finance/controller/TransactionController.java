package com.gara.modules.finance.controller;

import com.gara.entity.FinancialTransaction;
import com.gara.entity.User;
import com.gara.modules.finance.service.TransactionService;
import com.gara.modules.identity.service.UserService;
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

    public TransactionController(TransactionService transactionService, UserService userService) {
        this.transactionService = transactionService;
        this.userService = userService;
    }

    private ResponseEntity<?> handleUnauthorized() {
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getByOrder(@PathVariable Integer orderId) {
        return ResponseEntity.ok(transactionService.getTransactionsByOrder(orderId));
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
}
