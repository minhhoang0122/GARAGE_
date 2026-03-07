package com.gara.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "NguoiDung")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Column(name = "ten_dang_nhap", unique = true, nullable = false, length = 50)
    private String tenDangNhap;

    @Column(name = "mat_khau_hash", nullable = false, length = 255)
    private String matKhauHash;

    @Column(name = "vai_tro", nullable = false, length = 30)
    private String vaiTro; // ADMIN, SALE, THO_CHAN_DOAN, THO_SUA_CHUA, KHO, KE_TOAN

    @Column(name = "trang_thai_hoat_dong")
    private Boolean trangThaiHoatDong = true;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
        if (trangThaiHoatDong == null) {
            trangThaiHoatDong = true;
        }
    }

    // --- Manual Implementation start ---
    public User() {
    }

    public User(Integer id, String hoTen, String soDienThoai, String tenDangNhap, String matKhauHash, String vaiTro,
            Boolean trangThaiHoatDong, LocalDateTime ngayTao) {
        this.id = id;
        this.hoTen = hoTen;
        this.soDienThoai = soDienThoai;
        this.tenDangNhap = tenDangNhap;
        this.matKhauHash = matKhauHash;
        this.vaiTro = vaiTro;
        this.trangThaiHoatDong = trangThaiHoatDong;
        this.ngayTao = ngayTao;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    public String getTenDangNhap() {
        return tenDangNhap;
    }

    public void setTenDangNhap(String tenDangNhap) {
        this.tenDangNhap = tenDangNhap;
    }

    public String getMatKhauHash() {
        return matKhauHash;
    }

    public void setMatKhauHash(String matKhauHash) {
        this.matKhauHash = matKhauHash;
    }

    public String getVaiTro() {
        return vaiTro;
    }

    public void setVaiTro(String vaiTro) {
        this.vaiTro = vaiTro;
    }

    public Boolean getTrangThaiHoatDong() {
        return trangThaiHoatDong;
    }

    public void setTrangThaiHoatDong(Boolean trangThaiHoatDong) {
        this.trangThaiHoatDong = trangThaiHoatDong;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private Integer id;
        private String hoTen;
        private String soDienThoai;
        private String tenDangNhap;
        private String matKhauHash;
        private String vaiTro;
        private Boolean trangThaiHoatDong;
        private LocalDateTime ngayTao;

        UserBuilder() {
        }

        public UserBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public UserBuilder hoTen(String hoTen) {
            this.hoTen = hoTen;
            return this;
        }

        public UserBuilder soDienThoai(String soDienThoai) {
            this.soDienThoai = soDienThoai;
            return this;
        }

        public UserBuilder tenDangNhap(String tenDangNhap) {
            this.tenDangNhap = tenDangNhap;
            return this;
        }

        public UserBuilder matKhauHash(String matKhauHash) {
            this.matKhauHash = matKhauHash;
            return this;
        }

        public UserBuilder vaiTro(String vaiTro) {
            this.vaiTro = vaiTro;
            return this;
        }

        public UserBuilder trangThaiHoatDong(Boolean trangThaiHoatDong) {
            this.trangThaiHoatDong = trangThaiHoatDong;
            return this;
        }

        public UserBuilder ngayTao(LocalDateTime ngayTao) {
            this.ngayTao = ngayTao;
            return this;
        }

        public User build() {
            return new User(id, hoTen, soDienThoai, tenDangNhap, matKhauHash, vaiTro, trangThaiHoatDong, ngayTao);
        }
    }
    // --- Manual Implementation end ---
}
