package com.gara.dto;

import java.math.BigDecimal;

public record ProposalItemDTO(
        Integer id,
        Integer productId,
        String productCode,
        String productName,
        Double quantity,
        BigDecimal unitPrice,
        String note,
        Boolean isService,
        String status,
        Boolean isTechnicalAddition,
        String proposedByName,
        String proposedByRole,
        String proposedAt
) {
    public static ProposalItemDTOBuilder builder() {
        return new ProposalItemDTOBuilder();
    }

    public static class ProposalItemDTOBuilder {
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

        public ProposalItemDTOBuilder id(Integer id) { this.id = id; return this; }
        public ProposalItemDTOBuilder productId(Integer productId) { this.productId = productId; return this; }
        public ProposalItemDTOBuilder productCode(String productCode) { this.productCode = productCode; return this; }
        public ProposalItemDTOBuilder productName(String productName) { this.productName = productName; return this; }
        public ProposalItemDTOBuilder quantity(Double quantity) { this.quantity = quantity; return this; }
        public ProposalItemDTOBuilder unitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; return this; }
        public ProposalItemDTOBuilder note(String note) { this.note = note; return this; }
        public ProposalItemDTOBuilder isService(Boolean isService) { this.isService = isService; return this; }
        public ProposalItemDTOBuilder status(String status) { this.status = status; return this; }
        public ProposalItemDTOBuilder isTechnicalAddition(Boolean isTechnicalAddition) { this.isTechnicalAddition = isTechnicalAddition; return this; }
        public ProposalItemDTOBuilder proposedByName(String proposedByName) { this.proposedByName = proposedByName; return this; }
        public ProposalItemDTOBuilder proposedByRole(String proposedByRole) { this.proposedByRole = proposedByRole; return this; }
        public ProposalItemDTOBuilder proposedAt(String proposedAt) { this.proposedAt = proposedAt; return this; }

        public ProposalItemDTO build() {
            return new ProposalItemDTO(id, productId, productCode, productName, quantity, unitPrice, note,
                    isService, status, isTechnicalAddition, proposedByName, proposedByRole, proposedAt);
        }
    }
}
