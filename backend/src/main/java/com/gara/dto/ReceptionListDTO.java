package com.gara.dto;

import java.time.LocalDateTime;

public record ReceptionListDTO(
        Integer id,
        LocalDateTime ngayGio,
        String xeBienSo,
        String khachHangName,
        String khachHangPhone,
        String xeNhanHieu,
        String xeModel,
        Integer orderId,
        String trangThai,
        String hinhAnh,
        String receptionistName,
        String receptionistAvatar) {
}
