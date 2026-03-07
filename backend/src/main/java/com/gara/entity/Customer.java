package com.gara.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "KhachHang", indexes = {
        @Index(name = "idx_so_dien_thoai", columnList = "SoDienThoai"),
        @Index(name = "idx_ngay_tao_kh", columnList = "NgayTao")
})
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "so_dien_thoai", nullable = false, length = 20)
    private String soDienThoai;

    @Column(name = "loai_khach_hang", length = 50)
    private String diaChi;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "UserID") // Link to system user for notifications
    private Integer userId;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID", insertable = false, updatable = false)
    private User systemUser;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "khachHang", cascade = CascadeType.ALL)
    private List<Vehicle> danhSachXe;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }

    public Customer() {
    }

    public Customer(Integer id, String hoTen, String soDienThoai, String diaChi, String email, LocalDateTime ngayTao,
            Integer userId, User systemUser, List<Vehicle> danhSachXe) {
        this.id = id;
        this.hoTen = hoTen;
        this.soDienThoai = soDienThoai;
        this.diaChi = diaChi;
        this.email = email;
        this.ngayTao = ngayTao;
        this.userId = userId;
        this.systemUser = systemUser;
        this.danhSachXe = danhSachXe;
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

    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public User getSystemUser() {
        return systemUser;
    }

    public void setSystemUser(User systemUser) {
        this.systemUser = systemUser;
    }

    public List<Vehicle> getDanhSachXe() {
        return danhSachXe;
    }

    public void setDanhSachXe(List<Vehicle> danhSachXe) {
        this.danhSachXe = danhSachXe;
    }

    public static CustomerBuilder builder() {
        return new CustomerBuilder();
    }

    public static class CustomerBuilder {
        private Integer id;
        private String hoTen;
        private String soDienThoai;
        private String diaChi;
        private String email;
        private LocalDateTime ngayTao;
        private Integer userId;
        private User systemUser;
        private List<Vehicle> danhSachXe;

        public CustomerBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public CustomerBuilder hoTen(String hoTen) {
            this.hoTen = hoTen;
            return this;
        }

        public CustomerBuilder soDienThoai(String soDienThoai) {
            this.soDienThoai = soDienThoai;
            return this;
        }

        public CustomerBuilder diaChi(String diaChi) {
            this.diaChi = diaChi;
            return this;
        }

        public CustomerBuilder email(String email) {
            this.email = email;
            return this;
        }

        public CustomerBuilder ngayTao(LocalDateTime ngayTao) {
            this.ngayTao = ngayTao;
            return this;
        }

        public CustomerBuilder userId(Integer userId) {
            this.userId = userId;
            return this;
        }

        public CustomerBuilder systemUser(User systemUser) {
            this.systemUser = systemUser;
            return this;
        }

        public CustomerBuilder danhSachXe(List<Vehicle> danhSachXe) {
            this.danhSachXe = danhSachXe;
            return this;
        }

        public Customer build() {
            return new Customer(id, hoTen, soDienThoai, diaChi, email, ngayTao, userId, systemUser, danhSachXe);
        }
    }
}
