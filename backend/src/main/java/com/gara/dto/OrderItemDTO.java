package com.gara.dto;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDateTime;

public record OrderItemDTO(
        Integer id,
        Integer productId,
        String productCode,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice,
        BigDecimal discountPercent,
        String type,
        String itemStatus,
        Integer stock,
        Integer proposedById,
        String proposedByName,
        String proposedByRole,
        Boolean isWarranty,
        Boolean isTechnicalAddition,
        LocalDateTime proposedAt,
        List<AssignmentDTO> assignments,
        Integer version) {

    public static OrderItemDTOBuilder builder() {
        return new OrderItemDTOBuilder();
    }

    public static class OrderItemDTOBuilder {
        private Integer id;
        private Integer productId;
        private String productCode;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private BigDecimal discountPercent;
        private String type;
        private String itemStatus;
        private Integer stock;
        private Integer proposedById;
        private String proposedByName;
        private String proposedByRole;
        private Boolean isWarranty;
        private Boolean isTechnicalAddition;
        private LocalDateTime proposedAt;
        private List<AssignmentDTO> assignments;
        private Integer version;

        public OrderItemDTOBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public OrderItemDTOBuilder productId(Integer productId) {
            this.productId = productId;
            return this;
        }

        public OrderItemDTOBuilder productCode(String productCode) {
            this.productCode = productCode;
            return this;
        }

        public OrderItemDTOBuilder productName(String productName) {
            this.productName = productName;
            return this;
        }

        public OrderItemDTOBuilder quantity(Integer quantity) {
            this.quantity = quantity;
            return this;
        }

        public OrderItemDTOBuilder unitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
            return this;
        }

        public OrderItemDTOBuilder totalPrice(BigDecimal totalPrice) {
            this.totalPrice = totalPrice;
            return this;
        }

        public OrderItemDTOBuilder discountPercent(BigDecimal discountPercent) {
            this.discountPercent = discountPercent;
            return this;
        }

        public OrderItemDTOBuilder type(String type) {
            this.type = type;
            return this;
        }

        public OrderItemDTOBuilder itemStatus(String itemStatus) {
            this.itemStatus = itemStatus;
            return this;
        }

        public OrderItemDTOBuilder stock(Integer stock) {
            this.stock = stock;
            return this;
        }

        public OrderItemDTOBuilder proposedById(Integer proposedById) {
            this.proposedById = proposedById;
            return this;
        }

        public OrderItemDTOBuilder proposedByName(String proposedByName) {
            this.proposedByName = proposedByName;
            return this;
        }

        public OrderItemDTOBuilder proposedByRole(String proposedByRole) {
            this.proposedByRole = proposedByRole;
            return this;
        }

        public OrderItemDTOBuilder isWarranty(Boolean isWarranty) {
            this.isWarranty = isWarranty;
            return this;
        }

        public OrderItemDTOBuilder isTechnicalAddition(Boolean isTechnicalAddition) {
            this.isTechnicalAddition = isTechnicalAddition;
            return this;
        }

        public OrderItemDTOBuilder proposedAt(LocalDateTime proposedAt) {
            this.proposedAt = proposedAt;
            return this;
        }

        public OrderItemDTOBuilder assignments(List<AssignmentDTO> assignments) {
            this.assignments = assignments;
            return this;
        }

        public OrderItemDTOBuilder version(Integer version) {
            this.version = version;
            return this;
        }

        public OrderItemDTO build() {
            return new OrderItemDTO(id, productId, productCode, productName, quantity, unitPrice,
                    totalPrice, discountPercent, type, itemStatus, stock, proposedById, proposedByName,
                    proposedByRole, isWarranty, isTechnicalAddition, proposedAt, assignments, version);
        }
    }
}
