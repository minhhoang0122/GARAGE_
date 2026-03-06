package com.gara.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PhieuTiepNhan")
public class Reception {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "NgayGio")
    private LocalDateTime ngayGio;

    @Column(name = "TinhTrangVoXe", length = 500)
    private String tinhTrangVoXe;

    @Column(name = "MucXang", precision = 3, scale = 2)
    private BigDecimal mucXang;

    @Column(name = "ODO")
    private Integer odo;

    @Column(name = "YeuCauSoBo", length = 500)
    private String yeuCauSoBo;

    @Column(name = "HinhAnh", columnDefinition = "NVARCHAR(MAX)")
    private String hinhAnh;

    @Column(name = "XeBienSo", insertable = false, updatable = false)
    private String xeBienSo;

    @Column(name = "NguoiTiepNhanID", insertable = false, updatable = false)
    private Integer nguoiTiepNhanId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "XeBienSo", referencedColumnName = "BienSo", nullable = false)
    private Vehicle xe;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "NguoiTiepNhanID", nullable = false)
    private User nguoiTiepNhan;

    @OneToOne(mappedBy = "phieuTiepNhan", cascade = CascadeType.ALL)
    private RepairOrder donHangSuaChua;

    @PrePersist
    protected void onCreate() {
        ngayGio = LocalDateTime.now();
    }

    public Reception() {
    }

    public Reception(Integer id, LocalDateTime ngayGio, String tinhTrangVoXe, BigDecimal mucXang, Integer odo,
            String yeuCauSoBo, String hinhAnh, String xeBienSo, Integer nguoiTiepNhanId, Vehicle xe, User nguoiTiepNhan,
            RepairOrder donHangSuaChua) {
        this.id = id;
        this.ngayGio = ngayGio;
        this.tinhTrangVoXe = tinhTrangVoXe;
        this.mucXang = mucXang;
        this.odo = odo;
        this.yeuCauSoBo = yeuCauSoBo;
        this.hinhAnh = hinhAnh;
        this.xeBienSo = xeBienSo;
        this.nguoiTiepNhanId = nguoiTiepNhanId;
        this.xe = xe;
        this.nguoiTiepNhan = nguoiTiepNhan;
        this.donHangSuaChua = donHangSuaChua;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDateTime getNgayGio() {
        return ngayGio;
    }

    public void setNgayGio(LocalDateTime ngayGio) {
        this.ngayGio = ngayGio;
    }

    public String getTinhTrangVoXe() {
        return tinhTrangVoXe;
    }

    public void setTinhTrangVoXe(String tinhTrangVoXe) {
        this.tinhTrangVoXe = tinhTrangVoXe;
    }

    public BigDecimal getMucXang() {
        return mucXang;
    }

    public void setMucXang(BigDecimal mucXang) {
        this.mucXang = mucXang;
    }

    public Integer getOdo() {
        return odo;
    }

    public void setOdo(Integer odo) {
        this.odo = odo;
    }

    public String getYeuCauSoBo() {
        return yeuCauSoBo;
    }

    public void setYeuCauSoBo(String yeuCauSoBo) {
        this.yeuCauSoBo = yeuCauSoBo;
    }

    public String getHinhAnh() {
        return hinhAnh;
    }

    public void setHinhAnh(String hinhAnh) {
        this.hinhAnh = hinhAnh;
    }

    public String getXeBienSo() {
        return xeBienSo;
    }

    public void setXeBienSo(String xeBienSo) {
        this.xeBienSo = xeBienSo;
    }

    public Integer getNguoiTiepNhanId() {
        return nguoiTiepNhanId;
    }

    public void setNguoiTiepNhanId(Integer nguoiTiepNhanId) {
        this.nguoiTiepNhanId = nguoiTiepNhanId;
    }

    public Vehicle getXe() {
        return xe;
    }

    public void setXe(Vehicle xe) {
        this.xe = xe;
    }

    public User getNguoiTiepNhan() {
        return nguoiTiepNhan;
    }

    public void setNguoiTiepNhan(User nguoiTiepNhan) {
        this.nguoiTiepNhan = nguoiTiepNhan;
    }

    public RepairOrder getDonHangSuaChua() {
        return donHangSuaChua;
    }

    public void setDonHangSuaChua(RepairOrder donHangSuaChua) {
        this.donHangSuaChua = donHangSuaChua;
    }

    public static ReceptionBuilder builder() {
        return new ReceptionBuilder();
    }

    public static class ReceptionBuilder {
        private Integer id;
        private LocalDateTime ngayGio;
        private String tinhTrangVoXe;
        private BigDecimal mucXang;
        private Integer odo;
        private String yeuCauSoBo;
        private String hinhAnh;
        private String xeBienSo;
        private Integer nguoiTiepNhanId;
        private Vehicle xe;
        private User nguoiTiepNhan;
        private RepairOrder donHangSuaChua;

        ReceptionBuilder() {
        }

        public ReceptionBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public ReceptionBuilder ngayGio(LocalDateTime ngayGio) {
            this.ngayGio = ngayGio;
            return this;
        }

        public ReceptionBuilder tinhTrangVoXe(String tinhTrangVoXe) {
            this.tinhTrangVoXe = tinhTrangVoXe;
            return this;
        }

        public ReceptionBuilder mucXang(BigDecimal mucXang) {
            this.mucXang = mucXang;
            return this;
        }

        public ReceptionBuilder odo(Integer odo) {
            this.odo = odo;
            return this;
        }

        public ReceptionBuilder yeuCauSoBo(String yeuCauSoBo) {
            this.yeuCauSoBo = yeuCauSoBo;
            return this;
        }

        public ReceptionBuilder hinhAnh(String hinhAnh) {
            this.hinhAnh = hinhAnh;
            return this;
        }

        public ReceptionBuilder xeBienSo(String xeBienSo) {
            this.xeBienSo = xeBienSo;
            return this;
        }

        public ReceptionBuilder nguoiTiepNhanId(Integer nguoiTiepNhanId) {
            this.nguoiTiepNhanId = nguoiTiepNhanId;
            return this;
        }

        public ReceptionBuilder xe(Vehicle xe) {
            this.xe = xe;
            return this;
        }

        public ReceptionBuilder nguoiTiepNhan(User nguoiTiepNhan) {
            this.nguoiTiepNhan = nguoiTiepNhan;
            return this;
        }

        public ReceptionBuilder donHangSuaChua(RepairOrder donHangSuaChua) {
            this.donHangSuaChua = donHangSuaChua;
            return this;
        }

        public Reception build() {
            return new Reception(id, ngayGio, tinhTrangVoXe, mucXang, odo, yeuCauSoBo, hinhAnh, xeBienSo,
                    nguoiTiepNhanId, xe, nguoiTiepNhan, donHangSuaChua);
        }
    }
}
