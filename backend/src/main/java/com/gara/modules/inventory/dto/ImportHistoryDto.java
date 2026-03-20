package com.gara.modules.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Modern Java 25 Record for Import History
 * Shorter (no boilerplate), More Secure (immutable and type-safe)
 */
public record ImportHistoryDto(
                Integer id,
                String code,
                LocalDateTime date,
                String supplier,
                BigDecimal total,
                String creator,
                String status,
                List<ImportItemDto> items) {
}
