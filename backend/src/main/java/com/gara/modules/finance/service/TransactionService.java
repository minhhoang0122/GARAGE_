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
import com.gara.modules.support.service.AsyncAuditService;
import com.gara.entity.AuditLog;
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
    private final AsyncAuditService asyncAuditService;

    public TransactionService(FinancialTransactionRepository transactionRepository,
            RepairOrderRepository orderRepository,
            UserRepository userRepository,
            AsyncAuditService asyncAuditService) {
        this.transactionRepository = transactionRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.asyncAuditService = asyncAuditService;
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

        // Bug 120 Fix: Check for duplicate reference code to prevent accounting errors
        if (referenceCode != null && !referenceCode.isBlank()) {
            if (transactionRepository.existsByReferenceCode(referenceCode)) {
                throw new RuntimeException("Mã tham chiếu " + referenceCode + " đã tồn tại trong hệ thống.");
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
        
        // Bug 130 Fix: Detailed Audit Log for all financial transactions
        asyncAuditService.logAsync(AuditLog.builder()
                .bang("FinancialTransaction")
                .banGhiId(trans.getId())
                .hanhDong("INSERT")
                .duLieuMoi("Type: " + type + ", Amount: " + amount + ", Method: " + method + ", Ref: " + referenceCode)
                .lyDo("Ghi nhận giao dịch tài chính cho đơn hàng #" + orderId + (note != null ? ": " + note : ""))
                .nguoiThucHienId(userId)
                .build());

        // Recalculate Order Payment Status immediately
        recalculateOrderPayment(order, amount, type);
    }

    private void recalculateOrderPayment(RepairOrder order, BigDecimal newAmount, TransactionType type) {
        // Bug 111 Fix: The trans just saved is ALREADY in the DB but may not be included in sumTotalPaidByOrderId
        // if the persistence context hasn't flushed.
        // To be safe and deterministic:
        // 1. Get total paid EXCLUDING the current transaction
        // 2. OR simply use the provided newAmount and add it to the DB sum if we are sure sum doesn't include it.
        // A better way is to flush the current transaction first to ensure it's in the DB sum.
        transactionRepository.flush(); 
        BigDecimal totalPaidUpdated = transactionRepository.sumTotalPaidByOrderId(order.getId());
        
        if (totalPaidUpdated == null) totalPaidUpdated = BigDecimal.ZERO;

        // Update SoTienDaTra (Amount Paid)
        order.setSoTienDaTra(totalPaidUpdated);

        // Update CongNo (Debt)
        if (order.getTongCong() == null)
            order.setTongCong(BigDecimal.ZERO);
        BigDecimal debt = order.getTongCong().subtract(totalPaidUpdated);

        // Auto-complete order if fully paid and in CHO_THANH_TOAN
        if (debt.compareTo(BigDecimal.ZERO) <= 0 && OrderStatus.CHO_THANH_TOAN.equals(order.getTrangThai())) {
            order.setTrangThai(OrderStatus.HOAN_THANH);
            order.setNgayThanhToan(java.time.LocalDateTime.now());
        }
        
        // Bug 116 Fix: Status Reversion on Refund
        // If a refund makes Debt > 0 and the order was HOAN_THANH, move it back to CHO_THANH_TOAN
        if (debt.compareTo(BigDecimal.ZERO) > 0 && OrderStatus.HOAN_THANH.equals(order.getTrangThai())) {
             order.setTrangThai(OrderStatus.CHO_THANH_TOAN);
             order.setNgayThanhToan(null); // Clear payment date as it's no longer fully paid

             // Bug 117 Fix: Audit status reversion
             asyncAuditService.logAsync(AuditLog.builder()
                     .bang("DonHangSuaChua")
                     .banGhiId(order.getId())
                     .hanhDong("UPDATE")
                     .duLieuCu(OrderStatus.HOAN_THANH.name())
                     .duLieuMoi(OrderStatus.CHO_THANH_TOAN.name())
                     .lyDo("Thu hồi trạng thái do hoàn tiền (Refund). Nợ mới: " + debt)
                     .build());
        }

        order.setCongNo(debt.compareTo(BigDecimal.ZERO) > 0 ? debt : BigDecimal.ZERO);
        orderRepository.save(order);
    }
}
