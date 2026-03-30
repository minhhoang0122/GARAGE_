package com.gara.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class JobItemDTO {
    private Integer id;
    private String name;
    private String sku;
    private Double quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private Boolean isService;
    private String status;
    private Boolean isCompleted;
    private LocalDateTime suggestedAt;
    private List<Map<String, Object>> mechanics;
}
