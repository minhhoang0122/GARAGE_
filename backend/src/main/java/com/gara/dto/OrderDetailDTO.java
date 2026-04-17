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
        BigDecimal vatPercent,
        BigDecimal finalAmount,
        BigDecimal paidAmount,
        BigDecimal deposit,
        BigDecimal partsAmount,
        BigDecimal laborAmount,
        Integer thoChanDoanId,
        String advisorName,
        String advisorAvatar,
        String foremanName,
        String foremanAvatar,
        Integer receptionId,
        String uuid,
        List<OrderItemDTO> items,
        List<FinancialTransactionDTO> transactions) {

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
        private BigDecimal vatPercent;
        private BigDecimal finalAmount;
        private BigDecimal paidAmount;
        private BigDecimal deposit;
        private BigDecimal partsAmount;
        private BigDecimal laborAmount;
        private Integer thoChanDoanId;
        private String advisorName;
        private String advisorAvatar;
        private String foremanName;
        private String foremanAvatar;
        private Integer receptionId;
        private String uuid;
        private List<OrderItemDTO> items;
        private List<FinancialTransactionDTO> transactions;

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

        public OrderDetailDTOBuilder vatPercent(BigDecimal vatPercent) {
            this.vatPercent = vatPercent;
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

        public OrderDetailDTOBuilder partsAmount(BigDecimal partsAmount) {
            this.partsAmount = partsAmount;
            return this;
        }

        public OrderDetailDTOBuilder laborAmount(BigDecimal laborAmount) {
            this.laborAmount = laborAmount;
            return this;
        }

        public OrderDetailDTOBuilder thoChanDoanId(Integer thoChanDoanId) {
            this.thoChanDoanId = thoChanDoanId;
            return this;
        }

        public OrderDetailDTOBuilder advisorName(String advisorName) {
            this.advisorName = advisorName;
            return this;
        }

        public OrderDetailDTOBuilder advisorAvatar(String advisorAvatar) {
            this.advisorAvatar = advisorAvatar;
            return this;
        }

        public OrderDetailDTOBuilder foremanName(String foremanName) {
            this.foremanName = foremanName;
            return this;
        }

        public OrderDetailDTOBuilder foremanAvatar(String foremanAvatar) {
            this.foremanAvatar = foremanAvatar;
            return this;
        }

        public OrderDetailDTOBuilder receptionId(Integer receptionId) {
            this.receptionId = receptionId;
            return this;
        }

        public OrderDetailDTOBuilder uuid(String uuid) {
            this.uuid = uuid;
            return this;
        }

        public OrderDetailDTOBuilder items(List<OrderItemDTO> items) {
            this.items = items;
            return this;
        }
        
        public OrderDetailDTOBuilder transactions(List<FinancialTransactionDTO> transactions) {
            this.transactions = transactions;
            return this;
        }

        public OrderDetailDTO build() {
            return new OrderDetailDTO(id, status, createdAt, customerName, customerPhone, plateNumber, carBrand,
                    carModel, totalAmount, discount, tax, vatPercent, finalAmount, paidAmount, deposit, 
                    partsAmount, laborAmount, thoChanDoanId, 
                    advisorName, advisorAvatar, foremanName, foremanAvatar, receptionId, uuid, items, transactions);
        }
    }
}
