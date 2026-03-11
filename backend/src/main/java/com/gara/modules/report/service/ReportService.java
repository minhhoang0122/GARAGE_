package com.gara.modules.report.service;

import com.gara.modules.finance.repository.FinancialTransactionRepository;
import com.gara.modules.service.repository.RepairOrderRepository;
import com.gara.modules.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import com.gara.entity.enums.OrderStatus;

@Service
public class ReportService {

        private final FinancialTransactionRepository transactionRepository;
        private final RepairOrderRepository orderRepository;
        private final ProductRepository productRepository;
        private final com.gara.modules.mechanic.repository.TaskAssignmentRepository taskAssignmentRepository;

        public ReportService(FinancialTransactionRepository transactionRepository,
                        RepairOrderRepository orderRepository,
                        ProductRepository productRepository,
                        com.gara.modules.mechanic.repository.TaskAssignmentRepository taskAssignmentRepository) {
                this.transactionRepository = transactionRepository;
                this.orderRepository = orderRepository;
                this.productRepository = productRepository;
                this.taskAssignmentRepository = taskAssignmentRepository;
        }

        // 1. Revenue Report
        public Map<String, Object> getRevenueReport(LocalDate from, LocalDate to) {
                LocalDateTime start = from.atStartOfDay();
                LocalDateTime end = to.atTime(LocalTime.MAX);

                // Optimized: Use DB Aggregations
                BigDecimal totalRevenue = transactionRepository.sumRevenueBetween(start, end);
                BigDecimal totalRefund = transactionRepository.sumRefundBetween(start, end);
                List<Map<String, Object>> dailyData = transactionRepository.getDailyRevenueBreakdown(start, end);

                Map<LocalDate, BigDecimal> dailyRevenue = new HashMap<>();
                if (dailyData != null) {
                        for (Map<String, Object> row : dailyData) {
                                try {
                                        String dateStr = (String) row.get("date");
                                        BigDecimal amount = Optional.ofNullable((BigDecimal) row.get("amount")).orElse(BigDecimal.ZERO);
                                        dailyRevenue.put(LocalDate.parse(dateStr), amount);
                                } catch (Exception e) {
                                        // Ignore parse errors
                                }
                        }
                }

                return Map.of(
                                "totalRevenue", totalRevenue,
                                "totalRefund", totalRefund,
                                "netRevenue", totalRevenue.subtract(totalRefund),
                                "dailyBreakdown", dailyRevenue);
        }

        // 2. Mechanic Performance Report
        public List<Map<String, Object>> getMechanicPerformance(LocalDate from, LocalDate to) {
                LocalDateTime start = from.atStartOfDay();
                LocalDateTime end = to.atTime(LocalTime.MAX);

                // Optimized: Use Single DB Query
                return taskAssignmentRepository.getMechanicPerformanceStats(start, end);
        }

        // 3. Inventory Report
        public Map<String, Object> getInventoryReport() {
                // Optimized: Calculate total value in DB
                BigDecimal totalInventoryValue = productRepository.sumInventoryValue();

                // Optimized: Count in DB
                long totalItems = productRepository.count();

                // Optimized: Get Low Stock from DB
                List<com.gara.entity.Product> lowStockProducts = productRepository.findLowStockProducts();

                List<Map<String, Object>> lowStockItems = lowStockProducts.stream()
                                .map(p -> Map.<String, Object>of(
                                                "id", p.getId(),
                                                "name", p.getTenHang(),
                                                "sku", p.getMaHang(),
                                                "quantity", p.getSoLuongTon(),
                                                "minStock", p.getDinhMucTonToiThieu()))
                                .toList();

                return Map.of(
                                "totalValue", totalInventoryValue,
                                "totalItems", totalItems,
                                "lowStockCount", lowStockItems.size(),
                                "lowStockItems", lowStockItems);
        }

        // 4. Admin Dashboard Stats
        public Map<String, Object> getAdminDashboardStats() {
                LocalDateTime todayStart = LocalDate.now().atStartOfDay();

                long waitingVehicles = orderRepository.countByTrangThaiIn(
                                Arrays.asList(OrderStatus.TIEP_NHAN, OrderStatus.CHO_CHAN_DOAN));

                long pendingQuotes = orderRepository.countByTrangThai(OrderStatus.CHO_KH_DUYET);

                long inProgressJobs = orderRepository.countByTrangThaiIn(
                                Arrays.asList(OrderStatus.DA_DUYET, OrderStatus.CHO_SUA_CHUA, OrderStatus.DANG_SUA,
                                                OrderStatus.CHO_KCS));

                BigDecimal todayRevenue = transactionRepository.sumRevenueBetween(todayStart, LocalDateTime.now());
                BigDecimal todayRefund = transactionRepository.sumRefundBetween(todayStart, LocalDateTime.now());

                long lowStockCount = productRepository.countLowStockProducts();

                return Map.of(
                                "waitingVehicles", waitingVehicles,
                                "pendingQuotes", pendingQuotes,
                                "inProgressJobs", inProgressJobs,
                                "todayNetRevenue", todayRevenue.subtract(todayRefund),
                                "lowStockCount", lowStockCount);
        }
}
