package com.gara.modules.finance.service;

import com.gara.dto.FinancialTransactionDTO;
import com.gara.entity.FinancialTransaction;
import com.gara.entity.FinancialTransaction.TransactionType;
import com.gara.entity.FinancialTransaction.PaymentMethod;
import com.gara.entity.RepairOrder;
import com.gara.entity.User;
import com.gara.modules.finance.repository.FinancialTransactionRepository;
import com.gara.modules.service.repository.RepairOrderRepository;
import com.gara.modules.auth.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import com.gara.entity.enums.OrderStatus;

@Service
public class TransactionService {

    private final FinancialTransactionRepository transactionRepository;
    private final RepairOrderRepository orderRepository;
    private final UserRepository userRepository;

    public TransactionService(FinancialTransactionRepository transactionRepository,
            RepairOrderRepository orderRepository,
            UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<FinancialTransactionDTO> getTransactionsByOrder(Integer orderId) {
        return transactionRepository.findByOrderIdOrderByCreatedAtDesc(orderId).stream()
                .map(t -> FinancialTransactionDTO.builder()
                        .id(t.getId())
                        .amount(t.getAmount())
                        .type(t.getType().name())
                        .method(t.getMethod().name())
                        .referenceCode(t.getReferenceCode())
                        .note(t.getNote())
                        .createdAt(t.getCreatedAt())
                        .createdBy(t.getCreatedBy().getHoTen())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FinancialTransactionDTO> getRecentTransactions() {
        return transactionRepository.findTop50ByOrderByCreatedAtDesc().stream()
                .map(t -> FinancialTransactionDTO.builder()
                        .id(t.getId())
                        .amount(t.getAmount())
                        .type(t.getType().name())
                        .method(t.getMethod().name())
                        .referenceCode(t.getReferenceCode())
                        .note(t.getNote())
                        .createdAt(t.getCreatedAt())
                        .createdBy(t.getCreatedBy() != null ? t.getCreatedBy().getHoTen() : "System")
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getTransactionStats() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        BigDecimal totalRevenueThisMonth = transactionRepository.sumRevenueBetween(startOfMonth, now);
        BigDecimal totalRefundThisMonth = transactionRepository.sumRefundBetween(startOfMonth, now);

        // Quỹ (Cash balance) = sum of all time revenue - sum of all time refunds
        BigDecimal allTimeRevenue = transactionRepository
                .sumRevenueBetween(java.time.LocalDateTime.of(2000, 1, 1, 0, 0), now);
        BigDecimal allTimeRefund = transactionRepository.sumRefundBetween(java.time.LocalDateTime.of(2000, 1, 1, 0, 0),
                now);
        BigDecimal currentBalance = allTimeRevenue.subtract(allTimeRefund);

        return java.util.Map.of(
                "currentBalance", currentBalance,
                "totalRevenueThisMonth", totalRevenueThisMonth,
                "totalRefundThisMonth", totalRefundThisMonth);
    }

    @Transactional
    public void createTransaction(Integer orderId, BigDecimal amount, TransactionType type,
            PaymentMethod method, String referenceCode, String note, Integer userId) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        User user = userRepository.findById(userId).orElseThrow();

        // Safe null check
        if (order.getTienCoc() == null)
            order.setTienCoc(BigDecimal.ZERO);
        if (order.getTongCong() == null)
            order.setTongCong(BigDecimal.ZERO);

        // Validation based on Type via Modern Switch
        switch (type) {
            case DEPOSIT -> order.setTienCoc(order.getTienCoc().add(amount));
            case REFUND -> {
                BigDecimal paidSoFar = transactionRepository.sumTotalPaidByOrderId(orderId);

                if (amount.compareTo(paidSoFar) > 0) {
                    throw new RuntimeException("Số tiền hoàn trả (" + amount
                            + ") không được vượt quá số tiền khách đã thanh toán (" + paidSoFar + ").");
                }
            }
            default -> {
            }
        }

        // Save Transaction
        FinancialTransaction trans = FinancialTransaction.builder()
                .order(order)
                .amount(amount)
                .type(type)
                .method(method)
                .referenceCode(referenceCode)
                .note(note)
                .createdBy(user)
                .build();

        transactionRepository.save(trans);

        // Recalculate Order Payment Status
        recalculateOrderPayment(order);
    }

    private void recalculateOrderPayment(RepairOrder order) {
        // Optimized: Calculate Total Paid in DB
        BigDecimal totalPaid = transactionRepository.sumTotalPaidByOrderId(order.getId());
        if (totalPaid == null)
            totalPaid = BigDecimal.ZERO;

        // Update SoTienDaTra (Amount Paid)
        order.setSoTienDaTra(totalPaid);

        // Update CongNo (Debt)
        if (order.getTongCong() == null)
            order.setTongCong(BigDecimal.ZERO);
        BigDecimal debt = order.getTongCong().subtract(totalPaid);

        if (debt.compareTo(BigDecimal.ZERO) <= 0 && OrderStatus.CHO_THANH_TOAN.equals(order.getTrangThai())) {
            order.setTrangThai(OrderStatus.HOAN_THANH);
        }

        order.setCongNo(debt);
        orderRepository.save(order);
    }
}
