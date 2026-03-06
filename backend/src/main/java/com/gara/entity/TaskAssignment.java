package com.gara.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "PhanCongCongViec")
public class TaskAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ChiTietDonHangID", nullable = false)
    private OrderItem chiTietDonHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ThoID", nullable = false)
    private User tho;

    @Column(name = "PhanTramCong", precision = 5, scale = 2)
    private BigDecimal phanTramCong; // e.g. 70.00 for 70%

    @Column(name = "LaThoChinh")
    private Boolean laThoChinh = false;

    @Column(name = "TrangThai", length = 20)
    private String trangThai; // APPROVED, PENDING

    public TaskAssignment() {
    }

    public TaskAssignment(Integer id, OrderItem chiTietDonHang, User tho, BigDecimal phanTramCong, Boolean laThoChinh,
            String trangThai) {
        this.id = id;
        this.chiTietDonHang = chiTietDonHang;
        this.tho = tho;
        this.phanTramCong = phanTramCong;
        this.laThoChinh = laThoChinh != null ? laThoChinh : false;
        this.trangThai = trangThai;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public OrderItem getChiTietDonHang() {
        return chiTietDonHang;
    }

    public void setChiTietDonHang(OrderItem chiTietDonHang) {
        this.chiTietDonHang = chiTietDonHang;
    }

    public User getTho() {
        return tho;
    }

    public void setTho(User tho) {
        this.tho = tho;
    }

    public BigDecimal getPhanTramCong() {
        return phanTramCong;
    }

    public void setPhanTramCong(BigDecimal phanTramCong) {
        this.phanTramCong = phanTramCong;
    }

    public Boolean getLaThoChinh() {
        return laThoChinh;
    }

    public void setLaThoChinh(Boolean laThoChinh) {
        this.laThoChinh = laThoChinh;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public static TaskAssignmentBuilder builder() {
        return new TaskAssignmentBuilder();
    }

    public static class TaskAssignmentBuilder {
        private Integer id;
        private OrderItem chiTietDonHang;
        private User tho;
        private BigDecimal phanTramCong;
        private Boolean laThoChinh = false;
        private String trangThai;

        public TaskAssignmentBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public TaskAssignmentBuilder chiTietDonHang(OrderItem chiTietDonHang) {
            this.chiTietDonHang = chiTietDonHang;
            return this;
        }

        public TaskAssignmentBuilder tho(User tho) {
            this.tho = tho;
            return this;
        }

        public TaskAssignmentBuilder phanTramCong(BigDecimal phanTramCong) {
            this.phanTramCong = phanTramCong;
            return this;
        }

        public TaskAssignmentBuilder laThoChinh(Boolean laThoChinh) {
            this.laThoChinh = laThoChinh;
            return this;
        }

        public TaskAssignmentBuilder trangThai(String trangThai) {
            this.trangThai = trangThai;
            return this;
        }

        public TaskAssignment build() {
            return new TaskAssignment(id, chiTietDonHang, tho, phanTramCong, laThoChinh, trangThai);
        }
    }
}
