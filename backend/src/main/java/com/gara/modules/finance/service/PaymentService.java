package com.gara.modules.finance.service;

import com.gara.modules.support.service.EmailService;
import com.gara.dto.PaymentSummaryDTO;
import com.gara.entity.*;
import com.gara.modules.service.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.gara.entity.enums.OrderStatus;
import com.gara.entity.enums.ItemStatus;

@Service
public class PaymentService {

    private final RepairOrderRepository orderRepository;
    private final EmailService emailService;
    private final TransactionService transactionService;
    private final com.gara.modules.support.service.AsyncNotificationService asyncNotificationService;

    public PaymentService(RepairOrderRepository orderRepository,
            EmailService emailService,
            TransactionService transactionService,
            com.gara.modules.support.service.AsyncNotificationService asyncNotificationService) {
        this.orderRepository = orderRepository;
        this.emailService = emailService;
        this.transactionService = transactionService;
        this.asyncNotificationService = asyncNotificationService;
    }

    @Transactional(readOnly = true)
    public List<PaymentSummaryDTO> getOrdersWaitingPayment() {
        return orderRepository.findOrdersAwaitingPayment().stream()
                .map(this::mapToPaymentSummaryDTO)
                .toList();
    }

    private PaymentSummaryDTO mapToPaymentSummaryDTO(RepairOrder order) {
        return PaymentSummaryDTO.builder()
                .orderId(order.getId())
                .plate(order.getPhieuTiepNhan().getXe().getBienSo())
                .customerName(order.getPhieuTiepNhan().getXe().getKhachHang().getHoTen())
                .customerPhone(order.getPhieuTiepNhan().getXe().getKhachHang().getSoDienThoai())
                .grandTotal(order.getTongCong())
                .amountPaid(order.getSoTienDaTra())
                .debt(order.getCongNo())
                .paymentMethod(order.getPhuongThuc())
                .paymentDate(order.getNgayThanhToan())
                .status(order.getTrangThai() != null ? order.getTrangThai().name() : null)
                .items(order.getChiTietDonHang().stream()
                        .filter(i -> ItemStatus.KHACH_DONG_Y.equals(i.getTrangThai()))
                        .map(i -> PaymentSummaryDTO.PaymentItemDTO.builder()
                                .id(i.getId())
                                .name(i.getHangHoa().getTenHang())
                                .quantity(i.getSoLuong())
                                .unitPrice(i.getDonGiaGoc())
                                .discount(i.getGiamGiaTien())
                                .total(i.getThanhTien())
                                .isService(i.getHangHoa().getLaDichVu())
                                .build())
                        .toList())
                .build();
    }

    @Transactional(readOnly = true)
    public PaymentSummaryDTO getPaymentSummary(Integer orderId) {
        RepairOrder order = orderRepository.findByIdWithFullDetails(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return mapToPaymentSummaryDTO(order);
    }

    @Transactional
    public void processPayment(Integer orderId, BigDecimal amount, String method, Integer userId) {
        // USE LOCK: Prevent race condition (Bug 82)
        RepairOrder order = orderRepository.findByIdWithLock(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found or busy"));

        if (!OrderStatus.CHO_THANH_TOAN.equals(order.getTrangThai())) {
            if (!OrderStatus.HOAN_THANH.equals(order.getTrangThai())) {
                throw new RuntimeException("Đơn hàng chưa ở trạng thái chờ thanh toán");
            }
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền thanh toán không hợp lệ.");
        }

        // Bug 99: Validate Payment Method
        FinancialTransaction.PaymentMethod paymentMethod;
        try {
            paymentMethod = FinancialTransaction.PaymentMethod.valueOf(method.toUpperCase().trim());
        } catch (Exception e) {
            throw new RuntimeException("Phương thức thanh toán không hợp lệ: " + method);
        }

        // UNIFY Logic (Bug 64): Delegate to TransactionService to create traceable
        // records
        transactionService.createTransaction(
                orderId,
                amount,
                FinancialTransaction.TransactionType.PAYMENT,
                paymentMethod,
                null,
                "Thanh toán đơn hàng #" + orderId,
                userId);

        // Fetch again to get updated state after TransactionService finishes
        RepairOrder updatedOrder = orderRepository.findById(orderId).orElseThrow();

        if (OrderStatus.HOAN_THANH.equals(updatedOrder.getTrangThai())) {
            // Rule 9.4.2: Notify Sale Owner
            Integer saleId = updatedOrder.getNguoiPhuTrach() != null ? updatedOrder.getNguoiPhuTrach().getId() : null;
            if (saleId != null) {
                asyncNotificationService.pushUniqueAsync(Notification.builder()
                        .userId(saleId)
                        .role("SALE")
                        .title("Thanh toán đủ: " + updatedOrder.getPhieuTiepNhan().getXe().getBienSo())
                        .content("Đã thanh toán đủ " + updatedOrder.getTongCong() + ". Đơn hàng đã hoàn thành.")
                        .type("SUCCESS")
                        .link("/sale/orders/" + orderId)
                        .createdAt(LocalDateTime.now())
                        .isRead(false)
                        .build());
            }

            // Bug 100: Safe email check
            try {
                if (updatedOrder.getPhieuTiepNhan() != null && 
                    updatedOrder.getPhieuTiepNhan().getXe() != null && 
                    updatedOrder.getPhieuTiepNhan().getXe().getKhachHang() != null) {
                    
                    String customerEmail = updatedOrder.getPhieuTiepNhan().getXe().getKhachHang().getEmail();
                    if (customerEmail != null && !customerEmail.isBlank()) {
                        emailService.sendInvoiceEmail(updatedOrder, customerEmail);
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to send email: " + e.getMessage());
            }
        }
    }
}
