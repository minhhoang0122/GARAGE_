package com.gara.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "InventoryReservation")
public class InventoryReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "trang_thai", length = 20)
    private String trangThai = "ACTIVE"; // ACTIVE, CONVERTED, RELEASED, EXPIRED

    @Column(name = "ngay_het_han", nullable = false)
    private LocalDateTime ngayHetHan;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    // Foreign Keys
    @Column(name = "don_hang_sua_chua_id", insertable = false, updatable = false)
    private Integer donHangSuaChuaId;

    @Column(name = "hang_hoa_id", insertable = false, updatable = false)
    private Integer hangHoaId;

    @Column(name = "nguoi_tao_id", insertable = false, updatable = false)
    private Integer nguoiTaoId;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "don_hang_sua_chua_id")
    private RepairOrder donHangSuaChua;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hang_hoa_id")
    private Product hangHoa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_tao_id")
    private User nguoiTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
        if (trangThai == null)
            trangThai = "ACTIVE";
    }

    public InventoryReservation() {
    }

    public InventoryReservation(Integer id, Integer soLuong, String trangThai, LocalDateTime ngayHetHan,
            LocalDateTime ngayTao, Integer donHangSuaChuaId, Integer hangHoaId, Integer nguoiTaoId,
            RepairOrder donHangSuaChua, Product hangHoa, User nguoiTao) {
        this.id = id;
        this.soLuong = soLuong;
        this.trangThai = trangThai;
        this.ngayHetHan = ngayHetHan;
        this.ngayTao = ngayTao;
        this.donHangSuaChuaId = donHangSuaChuaId;
        this.hangHoaId = hangHoaId;
        this.nguoiTaoId = nguoiTaoId;
        this.donHangSuaChua = donHangSuaChua;
        this.hangHoa = hangHoa;
        this.nguoiTao = nguoiTao;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public LocalDateTime getNgayHetHan() {
        return ngayHetHan;
    }

    public void setNgayHetHan(LocalDateTime ngayHetHan) {
        this.ngayHetHan = ngayHetHan;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public Integer getDonHangSuaChuaId() {
        return donHangSuaChuaId;
    }

    public void setDonHangSuaChuaId(Integer donHangSuaChuaId) {
        this.donHangSuaChuaId = donHangSuaChuaId;
    }

    public Integer getHangHoaId() {
        return hangHoaId;
    }

    public void setHangHoaId(Integer hangHoaId) {
        this.hangHoaId = hangHoaId;
    }

    public Integer getNguoiTaoId() {
        return nguoiTaoId;
    }

    public void setNguoiTaoId(Integer nguoiTaoId) {
        this.nguoiTaoId = nguoiTaoId;
    }

    public RepairOrder getDonHangSuaChua() {
        return donHangSuaChua;
    }

    public void setDonHangSuaChua(RepairOrder donHangSuaChua) {
        this.donHangSuaChua = donHangSuaChua;
    }

    public Product getHangHoa() {
        return hangHoa;
    }

    public void setHangHoa(Product hangHoa) {
        this.hangHoa = hangHoa;
    }

    public User getNguoiTao() {
        return nguoiTao;
    }

    public void setNguoiTao(User nguoiTao) {
        this.nguoiTao = nguoiTao;
    }

    public static InventoryReservationBuilder builder() {
        return new InventoryReservationBuilder();
    }

    public static class InventoryReservationBuilder {
        private Integer id;
        private Integer soLuong;
        private String trangThai = "ACTIVE";
        private LocalDateTime ngayHetHan;
        private LocalDateTime ngayTao;
        private Integer donHangSuaChuaId;
        private Integer hangHoaId;
        private Integer nguoiTaoId;
        private RepairOrder donHangSuaChua;
        private Product hangHoa;
        private User nguoiTao;

        InventoryReservationBuilder() {
        }

        public InventoryReservationBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public InventoryReservationBuilder soLuong(Integer soLuong) {
            this.soLuong = soLuong;
            return this;
        }

        public InventoryReservationBuilder trangThai(String trangThai) {
            this.trangThai = trangThai;
            return this;
        }

        public InventoryReservationBuilder ngayHetHan(LocalDateTime ngayHetHan) {
            this.ngayHetHan = ngayHetHan;
            return this;
        }

        public InventoryReservationBuilder ngayTao(LocalDateTime ngayTao) {
            this.ngayTao = ngayTao;
            return this;
        }

        public InventoryReservationBuilder donHangSuaChuaId(Integer donHangSuaChuaId) {
            this.donHangSuaChuaId = donHangSuaChuaId;
            return this;
        }

        public InventoryReservationBuilder hangHoaId(Integer hangHoaId) {
            this.hangHoaId = hangHoaId;
            return this;
        }

        public InventoryReservationBuilder nguoiTaoId(Integer nguoiTaoId) {
            this.nguoiTaoId = nguoiTaoId;
            return this;
        }

        public InventoryReservationBuilder donHangSuaChua(RepairOrder donHangSuaChua) {
            this.donHangSuaChua = donHangSuaChua;
            return this;
        }

        public InventoryReservationBuilder hangHoa(Product hangHoa) {
            this.hangHoa = hangHoa;
            return this;
        }

        public InventoryReservationBuilder nguoiTao(User nguoiTao) {
            this.nguoiTao = nguoiTao;
            return this;
        }

        public InventoryReservation build() {
            return new InventoryReservation(id, soLuong, trangThai, ngayHetHan, ngayTao, donHangSuaChuaId, hangHoaId,
                    nguoiTaoId, donHangSuaChua, hangHoa, nguoiTao);
        }
    }
}
