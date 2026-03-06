package com.gara.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "HangHoa", indexes = {
        @Index(name = "idx_ma_hang", columnList = "MaHang"),
        @Index(name = "idx_ten_hang", columnList = "TenHang"),
        @Index(name = "idx_la_dich_vu", columnList = "LaDichVu")
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "MaHang", unique = true, nullable = false, length = 50)
    private String maHang;

    @Column(name = "TenHang", nullable = false, length = 200)
    private String tenHang;

    @Column(name = "GiaBanNiemYet", precision = 18, scale = 2)
    private BigDecimal giaBanNiemYet;

    @Column(name = "GiaVon", precision = 18, scale = 2)
    private BigDecimal giaVon = BigDecimal.ZERO;

    @Column(name = "GiaSan", precision = 18, scale = 2)
    private BigDecimal giaSan = BigDecimal.ZERO;

    @Column(name = "SoLuongTon")
    private Integer soLuongTon = 0;

    @Column(name = "DinhMucTonToiThieu")
    private Integer dinhMucTonToiThieu = 5;

    @Column(name = "BaoHanh_SoThang")
    private Integer baoHanhSoThang = 0;

    @Column(name = "BaoHanh_KM")
    private Integer baoHanhKm = 0;

    @Column(name = "LaDichVu")
    private Boolean laDichVu = false;

    @Column(name = "ThueVAT", precision = 5, scale = 2)
    private BigDecimal thueVAT = new BigDecimal("10.00"); // Default 10%

    @Column(name = "ChoPhepBaoHanh")
    private Boolean choPhepBaoHanh = true;

    @Column(name = "NgayTao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
        if (thueVAT == null)
            thueVAT = new BigDecimal("10.00");
    }

    public Product() {
    }

    public Product(Integer id, String maHang, String tenHang, BigDecimal giaBanNiemYet, BigDecimal giaVon,
            BigDecimal giaSan, Integer soLuongTon, Integer dinhMucTonToiThieu, Integer baoHanhSoThang,
            Integer baoHanhKm, Boolean laDichVu, BigDecimal thueVAT, Boolean choPhepBaoHanh, LocalDateTime ngayTao) {
        this.id = id;
        this.maHang = maHang;
        this.tenHang = tenHang;
        this.giaBanNiemYet = giaBanNiemYet;
        this.giaVon = giaVon;
        this.giaSan = giaSan;
        this.soLuongTon = soLuongTon;
        this.dinhMucTonToiThieu = dinhMucTonToiThieu;
        this.baoHanhSoThang = baoHanhSoThang;
        this.baoHanhKm = baoHanhKm;
        this.laDichVu = laDichVu;
        this.thueVAT = thueVAT;
        this.choPhepBaoHanh = choPhepBaoHanh;
        this.ngayTao = ngayTao;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMaHang() {
        return maHang;
    }

    public void setMaHang(String maHang) {
        this.maHang = maHang;
    }

    public String getTenHang() {
        return tenHang;
    }

    public void setTenHang(String tenHang) {
        this.tenHang = tenHang;
    }

    public BigDecimal getGiaBanNiemYet() {
        return giaBanNiemYet;
    }

    public void setGiaBanNiemYet(BigDecimal giaBanNiemYet) {
        this.giaBanNiemYet = giaBanNiemYet;
    }

    public BigDecimal getGiaVon() {
        return giaVon;
    }

    public void setGiaVon(BigDecimal giaVon) {
        this.giaVon = giaVon;
    }

    public BigDecimal getGiaSan() {
        return giaSan;
    }

    public void setGiaSan(BigDecimal giaSan) {
        this.giaSan = giaSan;
    }

    public Integer getSoLuongTon() {
        return soLuongTon;
    }

    public void setSoLuongTon(Integer soLuongTon) {
        this.soLuongTon = soLuongTon;
    }

    public Integer getDinhMucTonToiThieu() {
        return dinhMucTonToiThieu;
    }

    public void setDinhMucTonToiThieu(Integer dinhMucTonToiThieu) {
        this.dinhMucTonToiThieu = dinhMucTonToiThieu;
    }

    public Integer getBaoHanhSoThang() {
        return baoHanhSoThang;
    }

    public void setBaoHanhSoThang(Integer baoHanhSoThang) {
        this.baoHanhSoThang = baoHanhSoThang;
    }

    public Integer getBaoHanhKm() {
        return baoHanhKm;
    }

    public void setBaoHanhKm(Integer baoHanhKm) {
        this.baoHanhKm = baoHanhKm;
    }

    public Boolean getLaDichVu() {
        return laDichVu;
    }

    public void setLaDichVu(Boolean laDichVu) {
        this.laDichVu = laDichVu;
    }

    public BigDecimal getThueVAT() {
        return thueVAT;
    }

    public void setThueVAT(BigDecimal thueVAT) {
        this.thueVAT = thueVAT;
    }

    public Boolean getChoPhepBaoHanh() {
        return choPhepBaoHanh;
    }

    public void setChoPhepBaoHanh(Boolean choPhepBaoHanh) {
        this.choPhepBaoHanh = choPhepBaoHanh;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public static ProductBuilder builder() {
        return new ProductBuilder();
    }

    public static class ProductBuilder {
        private Integer id;
        private String maHang;
        private String tenHang;
        private BigDecimal giaBanNiemYet;
        private BigDecimal giaVon = BigDecimal.ZERO;
        private BigDecimal giaSan = BigDecimal.ZERO;
        private Integer soLuongTon = 0;
        private Integer dinhMucTonToiThieu = 5;
        private Integer baoHanhSoThang = 0;
        private Integer baoHanhKm = 0;
        private Boolean laDichVu = false;
        private BigDecimal thueVAT = new BigDecimal("10.00");
        private Boolean choPhepBaoHanh = true;
        private LocalDateTime ngayTao;

        public ProductBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public ProductBuilder maHang(String maHang) {
            this.maHang = maHang;
            return this;
        }

        public ProductBuilder tenHang(String tenHang) {
            this.tenHang = tenHang;
            return this;
        }

        public ProductBuilder giaBanNiemYet(BigDecimal giaBanNiemYet) {
            this.giaBanNiemYet = giaBanNiemYet;
            return this;
        }

        public ProductBuilder giaVon(BigDecimal giaVon) {
            this.giaVon = giaVon;
            return this;
        }

        public ProductBuilder giaSan(BigDecimal giaSan) {
            this.giaSan = giaSan;
            return this;
        }

        public ProductBuilder soLuongTon(Integer soLuongTon) {
            this.soLuongTon = soLuongTon;
            return this;
        }

        public ProductBuilder dinhMucTonToiThieu(Integer dinhMucTonToiThieu) {
            this.dinhMucTonToiThieu = dinhMucTonToiThieu;
            return this;
        }

        public ProductBuilder baoHanhSoThang(Integer baoHanhSoThang) {
            this.baoHanhSoThang = baoHanhSoThang;
            return this;
        }

        public ProductBuilder baoHanhKm(Integer baoHanhKm) {
            this.baoHanhKm = baoHanhKm;
            return this;
        }

        public ProductBuilder laDichVu(Boolean laDichVu) {
            this.laDichVu = laDichVu;
            return this;
        }

        public ProductBuilder thueVAT(BigDecimal thueVAT) {
            this.thueVAT = thueVAT;
            return this;
        }

        public ProductBuilder choPhepBaoHanh(Boolean choPhepBaoHanh) {
            this.choPhepBaoHanh = choPhepBaoHanh;
            return this;
        }

        public ProductBuilder ngayTao(LocalDateTime ngayTao) {
            this.ngayTao = ngayTao;
            return this;
        }

        public Product build() {
            return new Product(id, maHang, tenHang, giaBanNiemYet, giaVon, giaSan, soLuongTon, dinhMucTonToiThieu,
                    baoHanhSoThang, baoHanhKm, laDichVu, thueVAT, choPhepBaoHanh, ngayTao);
        }
    }
}
