package com.gara.modules.service.service;

import com.gara.entity.OrderItem;
import com.gara.entity.RepairOrder;
import com.gara.entity.SystemConfig;
import com.gara.entity.enums.ItemStatus;
import com.gara.modules.system.repository.SystemConfigRepository;
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

    private final SystemConfigRepository systemConfigRepository;
    private final RepairOrderRepository orderRepository;

    public OrderCalculationService(SystemConfigRepository systemConfigRepository,
            RepairOrderRepository orderRepository) {
        this.systemConfigRepository = systemConfigRepository;
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
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        // Fetch global VAT for services
        BigDecimal serviceVatRate = systemConfigRepository.findByConfigKey("SERVICE_VAT_RATE")
                .map(SystemConfig::getConfigValue)
                .map(v -> new BigDecimal(v))
                .orElse(new BigDecimal("10"));

        // Fetch tax inclusion policy
        boolean pricesIncludeVat = systemConfigRepository.findByConfigKey("PRICES_INCLUDE_VAT")
                .map(SystemConfig::getConfigValue)
                .map(v -> "true".equalsIgnoreCase(v))
                .orElse(false);

        if (items != null) {
            for (OrderItem item : items) {
                // Skip items rejected by customer
                if (ItemStatus.KHACH_TU_CHOI.equals(item.getTrangThai())) {
                    continue;
                }

                BigDecimal qty = BigDecimal.valueOf(item.getSoLuong());
                BigDecimal unitPrice = item.getDonGiaGoc();

                // 1. Line Gross Total (Price * Qty)
                BigDecimal lineSubtotal = unitPrice.multiply(qty);

                // 2. VAT Rate
                BigDecimal vatRate = item.getVatPhanTram();
                if (vatRate == null) {
                    if (item.getHangHoa().getLaDichVu()) {
                        vatRate = serviceVatRate;
                    } else {
                        vatRate = item.getHangHoa().getThueVAT() != null
                                ? item.getHangHoa().getThueVAT()
                                : new BigDecimal("10");
                    }
                    item.setVatPhanTram(vatRate);
                }

                // 3. Discount Calculation (Applied on Net Total)
                BigDecimal discount = BigDecimal.ZERO;
                if (item.getGiamGiaPhanTram() != null && item.getGiamGiaPhanTram().compareTo(BigDecimal.ZERO) > 0) {
                    discount = lineSubtotal.multiply(item.getGiamGiaPhanTram())
                            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                } else if (item.getGiamGiaTien() != null) {
                    discount = item.getGiamGiaTien();
                }
                item.setGiamGiaTien(discount);
                totalDiscount = totalDiscount.add(discount);

                BigDecimal lineAfterDiscount = lineSubtotal.subtract(discount);
                if (lineAfterDiscount.compareTo(BigDecimal.ZERO) < 0) lineAfterDiscount = BigDecimal.ZERO;

                BigDecimal netTotalItem;
                BigDecimal taxAmount;

                if (pricesIncludeVat) {
                    // Bug 108 Fix: Tax = Total - (Total / (1 + rate%)) 
                    // Calculate on discounted total
                    BigDecimal divisor = BigDecimal.ONE.add(
                            vatRate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
                    netTotalItem = lineAfterDiscount.divide(divisor, 2, RoundingMode.HALF_UP);
                    taxAmount = lineAfterDiscount.subtract(netTotalItem);
                } else {
                    // Bug 108 Fix: Tax = Discounted Total * rate%
                    netTotalItem = lineAfterDiscount;
                    taxAmount = netTotalItem.multiply(vatRate)
                            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP); // Standardized to 2
                }

                // 4. Final Totals
                item.setTienThue(taxAmount);
                totalTax = totalTax.add(taxAmount);

                BigDecimal finalTotalItem = netTotalItem.add(taxAmount); // This is just lineAfterDiscount for inclusive
                item.setThanhTien(finalTotalItem);

                // Aggregate by type
                if (item.getHangHoa().getLaDichVu()) {
                    totalLabor = totalLabor.add(netTotalItem);
                } else {
                    totalParts = totalParts.add(netTotalItem);
                }
            }
        }

        order.setTongTienHang(totalParts);
        order.setTongTienCong(totalLabor);
        order.setChietKhauTong(totalDiscount);
        order.setThueVAT(totalTax);

        BigDecimal grandTotal = totalParts.add(totalLabor).add(totalTax);
        order.setTongCong(grandTotal);

        // Update Debt
        BigDecimal amountPaid = order.getSoTienDaTra() != null ? order.getSoTienDaTra() : BigDecimal.ZERO;
        BigDecimal debt = grandTotal.subtract(amountPaid);
        order.setCongNo(debt.compareTo(BigDecimal.ZERO) > 0 ? debt : BigDecimal.ZERO);

        orderRepository.save(order);
    }
}
