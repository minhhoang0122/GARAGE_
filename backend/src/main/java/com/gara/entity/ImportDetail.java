package com.gara.entity;

import jakarta.persistence.*;
import lombok.*;
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

    public ImportDetail() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public ImportNote getPhieuNhap() { return phieuNhap; }
    public void setPhieuNhap(ImportNote phieuNhap) { this.phieuNhap = phieuNhap; }

    public Product getHangHoa() { return hangHoa; }
    public void setHangHoa(Product hangHoa) { this.hangHoa = hangHoa; }

    public Integer getSoLuong() { return soLuong; }
    public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }

    public BigDecimal getDonGiaNhap() { return donGiaNhap; }
    public void setDonGiaNhap(BigDecimal donGiaNhap) { this.donGiaNhap = donGiaNhap; }

    public BigDecimal getThanhTien() { return thanhTien; }
    public void setThanhTien(BigDecimal thanhTien) { this.thanhTien = thanhTien; }

    public LocalDate getHanSuDung() { return hanSuDung; }
    public void setHanSuDung(LocalDate hanSuDung) { this.hanSuDung = hanSuDung; }

    public BigDecimal getThueVAT() { return thueVAT; }
    public void setThueVAT(BigDecimal thueVAT) { this.thueVAT = thueVAT; }

    public Integer getSoLuongConLai() { return soLuongConLai; }
    public void setSoLuongConLai(Integer soLuongConLai) { this.soLuongConLai = soLuongConLai; }
}
