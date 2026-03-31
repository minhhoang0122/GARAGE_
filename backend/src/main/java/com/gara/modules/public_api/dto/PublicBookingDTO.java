package com.gara.modules.public_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

public record PublicBookingDTO(
        @NotBlank(message = "Họ tên không được để trống") @Size(max = 100, message = "Họ tên tối đa 100 ký tự") String fullName,
        @NotBlank(message = "Số điện thoại không được để trống") @Size(max = 15, message = "Số điện thoại tối đa 15 ký tự") String phone,
        @Size(max = 100, message = "Email tối đa 100 ký tự") String email,
        @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự") String address,
        @Size(max = 15, message = "Biển số tối đa 15 ký tự") String licensePlate,
        @Size(max = 50, message = "Model tối đa 50 ký tự") String model,
        LocalDateTime appointmentTime,
        @Size(max = 1000, message = "Ghi chú tối đa 1000 ký tự") String notes,
        List<Integer> selectedServiceIds,
        Integer userId) {
}
