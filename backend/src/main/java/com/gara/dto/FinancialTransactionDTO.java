package com.gara.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FinancialTransactionDTO(
                Integer id,
                BigDecimal amount,
                String type,
                String method,
                String referenceCode,
                String note,
                LocalDateTime createdAt,
                String createdBy) {

        public static FinancialTransactionDTOBuilder builder() {
                return new FinancialTransactionDTOBuilder();
        }

        public static class FinancialTransactionDTOBuilder {
                private Integer id;
                private BigDecimal amount;
                private String type;
                private String method;
                private String referenceCode;
                private String note;
                private LocalDateTime createdAt;
                private String createdBy;

                public FinancialTransactionDTOBuilder id(Integer id) {
                        this.id = id;
                        return this;
                }

                public FinancialTransactionDTOBuilder amount(BigDecimal amount) {
                        this.amount = amount;
                        return this;
                }

                public FinancialTransactionDTOBuilder type(String type) {
                        this.type = type;
                        return this;
                }

                public FinancialTransactionDTOBuilder method(String method) {
                        this.method = method;
                        return this;
                }

                public FinancialTransactionDTOBuilder referenceCode(String referenceCode) {
                        this.referenceCode = referenceCode;
                        return this;
                }

                public FinancialTransactionDTOBuilder note(String note) {
                        this.note = note;
                        return this;
                }

                public FinancialTransactionDTOBuilder createdAt(LocalDateTime createdAt) {
                        this.createdAt = createdAt;
                        return this;
                }

                public FinancialTransactionDTOBuilder createdBy(String createdBy) {
                        this.createdBy = createdBy;
                        return this;
                }

                public FinancialTransactionDTO build() {
                        return new FinancialTransactionDTO(id, amount, type, method, referenceCode, note, createdAt,
                                        createdBy);
                }
        }
}
