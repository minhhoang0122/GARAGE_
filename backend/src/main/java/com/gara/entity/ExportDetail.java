package com.gara.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "exportdetail")
public class ExportDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "don_gia_xuat", precision = 18, scale = 2)
    private BigDecimal donGiaXuat;

    @Column(name = "thanh_tien", precision = 18, scale = 2)
    private BigDecimal thanhTien;

    // Foreign Keys
    @Column(name = "phieu_xuat_kho_id", insertable = false, updatable = false)
    private Integer phieuXuatKhoId;

    @Column(name = "hang_hoa_id", insertable = false, updatable = false)
    private Integer hangHoaId;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phieu_xuat_kho_id", nullable = false)
    private ExportNote phieuXuatKho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hang_hoa_id", nullable = false)
    private Product hangHoa;

    public ExportDetail() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public Integer getSoLuong() { return soLuong; }
    public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }

    public BigDecimal getDonGiaXuat() { return donGiaXuat; }
    public void setDonGiaXuat(BigDecimal donGiaXuat) { this.donGiaXuat = donGiaXuat; }

    public BigDecimal getThanhTien() { return thanhTien; }
    public void setThanhTien(BigDecimal thanhTien) { this.thanhTien = thanhTien; }

    public Integer getPhieuXuatKhoId() { return phieuXuatKhoId; }
    public void setPhieuXuatKhoId(Integer phieuXuatKhoId) { this.phieuXuatKhoId = phieuXuatKhoId; }

    public Integer getHangHoaId() { return hangHoaId; }
    public void setHangHoaId(Integer hangHoaId) { this.hangHoaId = hangHoaId; }

    public ExportNote getPhieuXuatKho() { return phieuXuatKho; }
    public void setPhieuXuatKho(ExportNote phieuXuatKho) { this.phieuXuatKho = phieuXuatKho; }

    public Product getHangHoa() { return hangHoa; }
    public void setHangHoa(Product hangHoa) { this.hangHoa = hangHoa; }
}
