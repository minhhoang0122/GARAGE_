package com.gara.dto;

import java.math.BigDecimal;

public record ProductDTO(
                Integer id,
                String code,
                String name,
                BigDecimal price,
                BigDecimal costPrice,
                Integer stock,
                Integer minStock,
                Boolean isService,
                BigDecimal vatRate,
                Boolean allowWarranty) {

        public static ProductDTOBuilder builder() {
                return new ProductDTOBuilder();
        }

        public static class ProductDTOBuilder {
                private Integer id;
                private String code;
                private String name;
                private BigDecimal price;
                private BigDecimal costPrice;
                private Integer stock;
                private Integer minStock;
                private Boolean isService;
                private BigDecimal vatRate;
                private Boolean allowWarranty;

                public ProductDTOBuilder id(Integer id) {
                        this.id = id;
                        return this;
                }

                public ProductDTOBuilder code(String code) {
                        this.code = code;
                        return this;
                }

                public ProductDTOBuilder name(String name) {
                        this.name = name;
                        return this;
                }

                public ProductDTOBuilder price(BigDecimal price) {
                        this.price = price;
                        return this;
                }

                public ProductDTOBuilder costPrice(BigDecimal costPrice) {
                        this.costPrice = costPrice;
                        return this;
                }

                public ProductDTOBuilder stock(Integer stock) {
                        this.stock = stock;
                        return this;
                }

                public ProductDTOBuilder minStock(Integer minStock) {
                        this.minStock = minStock;
                        return this;
                }

                public ProductDTOBuilder isService(Boolean isService) {
                        this.isService = isService;
                        return this;
                }

                public ProductDTOBuilder vatRate(BigDecimal vatRate) {
                        this.vatRate = vatRate;
                        return this;
                }

                public ProductDTOBuilder allowWarranty(Boolean allowWarranty) {
                        this.allowWarranty = allowWarranty;
                        return this;
                }

                public ProductDTO build() {
                        return new ProductDTO(id, code, name, price, costPrice, stock, minStock, isService, vatRate,
                                        allowWarranty);
                }
        }
}
