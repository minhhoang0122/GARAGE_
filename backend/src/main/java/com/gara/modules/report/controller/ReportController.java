package com.gara.modules.report.controller;

import com.gara.modules.report.service.ReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private static final Logger log = LoggerFactory.getLogger(ReportController.class);
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportService.getRevenueReport(from, to));
    }

    @GetMapping("/mechanic-performance")
    public ResponseEntity<?> getMechanicPerformance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportService.getMechanicPerformance(from, to));
    }

    @GetMapping("/inventory")
    public ResponseEntity<?> getInventoryReport() {
        return ResponseEntity.ok(reportService.getInventoryReport());
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getAdminDashboardStats() {
        try {
            return ResponseEntity.ok(reportService.getAdminDashboardStats());
        } catch (Exception e) {
            log.error("Error loading dashboard stats", e);
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Lỗi tải thống kê: " + e.getMessage()));
        }
    }
}
