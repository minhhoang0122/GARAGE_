package com.gara.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ReceptionFormData(
        @NotBlank(message = "Biển số xe không được để trống") String bienSo,
        @NotNull(message = "Số km (ODO) không được để trống") Integer odo,
        String nhanHieu,
        String model,
        String soKhung,
        String soMay,
        @NotBlank(message = "Tên khách hàng không được để trống") String tenKhach,
        @NotBlank(message = "Số điện thoại không được để trống") @Pattern(regexp = "^(\\+84|0)[0-9\\s.-]{9,15}$", message = "Số điện thoại không hợp lệ") String sdtKhach,
        String diaChiKhach,
        String emailKhach,
        Double mucXang,
        String tinhTrangVo,
        String yeuCauKhach,
        String hinhAnh) {

    public static ReceptionFormDataBuilder builder() {
        return new ReceptionFormDataBuilder();
    }

    public static class ReceptionFormDataBuilder {
        private String bienSo;
        private Integer odo;
        private String nhanHieu;
        private String model;
        private String soKhung;
        private String soMay;
        private String tenKhach;
        private String sdtKhach;
        private String diaChiKhach;
        private String emailKhach;
        private Double mucXang;
        private String tinhTrangVo;
        private String yeuCauKhach;
        private String hinhAnh;

        public ReceptionFormDataBuilder bienSo(String bienSo) {
            this.bienSo = bienSo;
            return this;
        }

        public ReceptionFormDataBuilder odo(Integer odo) {
            this.odo = odo;
            return this;
        }

        public ReceptionFormDataBuilder nhanHieu(String nhanHieu) {
            this.nhanHieu = nhanHieu;
            return this;
        }

        public ReceptionFormDataBuilder model(String model) {
            this.model = model;
            return this;
        }

        public ReceptionFormDataBuilder soKhung(String soKhung) {
            this.soKhung = soKhung;
            return this;
        }

        public ReceptionFormDataBuilder soMay(String soMay) {
            this.soMay = soMay;
            return this;
        }

        public ReceptionFormDataBuilder tenKhach(String tenKhach) {
            this.tenKhach = tenKhach;
            return this;
        }

        public ReceptionFormDataBuilder sdtKhach(String sdtKhach) {
            this.sdtKhach = sdtKhach;
            return this;
        }

        public ReceptionFormDataBuilder diaChiKhach(String diaChiKhach) {
            this.diaChiKhach = diaChiKhach;
            return this;
        }

        public ReceptionFormDataBuilder emailKhach(String emailKhach) {
            this.emailKhach = emailKhach;
            return this;
        }

        public ReceptionFormDataBuilder mucXang(Double mucXang) {
            this.mucXang = mucXang;
            return this;
        }

        public ReceptionFormDataBuilder tinhTrangVo(String tinhTrangVo) {
            this.tinhTrangVo = tinhTrangVo;
            return this;
        }

        public ReceptionFormDataBuilder yeuCauKhach(String yeuCauKhach) {
            this.yeuCauKhach = yeuCauKhach;
            return this;
        }

        public ReceptionFormDataBuilder hinhAnh(String hinhAnh) {
            this.hinhAnh = hinhAnh;
            return this;
        }

        public ReceptionFormData build() {
            return new ReceptionFormData(bienSo, odo, nhanHieu, model, soKhung, soMay, tenKhach, sdtKhach, diaChiKhach,
                    emailKhach, mucXang, tinhTrangVo, yeuCauKhach, hinhAnh);
        }
    }
}
