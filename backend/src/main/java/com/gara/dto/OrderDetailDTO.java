package com.gara.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDetailDTO(
        Integer id,
        String status,
        LocalDateTime createdAt,
        String customerName,
        String customerPhone,
        String plateNumber,
        String carBrand,
        String carModel,
        BigDecimal totalAmount,
        BigDecimal discount,
        BigDecimal tax,
        BigDecimal finalAmount,
        BigDecimal paidAmount,
        BigDecimal deposit,
        Integer thoChanDoanId,
        List<OrderItemDTO> items) {

    public static OrderDetailDTOBuilder builder() {
        return new OrderDetailDTOBuilder();
    }

    public static class OrderDetailDTOBuilder {
        private Integer id;
        private String status;
        private LocalDateTime createdAt;
        private String customerName;
        private String customerPhone;
        private String plateNumber;
        private String carBrand;
        private String carModel;
        private BigDecimal totalAmount;
        private BigDecimal discount;
        private BigDecimal tax;
        private BigDecimal finalAmount;
        private BigDecimal paidAmount;
        private BigDecimal deposit;
        private Integer thoChanDoanId;
        private List<OrderItemDTO> items;

        public OrderDetailDTOBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public OrderDetailDTOBuilder status(String status) {
            this.status = status;
            return this;
        }

        public OrderDetailDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public OrderDetailDTOBuilder customerName(String customerName) {
            this.customerName = customerName;
            return this;
        }

        public OrderDetailDTOBuilder customerPhone(String customerPhone) {
            this.customerPhone = customerPhone;
            return this;
        }

        public OrderDetailDTOBuilder plateNumber(String plateNumber) {
            this.plateNumber = plateNumber;
            return this;
        }

        public OrderDetailDTOBuilder carBrand(String carBrand) {
            this.carBrand = carBrand;
            return this;
        }

        public OrderDetailDTOBuilder carModel(String carModel) {
            this.carModel = carModel;
            return this;
        }

        public OrderDetailDTOBuilder totalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
            return this;
        }

        public OrderDetailDTOBuilder discount(BigDecimal discount) {
            this.discount = discount;
            return this;
        }

        public OrderDetailDTOBuilder tax(BigDecimal tax) {
            this.tax = tax;
            return this;
        }

        public OrderDetailDTOBuilder finalAmount(BigDecimal finalAmount) {
            this.finalAmount = finalAmount;
            return this;
        }

        public OrderDetailDTOBuilder paidAmount(BigDecimal paidAmount) {
            this.paidAmount = paidAmount;
            return this;
        }

        public OrderDetailDTOBuilder deposit(BigDecimal deposit) {
            this.deposit = deposit;
            return this;
        }

        public OrderDetailDTOBuilder thoChanDoanId(Integer thoChanDoanId) {
            this.thoChanDoanId = thoChanDoanId;
            return this;
        }

        public OrderDetailDTOBuilder items(List<OrderItemDTO> items) {
            this.items = items;
            return this;
        }

        public OrderDetailDTO build() {
            return new OrderDetailDTO(id, status, createdAt, customerName, customerPhone, plateNumber, carBrand,
                    carModel, totalAmount, discount, tax, finalAmount, paidAmount, deposit, thoChanDoanId, items);
        }
    }
}
