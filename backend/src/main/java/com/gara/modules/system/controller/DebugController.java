package com.gara.modules.system.controller;

import com.gara.modules.service.service.SaleService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/debug")
@Profile("dev")
public class DebugController {

    private final SaleService saleService;

    public DebugController(SaleService saleService) {
        this.saleService = saleService;
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(saleService.getOrders(status));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderDetails(@org.springframework.web.bind.annotation.PathVariable Integer id) {
        return ResponseEntity.ok(saleService.getOrderDetails(id));
    }
}
