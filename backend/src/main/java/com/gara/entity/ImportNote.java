package com.gara.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "importnote")
public class ImportNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "ma_phieu", length = 50, unique = true)
    private String maPhieu;

    @Column(name = "nha_ cung_cap", length = 200)
    private String nhaCungCap;

    @Column(name = "ngay_nhap")
    private LocalDateTime ngayNhap;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_nhap_id")
    private User nguoiNhap;

    @Column(name = "tong_tien", precision = 18, scale = 2)
    private BigDecimal tongTien;

    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;

    @Column(name = "trang_thai", length = 20)
    private String trangThai; // PENDING, COMPLETED, REJECTED

    @OneToMany(mappedBy = "phieuNhap", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ImportDetail> chiTietNhap;

    public ImportNote() {
    }

    public ImportNote(Integer id, String maPhieu, String nhaCungCap, LocalDateTime ngayNhap, User nguoiNhap,
            BigDecimal tongTien, String ghiChu, String trangThai, List<ImportDetail> chiTietNhap) {
        this.id = id;
        this.maPhieu = maPhieu;
        this.nhaCungCap = nhaCungCap;
        this.ngayNhap = ngayNhap;
        this.nguoiNhap = nguoiNhap;
        this.tongTien = tongTien;
        this.tongTien = tongTien;
        this.ghiChu = ghiChu;
        this.trangThai = trangThai;
        this.chiTietNhap = chiTietNhap;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMaPhieu() {
        return maPhieu;
    }

    public void setMaPhieu(String maPhieu) {
        this.maPhieu = maPhieu;
    }

    public String getNhaCungCap() {
        return nhaCungCap;
    }

    public void setNhaCungCap(String nhaCungCap) {
        this.nhaCungCap = nhaCungCap;
    }

    public LocalDateTime getNgayNhap() {
        return ngayNhap;
    }

    public void setNgayNhap(LocalDateTime ngayNhap) {
        this.ngayNhap = ngayNhap;
    }

    public User getNguoiNhap() {
        return nguoiNhap;
    }

    public void setNguoiNhap(User nguoiNhap) {
        this.nguoiNhap = nguoiNhap;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public List<ImportDetail> getChiTietNhap() {
        return chiTietNhap;
    }

    public void setChiTietNhap(List<ImportDetail> chiTietNhap) {
        this.chiTietNhap = chiTietNhap;
    }

    public static ImportNoteBuilder builder() {
        return new ImportNoteBuilder();
    }

    public static class ImportNoteBuilder {
        private Integer id;
        private String maPhieu;
        private String nhaCungCap;
        private LocalDateTime ngayNhap;
        private User nguoiNhap;
        private BigDecimal tongTien;
        private String ghiChu;
        private String trangThai;
        private List<ImportDetail> chiTietNhap;

        public ImportNoteBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public ImportNoteBuilder maPhieu(String maPhieu) {
            this.maPhieu = maPhieu;
            return this;
        }

        public ImportNoteBuilder nhaCungCap(String nhaCungCap) {
            this.nhaCungCap = nhaCungCap;
            return this;
        }

        public ImportNoteBuilder ngayNhap(LocalDateTime ngayNhap) {
            this.ngayNhap = ngayNhap;
            return this;
        }

        public ImportNoteBuilder nguoiNhap(User nguoiNhap) {
            this.nguoiNhap = nguoiNhap;
            return this;
        }

        public ImportNoteBuilder tongTien(BigDecimal tongTien) {
            this.tongTien = tongTien;
            return this;
        }

        public ImportNoteBuilder ghiChu(String ghiChu) {
            this.ghiChu = ghiChu;
            return this;
        }

        public ImportNoteBuilder trangThai(String trangThai) {
            this.trangThai = trangThai;
            return this;
        }

        public ImportNoteBuilder chiTietNhap(List<ImportDetail> chiTietNhap) {
            this.chiTietNhap = chiTietNhap;
            return this;
        }

        public ImportNote build() {
            return new ImportNote(id, maPhieu, nhaCungCap, ngayNhap, nguoiNhap, tongTien, ghiChu, trangThai,
                    chiTietNhap);
        }
    }
}
