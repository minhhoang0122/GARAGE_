package com.gara.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "PhieuXuatKho")
public class ExportNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "LoaiXuat", length = 50)
    private String loaiXuat = "SUA_CHUA";

    @Column(name = "NgayXuat")
    private LocalDateTime ngayXuat;

    // Foreign Keys
    @Column(name = "NguoiTaoID", insertable = false, updatable = false)
    private Integer nguoiTaoId;

    @Column(name = "DonHangSuaChuaID", insertable = false, updatable = false)
    private Integer donHangSuaChuaId;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "NguoiTaoID", nullable = false)
    private User nguoiTao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DonHangSuaChuaID", nullable = true)
    private RepairOrder donHangSuaChua;

    @OneToMany(mappedBy = "phieuXuatKho", cascade = CascadeType.ALL)
    private List<ExportDetail> chiTietXuatKho;

    @PrePersist
    protected void onCreate() {
        ngayXuat = LocalDateTime.now();
    }

    public ExportNote() {
    }

    public ExportNote(Integer id, String loaiXuat, LocalDateTime ngayXuat, Integer nguoiTaoId, Integer donHangSuaChuaId,
            User nguoiTao, RepairOrder donHangSuaChua, List<ExportDetail> chiTietXuatKho) {
        this.id = id;
        this.loaiXuat = loaiXuat;
        this.ngayXuat = ngayXuat;
        this.nguoiTaoId = nguoiTaoId;
        this.donHangSuaChuaId = donHangSuaChuaId;
        this.nguoiTao = nguoiTao;
        this.donHangSuaChua = donHangSuaChua;
        this.chiTietXuatKho = chiTietXuatKho;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getLoaiXuat() {
        return loaiXuat;
    }

    public void setLoaiXuat(String loaiXuat) {
        this.loaiXuat = loaiXuat;
    }

    public LocalDateTime getNgayXuat() {
        return ngayXuat;
    }

    public void setNgayXuat(LocalDateTime ngayXuat) {
        this.ngayXuat = ngayXuat;
    }

    public Integer getNguoiTaoId() {
        return nguoiTaoId;
    }

    public void setNguoiTaoId(Integer nguoiTaoId) {
        this.nguoiTaoId = nguoiTaoId;
    }

    public Integer getDonHangSuaChuaId() {
        return donHangSuaChuaId;
    }

    public void setDonHangSuaChuaId(Integer donHangSuaChuaId) {
        this.donHangSuaChuaId = donHangSuaChuaId;
    }

    public User getNguoiTao() {
        return nguoiTao;
    }

    public void setNguoiTao(User nguoiTao) {
        this.nguoiTao = nguoiTao;
    }

    public RepairOrder getDonHangSuaChua() {
        return donHangSuaChua;
    }

    public void setDonHangSuaChua(RepairOrder donHangSuaChua) {
        this.donHangSuaChua = donHangSuaChua;
    }

    public List<ExportDetail> getChiTietXuatKho() {
        return chiTietXuatKho;
    }

    public void setChiTietXuatKho(List<ExportDetail> chiTietXuatKho) {
        this.chiTietXuatKho = chiTietXuatKho;
    }

    public static ExportNoteBuilder builder() {
        return new ExportNoteBuilder();
    }

    public static class ExportNoteBuilder {
        private Integer id;
        private String loaiXuat = "SUA_CHUA";
        private LocalDateTime ngayXuat;
        private Integer nguoiTaoId;
        private Integer donHangSuaChuaId;
        private User nguoiTao;
        private RepairOrder donHangSuaChua;
        private List<ExportDetail> chiTietXuatKho;

        public ExportNoteBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public ExportNoteBuilder loaiXuat(String loaiXuat) {
            this.loaiXuat = loaiXuat;
            return this;
        }

        public ExportNoteBuilder ngayXuat(LocalDateTime ngayXuat) {
            this.ngayXuat = ngayXuat;
            return this;
        }

        public ExportNoteBuilder nguoiTaoId(Integer nguoiTaoId) {
            this.nguoiTaoId = nguoiTaoId;
            return this;
        }

        public ExportNoteBuilder donHangSuaChuaId(Integer donHangSuaChuaId) {
            this.donHangSuaChuaId = donHangSuaChuaId;
            return this;
        }

        public ExportNoteBuilder nguoiTao(User nguoiTao) {
            this.nguoiTao = nguoiTao;
            return this;
        }

        public ExportNoteBuilder donHangSuaChua(RepairOrder donHangSuaChua) {
            this.donHangSuaChua = donHangSuaChua;
            return this;
        }

        public ExportNoteBuilder chiTietXuatKho(List<ExportDetail> chiTietXuatKho) {
            this.chiTietXuatKho = chiTietXuatKho;
            return this;
        }

        public ExportNote build() {
            return new ExportNote(id, loaiXuat, ngayXuat, nguoiTaoId, donHangSuaChuaId, nguoiTao, donHangSuaChua,
                    chiTietXuatKho);
        }
    }
}
