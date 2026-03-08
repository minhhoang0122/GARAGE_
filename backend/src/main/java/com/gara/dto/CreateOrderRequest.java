package com.gara.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateOrderRequest(
                @NotBlank(message = "Tên khách hàng không được để trống") String customerName,
                @NotBlank(message = "Số điện thoại không được để trống") @Pattern(regexp = "^(0|\\+84)[0-9]{8,9}$", message = "Số điện thoại không hợp lệ") String customerPhone,
                @NotBlank(message = "Biển số xe không được để trống") String plateNumber,
                String carBrand,
                String carModel,
                String description) {
}
