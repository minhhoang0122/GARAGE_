package com.gara.dto;

import java.math.BigDecimal;

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
                Integer proposedById,
                String proposedByName,
                Boolean isWarranty) {

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
                private Integer proposedById;
                private String proposedByName;
                private Boolean isWarranty;

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

                public OrderItemDTOBuilder proposedById(Integer proposedById) {
                        this.proposedById = proposedById;
                        return this;
                }

                public OrderItemDTOBuilder proposedByName(String proposedByName) {
                        this.proposedByName = proposedByName;
                        return this;
                }

                public OrderItemDTOBuilder isWarranty(Boolean isWarranty) {
                        this.isWarranty = isWarranty;
                        return this;
                }

                public OrderItemDTO build() {
                        return new OrderItemDTO(id, productId, productCode, productName, quantity, unitPrice,
                                        totalPrice, discountPercent, type, itemStatus, proposedById, proposedByName,
                                        isWarranty);
                }
        }
}
