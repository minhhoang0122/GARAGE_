package com.gara.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;
import com.gara.entity.enums.ItemStatus;

@Entity
@Table(name = "chitietdonhang")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "don_gia_goc", precision = 18, scale = 2)
    private BigDecimal donGiaGoc;

    @Column(name = "giam_gia_tien", precision = 18, scale = 2)
    private BigDecimal giamGiaTien = BigDecimal.ZERO;

    @Column(name = "giam_gia_phan_tram", precision = 5, scale = 2)
    private BigDecimal giamGiaPhanTram = BigDecimal.ZERO;

    @Column(name = "thanh_tien", precision = 18, scale = 2)
    private BigDecimal thanhTien;

    @Column(name = "vat_phan_tram", precision = 5, scale = 2)
    private BigDecimal vatPhanTram = new BigDecimal("10.00");

    @Column(name = "tien_thue", precision = 18, scale = 2)
    private BigDecimal tienThue = BigDecimal.ZERO;

    @Column(name = "uu_tien")
    private Integer uuTien = 0;

    @Column(name = "ly_do_chinh_gia", length = 200)
    private String lyDoChinhGia;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", length = 20)
    private ItemStatus trangThai = ItemStatus.DE_XUAT; // DE_XUAT, KHACH_DONG_Y, KHACH_TU_CHOI

    @Column(name = "la_hang_bao_hanh")
    private Boolean laHangBaoHanh = false;

    @Column(name = "ghi_chu_bao_hanh", length = 500)
    private String ghiChuBaoHanh;

    @Column(name = "da_hoan_thanh")
    private Boolean daHoanThanh = false;

    @Column(name = "so_luong_tho_toi_da")
    private Integer soLuongThoToiDa = 4;

    // Foreign Keys
    @Column(name = "don_hang_sua_chua_id", insertable = false, updatable = false)
    private Integer donHangSuaChuaId;

    @Column(name = "hang_hoa_id", insertable = false, updatable = false)
    private Integer hangHoaId;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "don_hang_sua_chua_id", nullable = false)
    private RepairOrder donHangSuaChua;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hang_hoa_id", nullable = false)
    private Product hangHoa;

    @Column(name = "nguoi_thuc_hien_id", insertable = false, updatable = false)
    private Integer nguoiThucHienId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_thuc_hien_id")
    private User nguoiThucHien;

    @OneToMany(mappedBy = "chiTietDonHang", cascade = CascadeType.ALL)
    private List<TaskAssignment> phanCongTho;

    @Column(name = "nguoi_de_xuat_id", insertable = false, updatable = false)
    private Integer nguoiDeXuatId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_de_xuat_id")
    private User nguoiDeXuat;

    public OrderItem() {
    }

    public OrderItem(Integer id, Integer soLuong, BigDecimal donGiaGoc, BigDecimal giamGiaTien,
            BigDecimal giamGiaPhanTram, BigDecimal thanhTien, BigDecimal vatPhanTram, BigDecimal tienThue,
            Integer uuTien, String lyDoChinhGia, ItemStatus trangThai,
            Boolean laHangBaoHanh, String ghiChuBaoHanh, Boolean daHoanThanh, Integer soLuongThoToiDa,
            Integer donHangSuaChuaId, Integer hangHoaId, RepairOrder donHangSuaChua, Product hangHoa,
            Integer nguoiThucHienId, User nguoiThucHien, List<TaskAssignment> phanCongTho) {
        this.id = id;
        this.soLuong = soLuong;
        this.donGiaGoc = donGiaGoc;
        this.giamGiaTien = giamGiaTien != null ? giamGiaTien : BigDecimal.ZERO;
        this.giamGiaPhanTram = giamGiaPhanTram != null ? giamGiaPhanTram : BigDecimal.ZERO;
        this.thanhTien = thanhTien;
        this.vatPhanTram = vatPhanTram != null ? vatPhanTram : new BigDecimal("10.00");
        this.tienThue = tienThue != null ? tienThue : BigDecimal.ZERO;
        this.uuTien = uuTien != null ? uuTien : 0;
        this.lyDoChinhGia = lyDoChinhGia;
        this.trangThai = trangThai != null ? trangThai : ItemStatus.DE_XUAT;
        this.laHangBaoHanh = laHangBaoHanh != null ? laHangBaoHanh : false;
        this.ghiChuBaoHanh = ghiChuBaoHanh;
        this.daHoanThanh = daHoanThanh != null ? daHoanThanh : false;
        this.soLuongThoToiDa = soLuongThoToiDa != null ? soLuongThoToiDa : 4;
        this.donHangSuaChuaId = donHangSuaChuaId;
        this.hangHoaId = hangHoaId;
        this.donHangSuaChua = donHangSuaChua;
        this.hangHoa = hangHoa;
        this.nguoiThucHienId = nguoiThucHienId;
        this.nguoiThucHien = nguoiThucHien;
        this.phanCongTho = phanCongTho;
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

    public BigDecimal getDonGiaGoc() {
        return donGiaGoc;
    }

    public void setDonGiaGoc(BigDecimal donGiaGoc) {
        this.donGiaGoc = donGiaGoc;
    }

    public BigDecimal getGiamGiaTien() {
        return giamGiaTien;
    }

    public void setGiamGiaTien(BigDecimal giamGiaTien) {
        this.giamGiaTien = giamGiaTien;
    }

    public BigDecimal getGiamGiaPhanTram() {
        return giamGiaPhanTram;
    }

    public void setGiamGiaPhanTram(BigDecimal giamGiaPhanTram) {
        this.giamGiaPhanTram = giamGiaPhanTram;
    }

    public BigDecimal getThanhTien() {
        return thanhTien;
    }

    public void setThanhTien(BigDecimal thanhTien) {
        this.thanhTien = thanhTien;
    }

    public BigDecimal getVatPhanTram() {
        return vatPhanTram;
    }

    public void setVatPhanTram(BigDecimal vatPhanTram) {
        this.vatPhanTram = vatPhanTram;
    }

    public BigDecimal getTienThue() {
        return tienThue;
    }

    public void setTienThue(BigDecimal tienThue) {
        this.tienThue = tienThue;
    }

    public Integer getUuTien() {
        return uuTien;
    }

    public void setUuTien(Integer uuTien) {
        this.uuTien = uuTien;
    }

    public String getLyDoChinhGia() {
        return lyDoChinhGia;
    }

    public void setLyDoChinhGia(String lyDoChinhGia) {
        this.lyDoChinhGia = lyDoChinhGia;
    }

    public ItemStatus getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(ItemStatus trangThai) {
        this.trangThai = trangThai;
    }

    public Boolean getLaHangBaoHanh() {
        return laHangBaoHanh;
    }

    public void setLaHangBaoHanh(Boolean laHangBaoHanh) {
        this.laHangBaoHanh = laHangBaoHanh;
    }

    public String getGhiChuBaoHanh() {
        return ghiChuBaoHanh;
    }

    public void setGhiChuBaoHanh(String ghiChuBaoHanh) {
        this.ghiChuBaoHanh = ghiChuBaoHanh;
    }

    public Boolean getDaHoanThanh() {
        return daHoanThanh;
    }

    public void setDaHoanThanh(Boolean daHoanThanh) {
        this.daHoanThanh = daHoanThanh;
    }

    public Integer getSoLuongThoToiDa() {
        return soLuongThoToiDa;
    }

    public void setSoLuongThoToiDa(Integer soLuongThoToiDa) {
        this.soLuongThoToiDa = soLuongThoToiDa;
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

    public Integer getNguoiThucHienId() {
        return nguoiThucHienId;
    }

    public void setNguoiThucHienId(Integer nguoiThucHienId) {
        this.nguoiThucHienId = nguoiThucHienId;
    }

    public User getNguoiThucHien() {
        return nguoiThucHien;
    }

    public void setNguoiThucHien(User nguoiThucHien) {
        this.nguoiThucHien = nguoiThucHien;
    }

    public List<TaskAssignment> getPhanCongTho() {
        return phanCongTho;
    }

    public void setPhanCongTho(List<TaskAssignment> phanCongTho) {
        this.phanCongTho = phanCongTho;
    }

    public Integer getNguoiDeXuatId() {
        return nguoiDeXuatId;
    }

    public void setNguoiDeXuatId(Integer nguoiDeXuatId) {
        this.nguoiDeXuatId = nguoiDeXuatId;
    }

    public User getNguoiDeXuat() {
        return nguoiDeXuat;
    }

    public void setNguoiDeXuat(User nguoiDeXuat) {
        this.nguoiDeXuat = nguoiDeXuat;
    }

    public static OrderItemBuilder builder() {
        return new OrderItemBuilder();
    }

    public static class OrderItemBuilder {
        private Integer id;
        private Integer soLuong;
        private BigDecimal donGiaGoc;
        private BigDecimal giamGiaTien = BigDecimal.ZERO;
        private BigDecimal giamGiaPhanTram = BigDecimal.ZERO;
        private BigDecimal thanhTien;
        private BigDecimal vatPhanTram = new BigDecimal("10.00");
        private BigDecimal tienThue = BigDecimal.ZERO;
        private Integer uuTien = 0;
        private String lyDoChinhGia;
        private ItemStatus trangThai = ItemStatus.DE_XUAT;
        private Boolean laHangBaoHanh = false;
        private String ghiChuBaoHanh;
        private Boolean daHoanThanh = false;
        private Integer soLuongThoToiDa = 4;
        private Integer donHangSuaChuaId;
        private Integer hangHoaId;
        private RepairOrder donHangSuaChua;
        private Product hangHoa;
        private Integer nguoiThucHienId;
        private User nguoiThucHien;
        private List<TaskAssignment> phanCongTho;

        public OrderItemBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public OrderItemBuilder soLuong(Integer soLuong) {
            this.soLuong = soLuong;
            return this;
        }

        public OrderItemBuilder donGiaGoc(BigDecimal donGiaGoc) {
            this.donGiaGoc = donGiaGoc;
            return this;
        }

        public OrderItemBuilder giamGiaTien(BigDecimal giamGiaTien) {
            this.giamGiaTien = giamGiaTien;
            return this;
        }

        public OrderItemBuilder giamGiaPhanTram(BigDecimal giamGiaPhanTram) {
            this.giamGiaPhanTram = giamGiaPhanTram;
            return this;
        }

        public OrderItemBuilder thanhTien(BigDecimal thanhTien) {
            this.thanhTien = thanhTien;
            return this;
        }

        public OrderItemBuilder vatPhanTram(BigDecimal vatPhanTram) {
            this.vatPhanTram = vatPhanTram;
            return this;
        }

        public OrderItemBuilder tienThue(BigDecimal tienThue) {
            this.tienThue = tienThue;
            return this;
        }

        public OrderItemBuilder uuTien(Integer uuTien) {
            this.uuTien = uuTien;
            return this;
        }

        public OrderItemBuilder lyDoChinhGia(String lyDoChinhGia) {
            this.lyDoChinhGia = lyDoChinhGia;
            return this;
        }

        public OrderItemBuilder trangThai(ItemStatus trangThai) {
            this.trangThai = trangThai;
            return this;
        }

        public OrderItemBuilder laHangBaoHanh(Boolean laHangBaoHanh) {
            this.laHangBaoHanh = laHangBaoHanh;
            return this;
        }

        public OrderItemBuilder ghiChuBaoHanh(String ghiChuBaoHanh) {
            this.ghiChuBaoHanh = ghiChuBaoHanh;
            return this;
        }

        public OrderItemBuilder daHoanThanh(Boolean daHoanThanh) {
            this.daHoanThanh = daHoanThanh;
            return this;
        }

        public OrderItemBuilder soLuongThoToiDa(Integer soLuongThoToiDa) {
            this.soLuongThoToiDa = soLuongThoToiDa;
            return this;
        }

        public OrderItemBuilder donHangSuaChuaId(Integer donHangSuaChuaId) {
            this.donHangSuaChuaId = donHangSuaChuaId;
            return this;
        }

        public OrderItemBuilder hangHoaId(Integer hangHoaId) {
            this.hangHoaId = hangHoaId;
            return this;
        }

        public OrderItemBuilder donHangSuaChua(RepairOrder donHangSuaChua) {
            this.donHangSuaChua = donHangSuaChua;
            return this;
        }

        public OrderItemBuilder hangHoa(Product hangHoa) {
            this.hangHoa = hangHoa;
            return this;
        }

        public OrderItemBuilder nguoiThucHienId(Integer nguoiThucHienId) {
            this.nguoiThucHienId = nguoiThucHienId;
            return this;
        }

        public OrderItemBuilder nguoiThucHien(User nguoiThucHien) {
            this.nguoiThucHien = nguoiThucHien;
            return this;
        }

        public OrderItemBuilder phanCongTho(List<TaskAssignment> phanCongTho) {
            this.phanCongTho = phanCongTho;
            return this;
        }

        public OrderItem build() {
            return new OrderItem(id, soLuong, donGiaGoc, giamGiaTien, giamGiaPhanTram, thanhTien, vatPhanTram, tienThue,
                    uuTien, lyDoChinhGia, trangThai, laHangBaoHanh, ghiChuBaoHanh, daHoanThanh, soLuongThoToiDa,
                    donHangSuaChuaId, hangHoaId, donHangSuaChua, hangHoa, nguoiThucHienId, nguoiThucHien, phanCongTho);
        }
    }
}
