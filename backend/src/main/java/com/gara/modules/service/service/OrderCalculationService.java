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
        List<OrderItem> items = order.getOrderItems();
        BigDecimal totalParts = BigDecimal.ZERO;
        BigDecimal totalLabor = BigDecimal.ZERO;

        if (items != null) {
            for (OrderItem item : items) {
                BigDecimal qty = BigDecimal.valueOf(item.getQuantity() != null ? item.getQuantity() : 0);
                BigDecimal unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;

                // Always sync individual line total
                BigDecimal lineSubtotal = unitPrice.multiply(qty);
                item.setTotalAmount(lineSubtotal);
                
                // Clear per-item tax/discount complexity for now
                item.setVatAmount(BigDecimal.ZERO);

                // Skip adding to order totals if rejected by customer
                if (ItemStatus.CUSTOMER_REJECTED.equals(item.getStatus())) {
                    continue;
                }

                // Aggregate by type (Parts vs Labor)
                if (item.getProduct() != null && item.getProduct().getIsService()) {
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
        // Fetch order basic info with pessimistic write lock to prevent race conditions during rapid concurrent clicks
        RepairOrder order = orderRepository.findByIdWithLock(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        BigDecimal currentParts = order.getPartsTotal() != null ? order.getPartsTotal() : BigDecimal.ZERO;
        BigDecimal currentLabor = order.getLaborTotal() != null ? order.getLaborTotal() : BigDecimal.ZERO;

        if (isLabor) {
            currentLabor = currentLabor.add(delta);
        } else {
            currentParts = currentParts.add(delta);
        }

        applyTotals(order, currentParts, currentLabor);
    }

    private void applyTotals(RepairOrder order, BigDecimal totalParts, BigDecimal totalLabor) {
        // 1. Update Subtotals
        order.setPartsTotal(totalParts);
        order.setLaborTotal(totalLabor);

        // 2. Apply Global Discount
        BigDecimal discount = order.getTotalDiscount() != null ? order.getTotalDiscount() : BigDecimal.ZERO;
        BigDecimal subtotalAfterDiscount = totalParts.add(totalLabor).subtract(discount);
        if (subtotalAfterDiscount.compareTo(BigDecimal.ZERO) < 0) subtotalAfterDiscount = BigDecimal.ZERO;

        // 3. Apply Global VAT
        BigDecimal vatRate = order.getVatPercentage() != null ? order.getVatPercentage() : BigDecimal.ZERO;
        BigDecimal totalTax = subtotalAfterDiscount.multiply(vatRate)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        
        order.setVatAmount(totalTax);

        // 4. Final Grand Total
        BigDecimal grandTotal = subtotalAfterDiscount.add(totalTax);
        order.setGrandTotal(grandTotal);

        // 5. Update Debt
        BigDecimal amountPaid = order.getAmountPaid() != null ? order.getAmountPaid() : BigDecimal.ZERO;
        BigDecimal debt = grandTotal.subtract(amountPaid);
        order.setBalanceDue(debt.compareTo(BigDecimal.ZERO) > 0 ? debt : BigDecimal.ZERO);

        orderRepository.save(order);
    }
}
