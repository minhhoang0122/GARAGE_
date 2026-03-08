package com.gara.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.Valid;

public record ImportRequestDTO(
        @NotBlank(message = "Tên nhà cung cấp không được để trống") String supplierName,
        String note,
        @NotEmpty(message = "Danh sách sản phẩm nhập không được rỗng") @Valid List<ImportItemDTO> items) {

    public static ImportRequestDTOBuilder builder() {
        return new ImportRequestDTOBuilder();
    }

    public static class ImportRequestDTOBuilder {
        private String supplierName;
        private String note;
        private List<ImportItemDTO> items;

        public ImportRequestDTOBuilder supplierName(String supplierName) {
            this.supplierName = supplierName;
            return this;
        }

        public ImportRequestDTOBuilder note(String note) {
            this.note = note;
            return this;
        }

        public ImportRequestDTOBuilder items(List<ImportItemDTO> items) {
            this.items = items;
            return this;
        }

        public ImportRequestDTO build() {
            return new ImportRequestDTO(supplierName, note, items);
        }
    }

    public record ImportItemDTO(
            @NotNull(message = "Sản phẩm không được để trống") Integer productId,
            @NotNull(message = "Số lượng không được để trống") @Min(value = 1, message = "Số lượng phải lớn hơn 0") Integer quantity,
            @NotNull(message = "Giá nhập không được để trống") @Min(value = 0, message = "Giá nhập không hợp lệ") BigDecimal costPrice,
            @NotNull(message = "Thuế VAT không được để trống") @Min(value = 0, message = "Thuế VAT không hợp lệ") BigDecimal vatRate,
            LocalDate expiryDate,
            BigDecimal sellingPrice,
            Boolean updateGlobalPrice) {

        public static ImportItemDTOBuilder builder() {
            return new ImportItemDTOBuilder();
        }

        public static class ImportItemDTOBuilder {
            private Integer productId;
            private Integer quantity;
            private BigDecimal costPrice;
            private BigDecimal vatRate;
            private LocalDate expiryDate;
            private BigDecimal sellingPrice;
            private Boolean updateGlobalPrice;

            public ImportItemDTOBuilder productId(Integer productId) {
                this.productId = productId;
                return this;
            }

            public ImportItemDTOBuilder quantity(Integer quantity) {
                this.quantity = quantity;
                return this;
            }

            public ImportItemDTOBuilder costPrice(BigDecimal costPrice) {
                this.costPrice = costPrice;
                return this;
            }

            public ImportItemDTOBuilder vatRate(BigDecimal vatRate) {
                this.vatRate = vatRate;
                return this;
            }

            public ImportItemDTOBuilder expiryDate(LocalDate expiryDate) {
                this.expiryDate = expiryDate;
                return this;
            }

            public ImportItemDTOBuilder sellingPrice(BigDecimal sellingPrice) {
                this.sellingPrice = sellingPrice;
                return this;
            }

            public ImportItemDTOBuilder updateGlobalPrice(Boolean updateGlobalPrice) {
                this.updateGlobalPrice = updateGlobalPrice;
                return this;
            }

            public ImportItemDTO build() {
                return new ImportItemDTO(productId, quantity, costPrice, vatRate, expiryDate, sellingPrice,
                        updateGlobalPrice);
            }
        }
    }
}
