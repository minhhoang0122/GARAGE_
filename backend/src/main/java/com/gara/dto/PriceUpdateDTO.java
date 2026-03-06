package com.gara.dto;

import java.math.BigDecimal;

public record PriceUpdateDTO(
        Integer productId,
        BigDecimal newPrice) {
}
