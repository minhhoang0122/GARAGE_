package com.gara.modules.public_api.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for verifying customer registration via OTP
 */
public record VerifyRegistrationDTO(
        @NotBlank(message = "Email không được để trống") String email,
        @NotBlank(message = "Mã xác thực không được để trống") String code) {
}
