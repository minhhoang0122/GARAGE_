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
                .plate(order.getReception().getVehicle().getLicensePlate())
                .customerName(order.getReception().getVehicle().getCustomer().getFullName())
                .customerPhone(order.getReception().getVehicle().getCustomer().getPhone())
                .grandTotal(order.getGrandTotal())
                .amountPaid(order.getAmountPaid())
                .debt(order.getBalanceDue())
                .paymentMethod(order.getPaymentMethod())
                .paymentDate(order.getPaymentDate())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .items(order.getOrderItems().stream()
                        .filter(i -> ItemStatus.CUSTOMER_APPROVED.equals(i.getStatus()))
                        .map(i -> PaymentSummaryDTO.PaymentItemDTO.builder()
                                .id(i.getId())
                                .name(i.getProduct().getName())
                                .quantity(i.getQuantity())
                                .unitPrice(i.getUnitPrice())
                                .discount(i.getDiscountAmount())
                                .total(i.getTotalAmount())
                                .isService(i.getProduct().getIsService())
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

        if (!OrderStatus.WAITING_FOR_PAYMENT.equals(order.getStatus())) {
            if (!OrderStatus.COMPLETED.equals(order.getStatus())) {
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

        if (OrderStatus.COMPLETED.equals(updatedOrder.getStatus())) {
            // Rule 9.4.2: Notify Sale Owner
            Integer saleId = updatedOrder.getServiceAdvisor() != null ? updatedOrder.getServiceAdvisor().getId() : null;
            if (saleId != null) {
                asyncNotificationService.pushUniqueAsync(Notification.builder()
                        .userId(saleId)
                        .role("SALE")
                        .title("Thanh toán đủ: " + updatedOrder.getReception().getVehicle().getLicensePlate())
                        .content("Đã thanh toán đủ " + updatedOrder.getGrandTotal() + ". Đơn hàng đã hoàn thành.")
                        .type("SUCCESS")
                        .link("/sale/orders/" + orderId)
                        .createdAt(LocalDateTime.now())
                        .isRead(false)
                        .build());
            }

            // Bug 100: Safe email check
            try {
                if (updatedOrder.getReception() != null && 
                    updatedOrder.getReception().getVehicle() != null && 
                    updatedOrder.getReception().getVehicle().getCustomer() != null) {
                    
                    String customerEmail = updatedOrder.getReception().getVehicle().getCustomer().getEmail();
                    if (customerEmail != null && !customerEmail.isBlank()) {
                        // Generate HTML synchronously while DB connection is still open
                        String invoiceHtml = emailService.buildInvoiceContent(updatedOrder);
                        String subject = "Hóa đơn sửa chữa - Garage AutoCare - " + updatedOrder.getReception().getVehicle().getLicensePlate();
                        
                        // Send asynchronously - This thread won't hold the DB connection anymore
                        emailService.sendHtml(customerEmail, subject, invoiceHtml);
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to send email: " + e.getMessage());
            }
        }
    }
}
