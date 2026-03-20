package com.gara.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "exportnote")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Builder.Default
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

    @PrePersist
    protected void onCreate() {
        if (ngayXuat == null) {
            ngayXuat = LocalDateTime.now();
        }
    }
}
