package com.gara.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Xe", indexes = {
        @Index(name = "idx_bien_so", columnList = "BienSo", unique = true)
})
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "bien_so", length = 20, unique = true, nullable = false)
    private String bienSo;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String soKhung;

    @Column(name = "so_may", length = 50)
    private String soMay;

    @Column(name = "ten_xe", nullable = false, length = 100)
    private String nhanHieu;

    @Column(name = "Model", length = 50)
    private String model;

    @Column(name = "dong_xe", length = 50)
    private String loaiXe = "CAR"; // CAR, MOTO, TRUCK...

    @Column(name = "ODO_HienTai")
    private Integer odoHienTai = 0;

    @Column(name = "nam_san_xuat")
    private LocalDateTime ngayTao;

    @Column(name = "khach_hang_id", insertable = false, updatable = false)
    private Integer khachHangId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "khach_hang_id", nullable = false)
    private Customer khachHang;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
        if (odoHienTai == null) {
            odoHienTai = 0;
        }
        normalizeAndValidate();
    }

    @PreUpdate
    protected void onUpdate() {
        normalizeAndValidate();
    }

    private void normalizeAndValidate() {
        if (bienSo == null || bienSo.isBlank()) {
            throw new RuntimeException("Biển số không được để trống.");
        }

        // 1. Clean: Remove all non-alphanumeric characters and Uppercase
        String raw = bienSo.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();

        if (raw.length() < 7 || raw.length() > 9) {
            throw new RuntimeException("Độ dài biển số không hợp lệ (7-9 ký tự số/chữ).");
        }

        // Allowed letters for Bike (excluding I, J, O, Q, W, R only for trailers?) -
        // Circular 24 is specific.
        // For simplicity and to avoid blocking valid edge cases (like electric
        // bikes/trailers), we keep it relatively broad
        // but can be stricter if user insists.
        // Standard series uses: A, B, C, D, E, F, G, H, K, L, M, N, P, S, T, U, V, X,
        // Y, Z.

        // 2. Auto-Format based on Vehicle Type and Length
        if ("CAR".equalsIgnoreCase(loaiXe)) {
            // New Standard (5 numbers): 30K12345 -> 30K-123.45
            if (raw.length() == 8) {
                this.bienSo = raw.substring(0, 3) + "-" + raw.substring(3, 6) + "." + raw.substring(6);
            }
            // Old Standard (4 numbers): 29A9999 -> 29A-9999
            else if (raw.length() == 7) {
                this.bienSo = raw.substring(0, 3) + "-" + raw.substring(3);
            } else {
                this.bienSo = raw;
            }
        } else if ("MOTO".equalsIgnoreCase(loaiXe)) {
            // New/Standard (5 numbers): 29X112345 -> 29-X1 123.45
            if (raw.length() == 9) {
                this.bienSo = raw.substring(0, 2) + "-" + raw.substring(2, 4) + " " + raw.substring(4, 7) + "."
                        + raw.substring(7);
            }
            // Old 4-num MOTO if needed (29H19999 -> 29-H1 9999) - Length 8
            else if (raw.length() == 8) {
                this.bienSo = raw.substring(0, 2) + "-" + raw.substring(2, 4) + " " + raw.substring(4);
            } else {
                this.bienSo = raw;
            }
        } else {
            this.bienSo = raw;
        }
    }

    public Vehicle() {
    }

    public Vehicle(Integer id, String bienSo, String soKhung, String soMay, String nhanHieu, String model,
            Integer odoHienTai,
            LocalDateTime ngayTao, Integer khachHangId, Customer khachHang) {
        this.id = id;
        this.bienSo = bienSo;
        this.soKhung = soKhung;
        this.soMay = soMay;
        this.nhanHieu = nhanHieu;
        this.model = model;
        this.odoHienTai = odoHienTai;
        this.ngayTao = ngayTao;
        this.khachHangId = khachHangId;
        this.khachHang = khachHang;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getBienSo() {
        return bienSo;
    }

    public void setBienSo(String bienSo) {
        this.bienSo = bienSo;
    }

    public String getSoKhung() {
        return soKhung;
    }

    public void setSoKhung(String soKhung) {
        this.soKhung = soKhung;
    }

    public String getSoMay() {
        return soMay;
    }

    public void setSoMay(String soMay) {
        this.soMay = soMay;
    }

    public String getNhanHieu() {
        return nhanHieu;
    }

    public void setNhanHieu(String nhanHieu) {
        this.nhanHieu = nhanHieu;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getLoaiXe() {
        return loaiXe;
    }

    public void setLoaiXe(String loaiXe) {
        this.loaiXe = loaiXe;
    }

    public Integer getOdoHienTai() {
        return odoHienTai;
    }

    public void setOdoHienTai(Integer odoHienTai) {
        this.odoHienTai = odoHienTai;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public Integer getKhachHangId() {
        return khachHangId;
    }

    public void setKhachHangId(Integer khachHangId) {
        this.khachHangId = khachHangId;
    }

    public Customer getKhachHang() {
        return khachHang;
    }

    public void setKhachHang(Customer khachHang) {
        this.khachHang = khachHang;
    }

    public static VehicleBuilder builder() {
        return new VehicleBuilder();
    }

    public static class VehicleBuilder {
        private Integer id;
        private String bienSo;
        private String soKhung;
        private String soMay;
        private String nhanHieu;
        private String model;
        private Integer odoHienTai = 0;
        private LocalDateTime ngayTao;
        private Integer khachHangId;
        private Customer khachHang;

        public VehicleBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public VehicleBuilder bienSo(String bienSo) {
            this.bienSo = bienSo;
            return this;
        }

        public VehicleBuilder soKhung(String soKhung) {
            this.soKhung = soKhung;
            return this;
        }

        public VehicleBuilder soMay(String soMay) {
            this.soMay = soMay;
            return this;
        }

        public VehicleBuilder nhanHieu(String nhanHieu) {
            this.nhanHieu = nhanHieu;
            return this;
        }

        public VehicleBuilder model(String model) {
            this.model = model;
            return this;
        }

        public VehicleBuilder odoHienTai(Integer odoHienTai) {
            this.odoHienTai = odoHienTai;
            return this;
        }

        public VehicleBuilder ngayTao(LocalDateTime ngayTao) {
            this.ngayTao = ngayTao;
            return this;
        }

        public VehicleBuilder khachHangId(Integer khachHangId) {
            this.khachHangId = khachHangId;
            return this;
        }

        public VehicleBuilder khachHang(Customer khachHang) {
            this.khachHang = khachHang;
            return this;
        }

        public Vehicle build() {
            return new Vehicle(id, bienSo, soKhung, soMay, nhanHieu, model, odoHienTai, ngayTao, khachHangId,
                    khachHang);
        }
    }
}
