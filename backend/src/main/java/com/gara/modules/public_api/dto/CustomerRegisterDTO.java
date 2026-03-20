package com.gara.modules.public_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for customer self-registration
 */
public record CustomerRegisterDTO(
        @NotBlank(message = "Họ tên không được để trống") String hoTen,
        @NotBlank(message = "Số điện thoại không được để trống") @Size(min = 9, max = 15) String soDienThoai,
        String email,
        String diaChi,
        @NotBlank(message = "Mật khẩu không được để trống") @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự") String matKhau) {
}
