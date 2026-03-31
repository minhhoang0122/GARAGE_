package com.gara.modules.public_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for customer self-registration
 */
public record CustomerRegisterDTO(
        @NotBlank(message = "Họ tên không được để trống") @Size(max = 100, message = "Họ tên tối đa 100 ký tự") String fullName,
        @NotBlank(message = "Số điện thoại không được để trống") @Size(min = 9, max = 15, message = "Số điện thoại từ 9-15 ký tự") String phone,
        @Size(max = 100, message = "Email tối đa 100 ký tự") String email,
        @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự") String address,
        @NotBlank(message = "Mật khẩu không được để trống") @Size(min = 6, max = 128, message = "Mật khẩu từ 6-128 ký tự") String password) {
}
