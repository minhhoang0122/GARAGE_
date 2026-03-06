package com.gara.modules.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Modern Java 25 Record for Import Items
 */
public record ImportItemDto(
                Integer batchId,
                String productName,
                Integer quantity,
                BigDecimal price,
                LocalDate expiryDate) {
}
