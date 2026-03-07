package com.gara.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "importdetail")
public class ImportDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phieu_nhap_kho_id", nullable = false)
    private ImportNote phieuNhap;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hang_hoa_id", nullable = false)
    private Product hangHoa;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "don_gia_nhap", precision = 18, scale = 2)
    private BigDecimal donGiaNhap;

    @Column(name = "thanh_tien", precision = 18, scale = 2)
    private BigDecimal thanhTien;

    @Column(name = "han_su_dung")
    private LocalDate hanSuDung;

    @Column(name = "thue_vat", precision = 5, scale = 2)
    private BigDecimal thueVAT;

    @Column(name = "so_luong_con_lai")
    private Integer soLuongConLai;

    public ImportDetail() {
    }

    public ImportDetail(Integer id, ImportNote phieuNhap, Product hangHoa, Integer soLuong, BigDecimal donGiaNhap,
            BigDecimal thanhTien, BigDecimal thueVAT, LocalDate hanSuDung, Integer soLuongConLai) {
        this.id = id;
        this.phieuNhap = phieuNhap;
        this.hangHoa = hangHoa;
        this.soLuong = soLuong;
        this.donGiaNhap = donGiaNhap;
        this.thanhTien = thanhTien;
        this.thueVAT = thueVAT;
        this.hanSuDung = hanSuDung;
        this.soLuongConLai = soLuongConLai;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public ImportNote getPhieuNhap() {
        return phieuNhap;
    }

    public void setPhieuNhap(ImportNote phieuNhap) {
        this.phieuNhap = phieuNhap;
    }

    public Product getHangHoa() {
        return hangHoa;
    }

    public void setHangHoa(Product hangHoa) {
        this.hangHoa = hangHoa;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public BigDecimal getDonGiaNhap() {
        return donGiaNhap;
    }

    public void setDonGiaNhap(BigDecimal donGiaNhap) {
        this.donGiaNhap = donGiaNhap;
    }

    public BigDecimal getThanhTien() {
        return thanhTien;
    }

    public void setThanhTien(BigDecimal thanhTien) {
        this.thanhTien = thanhTien;
    }

    public BigDecimal getThueVAT() {
        return thueVAT;
    }

    public void setThueVAT(BigDecimal thueVAT) {
        this.thueVAT = thueVAT;
    }

    public LocalDate getHanSuDung() {
        return hanSuDung;
    }

    public void setHanSuDung(LocalDate hanSuDung) {
        this.hanSuDung = hanSuDung;
    }

    public Integer getSoLuongConLai() {
        return soLuongConLai;
    }

    public void setSoLuongConLai(Integer soLuongConLai) {
        this.soLuongConLai = soLuongConLai;
    }

    public static ImportDetailBuilder builder() {
        return new ImportDetailBuilder();
    }

    public static class ImportDetailBuilder {
        private Integer id;
        private ImportNote phieuNhap;
        private Product hangHoa;
        private Integer soLuong;
        private BigDecimal donGiaNhap;
        private BigDecimal thanhTien;
        private BigDecimal thueVAT;
        private LocalDate hanSuDung;
        private Integer soLuongConLai;

        public ImportDetailBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public ImportDetailBuilder phieuNhap(ImportNote phieuNhap) {
            this.phieuNhap = phieuNhap;
            return this;
        }

        public ImportDetailBuilder hangHoa(Product hangHoa) {
            this.hangHoa = hangHoa;
            return this;
        }

        public ImportDetailBuilder soLuong(Integer soLuong) {
            this.soLuong = soLuong;
            return this;
        }

        public ImportDetailBuilder donGiaNhap(BigDecimal donGiaNhap) {
            this.donGiaNhap = donGiaNhap;
            return this;
        }

        public ImportDetailBuilder thanhTien(BigDecimal thanhTien) {
            this.thanhTien = thanhTien;
            return this;
        }

        public ImportDetailBuilder thueVAT(BigDecimal thueVAT) {
            this.thueVAT = thueVAT;
            return this;
        }

        public ImportDetailBuilder hanSuDung(LocalDate hanSuDung) {
            this.hanSuDung = hanSuDung;
            return this;
        }

        public ImportDetailBuilder soLuongConLai(Integer soLuongConLai) {
            this.soLuongConLai = soLuongConLai;
            return this;
        }

        public ImportDetail build() {
            return new ImportDetail(id, phieuNhap, hangHoa, soLuong, donGiaNhap, thanhTien, thueVAT, hanSuDung,
                    soLuongConLai);
        }
    }
}
