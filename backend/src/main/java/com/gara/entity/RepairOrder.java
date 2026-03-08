package com.gara.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.gara.entity.enums.OrderStatus;

@Entity
@Table(name = "donhangsuachua", indexes = {
        @Index(name = "idx_trang_thai", columnList = "trang_thai"),
        @Index(name = "idx_ngay_tao", columnList = "ngay_tao")
})
public class RepairOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_duyet")
    private LocalDateTime ngayDuyet;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", length = 30)
    private OrderStatus trangThai = OrderStatus.TIEP_NHAN;

    @Column(name = "tien_coc", precision = 18, scale = 2)
    private BigDecimal tienCoc = BigDecimal.ZERO;

    @Column(name = "tong_tien_hang", precision = 18, scale = 2)
    private BigDecimal tongTienHang = BigDecimal.ZERO;

    @Column(name = "tong_tien_cong", precision = 18, scale = 2)
    private BigDecimal tongTienCong = BigDecimal.ZERO;

    @Column(name = "chiet_khau_tong", precision = 18, scale = 2)
    private BigDecimal chietKhauTong = BigDecimal.ZERO;

    @Column(name = "thue_vat", precision = 18, scale = 2)
    private BigDecimal thueVAT = BigDecimal.ZERO;

    @Column(name = "tong_cong", precision = 18, scale = 2)
    private BigDecimal tongCong = BigDecimal.ZERO;

    @Column(name = "la_don_bao_hanh")
    private Boolean laDonBaoHanh = false;

    @Column(name = "so_tien_da_tra", precision = 18, scale = 2)
    private BigDecimal soTienDaTra = BigDecimal.ZERO;

    @Column(name = "cong_no", precision = 18, scale = 2)
    private BigDecimal congNo = BigDecimal.ZERO;

    @Column(name = "phuong_thuc", length = 50)
    private String phuongThuc;

    @Column(name = "ngay_thanh_toan")
    private LocalDateTime ngayThanhToan;

    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;

    @Column(name = "parent_order_id", insertable = false, updatable = false)
    private Integer parentOrderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_order_id")
    private RepairOrder parentOrder;

    @Column(name = "phieu_tiep_nhan_id", insertable = false, updatable = false)
    private Integer phieuTiepNhanId;

    @Column(name = "tho_phan_cong_id", insertable = false, updatable = false)
    private Integer thoPhanCongId;

    @Column(name = "nguoi_phu_trach_id", insertable = false, updatable = false)
    private Integer nguoiPhuTrachId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phieu_tiep_nhan_id", nullable = false)
    private Reception phieuTiepNhan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tho_phan_cong_id")
    private User thoPhanCong;

    @Column(name = "tho_chan_doan_id", insertable = false, updatable = false)
    private Integer thoChanDoanId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tho_chan_doan_id")
    private User thoChanDoan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_phu_trach_id")
    private User nguoiPhuTrach;

    @OneToMany(mappedBy = "donHangSuaChua", cascade = CascadeType.ALL)
    private List<OrderItem> chiTietDonHang;

    @OneToMany(mappedBy = "donHangSuaChua")
    private List<ExportNote> phieuXuatKho;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
        if (trangThai == null)
            trangThai = OrderStatus.TIEP_NHAN;
    }

    public RepairOrder() {
    }

    public RepairOrder(Integer id, LocalDateTime ngayTao, LocalDateTime ngayDuyet, OrderStatus trangThai,
            BigDecimal tienCoc,
            BigDecimal tongTienHang, BigDecimal tongTienCong, BigDecimal chietKhauTong, BigDecimal thueVAT,
            BigDecimal tongCong, Boolean laDonBaoHanh, BigDecimal soTienDaTra, BigDecimal congNo, String phuongThuc,
            LocalDateTime ngayThanhToan, String ghiChu, Integer parentOrderId, RepairOrder parentOrder,
            Integer phieuTiepNhanId, Integer thoPhanCongId, Integer nguoiPhuTrachId, Reception phieuTiepNhan,
            User thoPhanCong, Integer thoChanDoanId, User thoChanDoan, User nguoiPhuTrach,
            List<OrderItem> chiTietDonHang, List<ExportNote> phieuXuatKho) {
        this.id = id;
        this.ngayTao = ngayTao;
        this.ngayDuyet = ngayDuyet;
        this.trangThai = trangThai;
        this.tienCoc = tienCoc;
        this.tongTienHang = tongTienHang;
        this.tongTienCong = tongTienCong;
        this.chietKhauTong = chietKhauTong;
        this.thueVAT = thueVAT;
        this.tongCong = tongCong;
        this.laDonBaoHanh = laDonBaoHanh;
        this.soTienDaTra = soTienDaTra;
        this.congNo = congNo;
        this.phuongThuc = phuongThuc;
        this.ngayThanhToan = ngayThanhToan;
        this.ghiChu = ghiChu;
        this.parentOrderId = parentOrderId;
        this.parentOrder = parentOrder;
        this.phieuTiepNhanId = phieuTiepNhanId;
        this.thoPhanCongId = thoPhanCongId;
        this.nguoiPhuTrachId = nguoiPhuTrachId;
        this.phieuTiepNhan = phieuTiepNhan;
        this.thoPhanCong = thoPhanCong;
        this.thoChanDoanId = thoChanDoanId;
        this.thoChanDoan = thoChanDoan;
        this.nguoiPhuTrach = nguoiPhuTrach;
        this.chiTietDonHang = chiTietDonHang;
        this.phieuXuatKho = phieuXuatKho;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public LocalDateTime getNgayDuyet() {
        return ngayDuyet;
    }

    public void setNgayDuyet(LocalDateTime ngayDuyet) {
        this.ngayDuyet = ngayDuyet;
    }

    public OrderStatus getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(OrderStatus trangThai) {
        this.trangThai = trangThai;
    }

    public BigDecimal getTienCoc() {
        return tienCoc;
    }

    public void setTienCoc(BigDecimal tienCoc) {
        this.tienCoc = tienCoc;
    }

    public BigDecimal getTongTienHang() {
        return tongTienHang;
    }

    public void setTongTienHang(BigDecimal tongTienHang) {
        this.tongTienHang = tongTienHang;
    }

    public BigDecimal getTongTienCong() {
        return tongTienCong;
    }

    public void setTongTienCong(BigDecimal tongTienCong) {
        this.tongTienCong = tongTienCong;
    }

    public BigDecimal getChietKhauTong() {
        return chietKhauTong;
    }

    public void setChietKhauTong(BigDecimal chietKhauTong) {
        this.chietKhauTong = chietKhauTong;
    }

    public BigDecimal getThueVAT() {
        return thueVAT;
    }

    public void setThueVAT(BigDecimal thueVAT) {
        this.thueVAT = thueVAT;
    }

    public BigDecimal getTongCong() {
        return tongCong;
    }

    public void setTongCong(BigDecimal tongCong) {
        this.tongCong = tongCong;
    }

    public Boolean getLaDonBaoHanh() {
        return laDonBaoHanh;
    }

    public void setLaDonBaoHanh(Boolean laDonBaoHanh) {
        this.laDonBaoHanh = laDonBaoHanh;
    }

    public BigDecimal getSoTienDaTra() {
        return soTienDaTra;
    }

    public void setSoTienDaTra(BigDecimal soTienDaTra) {
        this.soTienDaTra = soTienDaTra;
    }

    public BigDecimal getCongNo() {
        return congNo;
    }

    public void setCongNo(BigDecimal congNo) {
        this.congNo = congNo;
    }

    public String getPhuongThuc() {
        return phuongThuc;
    }

    public void setPhuongThuc(String phuongThuc) {
        this.phuongThuc = phuongThuc;
    }

    public LocalDateTime getNgayThanhToan() {
        return ngayThanhToan;
    }

    public void setNgayThanhToan(LocalDateTime ngayThanhToan) {
        this.ngayThanhToan = ngayThanhToan;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public Integer getParentOrderId() {
        return parentOrderId;
    }

    public void setParentOrderId(Integer parentOrderId) {
        this.parentOrderId = parentOrderId;
    }

    public RepairOrder getParentOrder() {
        return parentOrder;
    }

    public void setParentOrder(RepairOrder parentOrder) {
        this.parentOrder = parentOrder;
    }

    public Integer getPhieuTiepNhanId() {
        return phieuTiepNhanId;
    }

    public void setPhieuTiepNhanId(Integer phieuTiepNhanId) {
        this.phieuTiepNhanId = phieuTiepNhanId;
    }

    public Integer getThoPhanCongId() {
        return thoPhanCongId;
    }

    public void setThoPhanCongId(Integer thoPhanCongId) {
        this.thoPhanCongId = thoPhanCongId;
    }

    public Integer getNguoiPhuTrachId() {
        return nguoiPhuTrachId;
    }

    public void setNguoiPhuTrachId(Integer nguoiPhuTrachId) {
        this.nguoiPhuTrachId = nguoiPhuTrachId;
    }

    public Reception getPhieuTiepNhan() {
        return phieuTiepNhan;
    }

    public void setPhieuTiepNhan(Reception phieuTiepNhan) {
        this.phieuTiepNhan = phieuTiepNhan;
    }

    public User getThoPhanCong() {
        return thoPhanCong;
    }

    public void setThoPhanCong(User thoPhanCong) {
        this.thoPhanCong = thoPhanCong;
    }

    public Integer getThoChanDoanId() {
        return thoChanDoanId;
    }

    public void setThoChanDoanId(Integer thoChanDoanId) {
        this.thoChanDoanId = thoChanDoanId;
    }

    public User getThoChanDoan() {
        return thoChanDoan;
    }

    public void setThoChanDoan(User thoChanDoan) {
        this.thoChanDoan = thoChanDoan;
    }

    public User getNguoiPhuTrach() {
        return nguoiPhuTrach;
    }

    public void setNguoiPhuTrach(User nguoiPhuTrach) {
        this.nguoiPhuTrach = nguoiPhuTrach;
    }

    public List<OrderItem> getChiTietDonHang() {
        return chiTietDonHang;
    }

    public void setChiTietDonHang(List<OrderItem> chiTietDonHang) {
        this.chiTietDonHang = chiTietDonHang;
    }

    public List<ExportNote> getPhieuXuatKho() {
        return phieuXuatKho;
    }

    public void setPhieuXuatKho(List<ExportNote> phieuXuatKho) {
        this.phieuXuatKho = phieuXuatKho;
    }

    public static RepairOrderBuilder builder() {
        return new RepairOrderBuilder();
    }

    public static class RepairOrderBuilder {
        private Integer id;
        private LocalDateTime ngayTao;
        private LocalDateTime ngayDuyet;
        private OrderStatus trangThai = OrderStatus.TIEP_NHAN;
        private BigDecimal tienCoc = BigDecimal.ZERO;
        private BigDecimal tongTienHang = BigDecimal.ZERO;
        private BigDecimal tongTienCong = BigDecimal.ZERO;
        private BigDecimal chietKhauTong = BigDecimal.ZERO;
        private BigDecimal thueVAT = BigDecimal.ZERO;
        private BigDecimal tongCong = BigDecimal.ZERO;
        private Boolean laDonBaoHanh = false;
        private BigDecimal soTienDaTra = BigDecimal.ZERO;
        private BigDecimal congNo = BigDecimal.ZERO;
        private String phuongThuc;
        private LocalDateTime ngayThanhToan;
        private String ghiChu;
        private Integer parentOrderId;
        private RepairOrder parentOrder;
        private Integer phieuTiepNhanId;
        private Integer thoPhanCongId;
        private Integer nguoiPhuTrachId;
        private Reception phieuTiepNhan;
        private User thoPhanCong;
        private Integer thoChanDoanId;
        private User thoChanDoan;
        private User nguoiPhuTrach;
        private List<OrderItem> chiTietDonHang;
        private List<ExportNote> phieuXuatKho;

        RepairOrderBuilder() {
        }

        public RepairOrderBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public RepairOrderBuilder ngayTao(LocalDateTime ngayTao) {
            this.ngayTao = ngayTao;
            return this;
        }

        public RepairOrderBuilder ngayDuyet(LocalDateTime ngayDuyet) {
            this.ngayDuyet = ngayDuyet;
            return this;
        }

        public RepairOrderBuilder trangThai(OrderStatus trangThai) {
            this.trangThai = trangThai;
            return this;
        }

        public RepairOrderBuilder tienCoc(BigDecimal tienCoc) {
            this.tienCoc = tienCoc;
            return this;
        }

        public RepairOrderBuilder tongTienHang(BigDecimal tongTienHang) {
            this.tongTienHang = tongTienHang;
            return this;
        }

        public RepairOrderBuilder tongTienCong(BigDecimal tongTienCong) {
            this.tongTienCong = tongTienCong;
            return this;
        }

        public RepairOrderBuilder chietKhauTong(BigDecimal chietKhauTong) {
            this.chietKhauTong = chietKhauTong;
            return this;
        }

        public RepairOrderBuilder thueVAT(BigDecimal thueVAT) {
            this.thueVAT = thueVAT;
            return this;
        }

        public RepairOrderBuilder tongCong(BigDecimal tongCong) {
            this.tongCong = tongCong;
            return this;
        }

        public RepairOrderBuilder laDonBaoHanh(Boolean laDonBaoHanh) {
            this.laDonBaoHanh = laDonBaoHanh;
            return this;
        }

        public RepairOrderBuilder soTienDaTra(BigDecimal soTienDaTra) {
            this.soTienDaTra = soTienDaTra;
            return this;
        }

        public RepairOrderBuilder congNo(BigDecimal congNo) {
            this.congNo = congNo;
            return this;
        }

        public RepairOrderBuilder phuongThuc(String phuongThuc) {
            this.phuongThuc = phuongThuc;
            return this;
        }

        public RepairOrderBuilder ngayThanhToan(LocalDateTime ngayThanhToan) {
            this.ngayThanhToan = ngayThanhToan;
            return this;
        }

        public RepairOrderBuilder ghiChu(String ghiChu) {
            this.ghiChu = ghiChu;
            return this;
        }

        public RepairOrderBuilder parentOrderId(Integer parentOrderId) {
            this.parentOrderId = parentOrderId;
            return this;
        }

        public RepairOrderBuilder parentOrder(RepairOrder parentOrder) {
            this.parentOrder = parentOrder;
            return this;
        }

        public RepairOrderBuilder phieuTiepNhanId(Integer phieuTiepNhanId) {
            this.phieuTiepNhanId = phieuTiepNhanId;
            return this;
        }

        public RepairOrderBuilder thoPhanCongId(Integer thoPhanCongId) {
            this.thoPhanCongId = thoPhanCongId;
            return this;
        }

        public RepairOrderBuilder nguoiPhuTrachId(Integer nguoiPhuTrachId) {
            this.nguoiPhuTrachId = nguoiPhuTrachId;
            return this;
        }

        public RepairOrderBuilder phieuTiepNhan(Reception phieuTiepNhan) {
            this.phieuTiepNhan = phieuTiepNhan;
            return this;
        }

        public RepairOrderBuilder thoPhanCong(User thoPhanCong) {
            this.thoPhanCong = thoPhanCong;
            return this;
        }

        public RepairOrderBuilder thoChanDoanId(Integer thoChanDoanId) {
            this.thoChanDoanId = thoChanDoanId;
            return this;
        }

        public RepairOrderBuilder thoChanDoan(User thoChanDoan) {
            this.thoChanDoan = thoChanDoan;
            return this;
        }

        public RepairOrderBuilder nguoiPhuTrach(User nguoiPhuTrach) {
            this.nguoiPhuTrach = nguoiPhuTrach;
            return this;
        }

        public RepairOrderBuilder chiTietDonHang(List<OrderItem> chiTietDonHang) {
            this.chiTietDonHang = chiTietDonHang;
            return this;
        }

        public RepairOrderBuilder phieuXuatKho(List<ExportNote> phieuXuatKho) {
            this.phieuXuatKho = phieuXuatKho;
            return this;
        }

        public RepairOrder build() {
            return new RepairOrder(id, ngayTao, ngayDuyet, trangThai, tienCoc, tongTienHang, tongTienCong,
                    chietKhauTong, thueVAT, tongCong, laDonBaoHanh, soTienDaTra, congNo, phuongThuc, ngayThanhToan,
                    ghiChu, parentOrderId, parentOrder, phieuTiepNhanId, thoPhanCongId, nguoiPhuTrachId, phieuTiepNhan,
                    thoPhanCong, thoChanDoanId, thoChanDoan, nguoiPhuTrach, chiTietDonHang, phieuXuatKho);
        }
    }
}
