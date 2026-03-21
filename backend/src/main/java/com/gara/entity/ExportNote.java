package com.gara.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "exportnote")
public class ExportNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "loai_xuat", length = 50)
    private String loaiXuat = "SUA_CHUA";

    @Column(name = "ngay_xuat")
    private LocalDateTime ngayXuat;

    // Foreign Keys
    @Column(name = "nguoi_tao_id", insertable = false, updatable = false)
    private Integer nguoiTaoId;

    @Column(name = "don_hang_sua_chua_id", insertable = false, updatable = false)
    private Integer donHangSuaChuaId;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_tao_id", nullable = false)
    private User nguoiTao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "don_hang_sua_chua_id", nullable = true)
    private RepairOrder donHangSuaChua;

    @OneToMany(mappedBy = "phieuXuatKho", cascade = CascadeType.ALL)
    private List<ExportDetail> chiTietXuatKho;

    public ExportNote() {}

    @PrePersist
    protected void onCreate() {
        if (ngayXuat == null) {
            ngayXuat = LocalDateTime.now();
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getLoaiXuat() { return loaiXuat; }
    public void setLoaiXuat(String loaiXuat) { this.loaiXuat = loaiXuat; }

    public LocalDateTime getNgayXuat() { return ngayXuat; }
    public void setNgayXuat(LocalDateTime ngayXuat) { this.ngayXuat = ngayXuat; }

    public Integer getNguoiTaoId() { return nguoiTaoId; }
    public void setNguoiTaoId(Integer nguoiTaoId) { this.nguoiTaoId = nguoiTaoId; }

    public Integer getDonHangSuaChuaId() { return donHangSuaChuaId; }
    public void setDonHangSuaChuaId(Integer donHangSuaChuaId) { this.donHangSuaChuaId = donHangSuaChuaId; }

    public User getNguoiTao() { return nguoiTao; }
    public void setNguoiTao(User nguoiTao) { this.nguoiTao = nguoiTao; }

    public RepairOrder getDonHangSuaChua() { return donHangSuaChua; }
    public void setDonHangSuaChua(RepairOrder donHangSuaChua) { this.donHangSuaChua = donHangSuaChua; }

    public List<ExportDetail> getChiTietXuatKho() { return chiTietXuatKho; }
    public void setChiTietXuatKho(List<ExportDetail> chiTietXuatKho) { this.chiTietXuatKho = chiTietXuatKho; }
}
