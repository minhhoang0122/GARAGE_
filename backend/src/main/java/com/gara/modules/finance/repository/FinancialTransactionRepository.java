package com.gara.modules.finance.repository;

import com.gara.entity.FinancialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Integer> {
        List<FinancialTransaction> findByOrderIdOrderByCreatedAtDesc(Integer orderId);

        // Fetch recent 50 transactions for finance dashboard
        List<FinancialTransaction> findTop50ByOrderByCreatedAtDesc();

        // Optimized: Filter by date range in DB
        List<FinancialTransaction> findByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

        // Optimized: Batch fetch
        List<FinancialTransaction> findByOrderIdIn(List<Integer> orderIds);

        // Optimized: Calculate Totals in DB
        @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.amount), 0) FROM FinancialTransaction t WHERE t.type != 'REFUND' AND t.createdAt BETWEEN :start AND :end")
        java.math.BigDecimal sumRevenueBetween(
                        @org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
                        @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

        @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.amount), 0) FROM FinancialTransaction t WHERE t.type = 'REFUND' AND t.createdAt BETWEEN :start AND :end")
        java.math.BigDecimal sumRefundBetween(
                        @org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
                        @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

        // Optimized: Group by Date in DB (PostgreSQL compatible)
        @org.springframework.data.jpa.repository.Query("SELECT new map(FUNCTION('TO_CHAR', t.createdAt, 'yyyy-MM-dd') as date, SUM(t.amount) as amount) "
                        +
                        "FROM FinancialTransaction t " +
                        "WHERE t.type != 'REFUND' AND t.createdAt BETWEEN :start AND :end " +
                        "GROUP BY FUNCTION('TO_CHAR', t.createdAt, 'yyyy-MM-dd')")
        List<java.util.Map<String, Object>> getDailyRevenueBreakdown(
                        @org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
                        @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

        // Optimized: Calculate Total Paid for Order in DB (handling Refunds)
        @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(CASE WHEN t.type = 'REFUND' THEN -t.amount ELSE t.amount END), 0) FROM FinancialTransaction t WHERE t.order.id = :orderId")
        java.math.BigDecimal sumTotalPaidByOrderId(
                        @org.springframework.data.repository.query.Param("orderId") Integer orderId);
}
