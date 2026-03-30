package com.gara.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProposalItemDTO {
    private Integer id;
    private Integer productId;
    private String productCode;
    private String productName;
    private Double quantity;
    private BigDecimal unitPrice;
    private String note;
    private Boolean isService;
    private String status;
    private Boolean isTechnicalAddition;
    private String proposedByName;
    private String proposedByRole;
    private String proposedAt;
}
