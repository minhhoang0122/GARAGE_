package com.gara.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "importdetail")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    public Product getHangHoa() { return hangHoa; }
    public Integer getSoLuong() { return soLuong; }
    public java.math.BigDecimal getDonGiaNhap() { return donGiaNhap; }
    public java.math.BigDecimal getThueVAT() { return thueVAT; }
    public Integer getSoLuongConLai() { return soLuongConLai; }
    public void setSoLuongConLai(Integer soLuongConLai) { this.soLuongConLai = soLuongConLai; }
}
