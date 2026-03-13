package com.gara.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReceptionDetailDTO(
        Integer id,
        LocalDateTime ngayGio,
        BigDecimal mucXang,
        String tinhTrangVoXe,
        String yeuCauSoBo,
        String hinhAnh,
        Integer odo,
        
        // Vehicle Info
        String bienSo,
        String nhanHieu,
        String model,
        String soKhung,
        String soMay,
        
        // Customer Info
        String tenKhach,
        String sdtKhach,
        String diaChiKhach,
        String emailKhach,
        
        // Order Info
        Integer orderId,
        String orderStatus
) {
    public static ReceptionDetailDTOBuilder builder() {
        return new ReceptionDetailDTOBuilder();
    }

    public static class ReceptionDetailDTOBuilder {
        private Integer id;
        private LocalDateTime ngayGio;
        private BigDecimal mucXang;
        private String tinhTrangVoXe;
        private String yeuCauSoBo;
        private String hinhAnh;
        private Integer odo;
        private String bienSo;
        private String nhanHieu;
        private String model;
        private String soKhung;
        private String soMay;
        private String tenKhach;
        private String sdtKhach;
        private String diaChiKhach;
        private String emailKhach;
        private Integer orderId;
        private String orderStatus;

        public ReceptionDetailDTOBuilder id(Integer id) { this.id = id; return this; }
        public ReceptionDetailDTOBuilder ngayGio(LocalDateTime ngayGio) { this.ngayGio = ngayGio; return this; }
        public ReceptionDetailDTOBuilder mucXang(BigDecimal mucXang) { this.mucXang = mucXang; return this; }
        public ReceptionDetailDTOBuilder tinhTrangVoXe(String tinhTrangVoXe) { this.tinhTrangVoXe = tinhTrangVoXe; return this; }
        public ReceptionDetailDTOBuilder yeuCauSoBo(String yeuCauSoBo) { this.yeuCauSoBo = yeuCauSoBo; return this; }
        public ReceptionDetailDTOBuilder hinhAnh(String hinhAnh) { this.hinhAnh = hinhAnh; return this; }
        public ReceptionDetailDTOBuilder odo(Integer odo) { this.odo = odo; return this; }
        public ReceptionDetailDTOBuilder bienSo(String bienSo) { this.bienSo = bienSo; return this; }
        public ReceptionDetailDTOBuilder nhanHieu(String nhanHieu) { this.nhanHieu = nhanHieu; return this; }
        public ReceptionDetailDTOBuilder model(String model) { this.model = model; return this; }
        public ReceptionDetailDTOBuilder soKhung(String soKhung) { this.soKhung = soKhung; return this; }
        public ReceptionDetailDTOBuilder soMay(String soMay) { this.soMay = soMay; return this; }
        public ReceptionDetailDTOBuilder tenKhach(String tenKhach) { this.tenKhach = tenKhach; return this; }
        public ReceptionDetailDTOBuilder sdtKhach(String sdtKhach) { this.sdtKhach = sdtKhach; return this; }
        public ReceptionDetailDTOBuilder diaChiKhach(String diaChiKhach) { this.diaChiKhach = diaChiKhach; return this; }
        public ReceptionDetailDTOBuilder emailKhach(String emailKhach) { this.emailKhach = emailKhach; return this; }
        public ReceptionDetailDTOBuilder orderId(Integer orderId) { this.orderId = orderId; return this; }
        public ReceptionDetailDTOBuilder orderStatus(String orderStatus) { this.orderStatus = orderStatus; return this; }

        public ReceptionDetailDTO build() {
            return new ReceptionDetailDTO(id, ngayGio, mucXang, tinhTrangVoXe, yeuCauSoBo, hinhAnh, odo,
                    bienSo, nhanHieu, model, soKhung, soMay, tenKhach, sdtKhach, diaChiKhach, emailKhach,
                    orderId, orderStatus);
        }
    }
}
