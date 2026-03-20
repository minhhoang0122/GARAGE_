package com.gara.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "importnote")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "ma_phieu", length = 50, unique = true)
    private String maPhieu;

    @Column(name = "nha_cung_cap", length = 200)
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

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
    public List<ImportDetail> getChiTietNhap() { return chiTietNhap; }
}
