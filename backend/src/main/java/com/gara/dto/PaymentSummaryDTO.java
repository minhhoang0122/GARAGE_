package com.gara.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PaymentSummaryDTO(
        Integer orderId,
        String plate,
        String customerName,
        String customerPhone,
        BigDecimal grandTotal,
        BigDecimal amountPaid,
        BigDecimal debt,
        String paymentMethod,
        LocalDateTime paymentDate,
        String status,
        List<PaymentItemDTO> items) {

    public static PaymentSummaryDTOBuilder builder() {
        return new PaymentSummaryDTOBuilder();
    }

    public static class PaymentSummaryDTOBuilder {
        private Integer orderId;
        private String plate;
        private String customerName;
        private String customerPhone;
        private BigDecimal grandTotal;
        private BigDecimal amountPaid;
        private BigDecimal debt;
        private String paymentMethod;
        private LocalDateTime paymentDate;
        private String status;
        private List<PaymentItemDTO> items;

        public PaymentSummaryDTOBuilder orderId(Integer orderId) {
            this.orderId = orderId;
            return this;
        }

        public PaymentSummaryDTOBuilder plate(String plate) {
            this.plate = plate;
            return this;
        }

        public PaymentSummaryDTOBuilder customerName(String customerName) {
            this.customerName = customerName;
            return this;
        }

        public PaymentSummaryDTOBuilder customerPhone(String customerPhone) {
            this.customerPhone = customerPhone;
            return this;
        }

        public PaymentSummaryDTOBuilder grandTotal(BigDecimal grandTotal) {
            this.grandTotal = grandTotal;
            return this;
        }

        public PaymentSummaryDTOBuilder amountPaid(BigDecimal amountPaid) {
            this.amountPaid = amountPaid;
            return this;
        }

        public PaymentSummaryDTOBuilder debt(BigDecimal debt) {
            this.debt = debt;
            return this;
        }

        public PaymentSummaryDTOBuilder paymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public PaymentSummaryDTOBuilder paymentDate(LocalDateTime paymentDate) {
            this.paymentDate = paymentDate;
            return this;
        }

        public PaymentSummaryDTOBuilder status(String status) {
            this.status = status;
            return this;
        }

        public PaymentSummaryDTOBuilder items(List<PaymentItemDTO> items) {
            this.items = items;
            return this;
        }

        public PaymentSummaryDTO build() {
            return new PaymentSummaryDTO(orderId, plate, customerName, customerPhone, grandTotal, amountPaid, debt,
                    paymentMethod, paymentDate, status, items);
        }
    }

    public record PaymentItemDTO(
            Integer id,
            String name,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal discount,
            BigDecimal total,
            Boolean isService) {

        public static PaymentItemDTOBuilder builder() {
            return new PaymentItemDTOBuilder();
        }

        public static class PaymentItemDTOBuilder {
            private Integer id;
            private String name;
            private Integer quantity;
            private BigDecimal unitPrice;
            private BigDecimal discount;
            private BigDecimal total;
            private Boolean isService;

            public PaymentItemDTOBuilder id(Integer id) {
                this.id = id;
                return this;
            }

            public PaymentItemDTOBuilder name(String name) {
                this.name = name;
                return this;
            }

            public PaymentItemDTOBuilder quantity(Integer quantity) {
                this.quantity = quantity;
                return this;
            }

            public PaymentItemDTOBuilder unitPrice(BigDecimal unitPrice) {
                this.unitPrice = unitPrice;
                return this;
            }

            public PaymentItemDTOBuilder discount(BigDecimal discount) {
                this.discount = discount;
                return this;
            }

            public PaymentItemDTOBuilder total(BigDecimal total) {
                this.total = total;
                return this;
            }

            public PaymentItemDTOBuilder isService(Boolean isService) {
                this.isService = isService;
                return this;
            }

            public PaymentItemDTO build() {
                return new PaymentItemDTO(id, name, quantity, unitPrice, discount, total, isService);
            }
        }
    }
}
