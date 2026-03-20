package com.gara.modules.public_api.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PublicBookingDTO(
        String hoTen,
        String soDienThoai,
        String email,
        String diaChi,
        String bienSoXe,
        String modelXe,
        LocalDateTime ngayHen,
        String ghiChu,
        List<Integer> selectedServiceIds,
        Integer userId) {
}
