package com.gara.modules.finance.service;

import com.gara.modules.support.service.EmailService;
import com.gara.dto.PaymentSummaryDTO;
import com.gara.entity.*;
import com.gara.modules.service.repository.*;
import com.gara.modules.notification.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final RepairOrderRepository orderRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public PaymentService(RepairOrderRepository orderRepository,
            NotificationRepository notificationRepository,
            EmailService emailService) {
        this.orderRepository = orderRepository;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
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
                .status(order.getTrangThai())
                .items(order.getChiTietDonHang().stream()
                        .filter(i -> "KHACH_DONG_Y".equals(i.getTrangThai()))
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
    public void processPayment(Integer orderId, BigDecimal amount, String method) {
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"CHO_THANH_TOAN".equals(order.getTrangThai())) {
            // throw new RuntimeException("Order not in Payment state");
            // For safety, maybe allow if HOAN_THANH for debt payment?
            // TS Logic: Strict CHO_THANH_TOAN check.
            if (!"HOAN_THANH".equals(order.getTrangThai())) {
                throw new RuntimeException("Đơn hàng chưa ở trạng thái chờ thanh toán");
            }
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền phải lớn hơn 0");
        }

        BigDecimal grandTotal = order.getTongCong();
        BigDecimal currentPaid = order.getSoTienDaTra() != null ? order.getSoTienDaTra() : BigDecimal.ZERO;
        BigDecimal newPaid = currentPaid.add(amount);

        if (newPaid.compareTo(grandTotal) > 0) {
            throw new RuntimeException("Số tiền vượt quá tổng cộng");
        }

        BigDecimal newDebt = grandTotal.subtract(newPaid);

        order.setSoTienDaTra(newPaid);
        order.setCongNo(newDebt.compareTo(BigDecimal.ZERO) > 0 ? newDebt : BigDecimal.ZERO);
        order.setPhuongThuc(method);

        boolean completed = newDebt.compareTo(BigDecimal.ZERO) == 0;

        if (completed) {
            order.setNgayThanhToan(LocalDateTime.now());
            order.setTrangThai("HOAN_THANH");
        }

        orderRepository.save(order);

        if (completed) {
            // Rule 9.4.2: Notify Sale Owner (Not just Admin)
            Integer saleId = order.getNguoiPhuTrach() != null ? order.getNguoiPhuTrach().getId() : null;
            if (saleId != null) {
                notificationRepository.save(Notification.builder()
                        .userId(saleId) // Targeted
                        .role("SALE")
                        .title("Thanh toán đủ: " + order.getPhieuTiepNhan().getXe().getBienSo())
                        .content("Đã thanh toán đủ " + grandTotal + ". Đơn hàng đã hoàn thành.")
                        .type("SUCCESS")
                        .link("/sale/orders/" + orderId)
                        .createdAt(LocalDateTime.now())
                        .isRead(false)
                        .build());
            }

            // Send Invoice Email
            try {
                String customerEmail = order.getPhieuTiepNhan().getXe().getKhachHang().getEmail();
                emailService.sendInvoiceEmail(order, customerEmail);
            } catch (Exception e) {
                // Log error but don't fail transaction
                System.err.println("Failed to send email: " + e.getMessage());
            }
        }
    }
}
