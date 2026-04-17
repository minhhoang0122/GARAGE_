package com.gara.modules.service.controller;

import com.gara.dto.SepayWebhookDTO;
import com.gara.modules.service.service.SaleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sepay-payment")
public class SepayPaymentController {

    private static final Logger log = LoggerFactory.getLogger(SepayPaymentController.class);

    private final SaleService saleService;

    public SepayPaymentController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping("")
    public ResponseEntity<String> receiveSepayWebhook(@RequestBody SepayWebhookDTO webhookData) {
        log.info("Received SePay Webhook: {}", webhookData);
        try {
            saleService.processSepayWebhook(webhookData);
            return ResponseEntity.ok("ACK");
        } catch (Exception e) {
            log.error("Error processing SePay Webhook", e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
