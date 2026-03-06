package com.gara.dto;

import java.math.BigDecimal;

public record DebtDTO(
        Integer customerId,
        String customerName,
        String phoneNumber,
        BigDecimal totalDebt,
        Long orderCount) {
}
