package com.gara.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ReceptionFormData(
        @NotBlank(message = "Biển số xe không được để trống") @Size(max = 15, message = "Biển số tối đa 15 ký tự") String bienSo,
        @NotNull(message = "Số km (ODO) không được để trống") @Min(value = 0, message = "ODO không thể nhỏ hơn 0") @Max(value = 1000000, message = "ODO tối đa 1.000.000 km") Integer odo,
        @Size(max = 50, message = "Nhãn hiệu tối đa 50 ký tự") String nhanHieu,
        @Size(max = 50, message = "Model tối đa 50 ký tự") String model,
        @Size(max = 50, message = "Số khung tối đa 50 ký tự") String soKhung,
        @Size(max = 50, message = "Số máy tối đa 50 ký tự") String soMay,
        @NotBlank(message = "Tên khách hàng không được để trống") @Size(max = 100, message = "Tên khách hàng tối đa 100 ký tự") String tenKhach,
        @NotBlank(message = "Số điện thoại không được để trống") @Pattern(regexp = "^(\\+84|0)[0-9\\s.-]{9,15}$", message = "Số điện thoại không hợp lệ") @Size(max = 15, message = "Số điện thoại tối đa 15 ký tự") String sdtKhach,
        @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự") String diaChiKhach,
        @Size(max = 100, message = "Email tối đa 100 ký tự") String emailKhach,
        @Min(value = 0, message = "Mức xăng không thể âm") @Max(value = 100, message = "Mức xăng tối đa 100%") Double mucXang,
        @Size(max = 1000, message = "Tình trạng vỏ tối đa 1000 ký tự") String tinhTrangVo,
        @Size(max = 1000, message = "Yêu cầu tối đa 1000 ký tự") String yeuCauKhach,
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
