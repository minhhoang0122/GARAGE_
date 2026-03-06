package com.gara.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ChiTietNhapKho")
public class ImportDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PhieuNhapKhoID", nullable = false)
    private ImportNote phieuNhap;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "HangHoaID", nullable = false)
    private Product hangHoa;

    @Column(name = "SoLuong", nullable = false)
    private Integer soLuong;

    @Column(name = "DonGiaNhap", precision = 18, scale = 2)
    private BigDecimal donGiaNhap;

    @Column(name = "ThanhTien", precision = 18, scale = 2)
    private BigDecimal thanhTien;

    @Column(name = "HanSuDung")
    private LocalDate hanSuDung;

    @Column(name = "ThueVAT", precision = 5, scale = 2)
    private BigDecimal thueVAT;

    @Column(name = "SoLuongConLai")
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
