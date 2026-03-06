package com.gara.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CustomerOrderDTO(
                Integer id,
                String plate,
                String status,
                LocalDateTime createdAt,
                BigDecimal total,
                BigDecimal paid,
                BigDecimal debt) {

        public static CustomerOrderDTOBuilder builder() {
                return new CustomerOrderDTOBuilder();
        }

        public static class CustomerOrderDTOBuilder {
                private Integer id;
                private String plate;
                private String status;
                private LocalDateTime createdAt;
                private BigDecimal total;
                private BigDecimal paid;
                private BigDecimal debt;

                public CustomerOrderDTOBuilder id(Integer id) {
                        this.id = id;
                        return this;
                }

                public CustomerOrderDTOBuilder plate(String plate) {
                        this.plate = plate;
                        return this;
                }

                public CustomerOrderDTOBuilder status(String status) {
                        this.status = status;
                        return this;
                }

                public CustomerOrderDTOBuilder createdAt(LocalDateTime createdAt) {
                        this.createdAt = createdAt;
                        return this;
                }

                public CustomerOrderDTOBuilder total(BigDecimal total) {
                        this.total = total;
                        return this;
                }

                public CustomerOrderDTOBuilder paid(BigDecimal paid) {
                        this.paid = paid;
                        return this;
                }

                public CustomerOrderDTOBuilder debt(BigDecimal debt) {
                        this.debt = debt;
                        return this;
                }

                public CustomerOrderDTO build() {
                        return new CustomerOrderDTO(id, plate, status, createdAt, total, paid, debt);
                }
        }
}
