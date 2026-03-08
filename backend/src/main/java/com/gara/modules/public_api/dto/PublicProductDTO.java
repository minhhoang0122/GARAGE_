package com.gara.modules.public_api.dto;

import java.math.BigDecimal;

/**
 * DTO dành cho khách hàng xem trên Web giới thiệu.
 * KHÔNG bao gồm giá vốn (cost price) hay các thông tin nội bộ.
 */
public record PublicProductDTO(
        Integer id,
        String maHang,
        String tenHang,
        BigDecimal giaBanNiemYet,
        BigDecimal thueVat,
        Boolean laDichVu,
        Integer baoHanhSoThang,
        Integer baoHanhKm) {
}
