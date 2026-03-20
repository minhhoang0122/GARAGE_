package com.gara.modules.service.service;

import com.gara.entity.OrderItem;
import com.gara.entity.RepairOrder;
import com.gara.entity.enums.ItemStatus;
import com.gara.modules.service.repository.RepairOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Centrally manages all financial calculations for RepairOrders.
 * This prevents inconsistent VAT or Total logic across Sale, Mechanic, and
 * Finance modules.
 */
@Service
public class OrderCalculationService {

    private final RepairOrderRepository orderRepository;

    public OrderCalculationService(RepairOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Recalculates all totals for an order, including VAT per item and order
     * totals.
     * Logic:
     * - Goods use their own individual VAT.
     * - Services use a global SERVICE_VAT_RATE.
     * - VAT is calculated per line item and persisted.
     * - Order totals are aggregated from line items.
     * 
     * @param order The order to recalculate.
     */
    @Transactional
    public void recalculateTotals(RepairOrder order) {
        List<OrderItem> items = order.getChiTietDonHang();
        BigDecimal totalParts = BigDecimal.ZERO;
        BigDecimal totalLabor = BigDecimal.ZERO;

        if (items != null) {
            for (OrderItem item : items) {
                // Skip items rejected by customer
                if (ItemStatus.KHACH_TU_CHOI.equals(item.getTrangThai())) {
                    continue;
                }

                BigDecimal qty = BigDecimal.valueOf(item.getSoLuong());
                BigDecimal unitPrice = item.getDonGiaGoc();

                // Simple Line Gross Total (Price * Qty)
                BigDecimal lineSubtotal = unitPrice.multiply(qty);
                
                // Clear per-item tax/discount to avoid confusion in DB
                item.setGiamGiaTien(BigDecimal.ZERO);
                item.setGiamGiaPhanTram(BigDecimal.ZERO);
                item.setTienThue(BigDecimal.ZERO);
                item.setThanhTien(lineSubtotal);

                // Aggregate by type (Parts vs Labor)
                if (item.getHangHoa() != null && item.getHangHoa().getLaDichVu()) {
                    totalLabor = totalLabor.add(lineSubtotal);
                } else {
                    totalParts = totalParts.add(lineSubtotal);
                }
            }
        }

        applyTotals(order, totalParts, totalLabor);
    }

    /**
     * Optimized: Updates totals incrementally without loading the full item list.
     * Use this for single-item updates (status toggle, price change).
     */
    @Transactional
    public void updateTotalsIncrementally(Integer orderId, BigDecimal delta, boolean isLabor) {
        // Fetch order basic info (No items)
        RepairOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        BigDecimal currentParts = order.getTongTienHang() != null ? order.getTongTienHang() : BigDecimal.ZERO;
        BigDecimal currentLabor = order.getTongTienCong() != null ? order.getTongTienCong() : BigDecimal.ZERO;

        if (isLabor) {
            currentLabor = currentLabor.add(delta);
        } else {
            currentParts = currentParts.add(delta);
        }

        applyTotals(order, currentParts, currentLabor);
    }

    private void applyTotals(RepairOrder order, BigDecimal totalParts, BigDecimal totalLabor) {
        // 1. Update Subtotals
        order.setTongTienHang(totalParts);
        order.setTongTienCong(totalLabor);

        // 2. Apply Global Discount
        BigDecimal discount = order.getChietKhauTong() != null ? order.getChietKhauTong() : BigDecimal.ZERO;
        BigDecimal subtotalAfterDiscount = totalParts.add(totalLabor).subtract(discount);
        if (subtotalAfterDiscount.compareTo(BigDecimal.ZERO) < 0) subtotalAfterDiscount = BigDecimal.ZERO;

        // 3. Apply Global VAT
        BigDecimal vatRate = order.getVatPhanTram() != null ? order.getVatPhanTram() : BigDecimal.ZERO;
        BigDecimal totalTax = subtotalAfterDiscount.multiply(vatRate)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        
        order.setThueVAT(totalTax);

        // 4. Final Grand Total
        BigDecimal grandTotal = subtotalAfterDiscount.add(totalTax);
        order.setTongCong(grandTotal);

        // 5. Update Debt
        BigDecimal amountPaid = order.getSoTienDaTra() != null ? order.getSoTienDaTra() : BigDecimal.ZERO;
        BigDecimal debt = grandTotal.subtract(amountPaid);
        order.setCongNo(debt.compareTo(BigDecimal.ZERO) > 0 ? debt : BigDecimal.ZERO);

        orderRepository.save(order);
    }
}
