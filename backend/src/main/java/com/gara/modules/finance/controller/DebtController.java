package com.gara.modules.finance.controller;

import com.gara.dto.DebtDTO;
import com.gara.modules.service.repository.RepairOrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/debts")
public class DebtController {

    private final RepairOrderRepository orderRepository;

    public DebtController(RepairOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping
    public ResponseEntity<List<DebtDTO>> getDebtors() {
        return ResponseEntity.ok(orderRepository.findCustomersWithDebt());
    }
}
