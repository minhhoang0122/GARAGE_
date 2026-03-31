package com.gara.modules.public_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for verifying customer registration via OTP
 */
public record VerifyRegistrationDTO(
        @NotBlank(message = "Email không được để trống") @Size(max = 100, message = "Email tối đa 100 ký tự") String email,
        @NotBlank(message = "Mã xác thực không được để trống") @Size(max = 10, message = "Mã xác thực tối đa 10 ký tự") String code) {
}
