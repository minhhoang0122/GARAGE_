package com.gara.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "AuditLog")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Bang", length = 50, nullable = false)
    private String bang;

    @Column(name = "BanGhiID", nullable = false)
    private Integer banGhiId;

    @Column(name = "HanhDong", length = 20, nullable = false)
    private String hanhDong; // INSERT, UPDATE, DELETE

    @Column(name = "DuLieuCu", columnDefinition = "NVARCHAR(MAX)")
    private String duLieuCu;

    @Column(name = "DuLieuMoi", columnDefinition = "NVARCHAR(MAX)")
    private String duLieuMoi;

    @Column(name = "LyDo", length = 500)
    private String lyDo;

    @Column(name = "NgayTao")
    private LocalDateTime ngayTao;

    // Foreign Keys - allow direct ID insertion
    @Column(name = "NguoiThucHienID")
    private Integer nguoiThucHienId;

    // Relations (read-only for display)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "NguoiThucHienID", insertable = false, updatable = false)
    private User nguoiThucHien;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }

    public AuditLog() {
    }

    public AuditLog(Integer id, String bang, Integer banGhiId, String hanhDong, String duLieuCu, String duLieuMoi,
            String lyDo, LocalDateTime ngayTao, Integer nguoiThucHienId, User nguoiThucHien) {
        this.id = id;
        this.bang = bang;
        this.banGhiId = banGhiId;
        this.hanhDong = hanhDong;
        this.duLieuCu = duLieuCu;
        this.duLieuMoi = duLieuMoi;
        this.lyDo = lyDo;
        this.ngayTao = ngayTao;
        this.nguoiThucHienId = nguoiThucHienId;
        this.nguoiThucHien = nguoiThucHien;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getBang() {
        return bang;
    }

    public void setBang(String bang) {
        this.bang = bang;
    }

    public Integer getBanGhiId() {
        return banGhiId;
    }

    public void setBanGhiId(Integer banGhiId) {
        this.banGhiId = banGhiId;
    }

    public String getHanhDong() {
        return hanhDong;
    }

    public void setHanhDong(String hanhDong) {
        this.hanhDong = hanhDong;
    }

    public String getDuLieuCu() {
        return duLieuCu;
    }

    public void setDuLieuCu(String duLieuCu) {
        this.duLieuCu = duLieuCu;
    }

    public String getDuLieuMoi() {
        return duLieuMoi;
    }

    public void setDuLieuMoi(String duLieuMoi) {
        this.duLieuMoi = duLieuMoi;
    }

    public String getLyDo() {
        return lyDo;
    }

    public void setLyDo(String lyDo) {
        this.lyDo = lyDo;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
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

    public static AuditLogBuilder builder() {
        return new AuditLogBuilder();
    }

    public static class AuditLogBuilder {
        private Integer id;
        private String bang;
        private Integer banGhiId;
        private String hanhDong;
        private String duLieuCu;
        private String duLieuMoi;
        private String lyDo;
        private LocalDateTime ngayTao;
        private Integer nguoiThucHienId;
        private User nguoiThucHien;

        AuditLogBuilder() {
        }

        public AuditLogBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public AuditLogBuilder bang(String bang) {
            this.bang = bang;
            return this;
        }

        public AuditLogBuilder banGhiId(Integer banGhiId) {
            this.banGhiId = banGhiId;
            return this;
        }

        public AuditLogBuilder hanhDong(String hanhDong) {
            this.hanhDong = hanhDong;
            return this;
        }

        public AuditLogBuilder duLieuCu(String duLieuCu) {
            this.duLieuCu = duLieuCu;
            return this;
        }

        public AuditLogBuilder duLieuMoi(String duLieuMoi) {
            this.duLieuMoi = duLieuMoi;
            return this;
        }

        public AuditLogBuilder lyDo(String lyDo) {
            this.lyDo = lyDo;
            return this;
        }

        public AuditLogBuilder ngayTao(LocalDateTime ngayTao) {
            this.ngayTao = ngayTao;
            return this;
        }

        public AuditLogBuilder nguoiThucHienId(Integer nguoiThucHienId) {
            this.nguoiThucHienId = nguoiThucHienId;
            return this;
        }

        public AuditLogBuilder nguoiThucHien(User nguoiThucHien) {
            this.nguoiThucHien = nguoiThucHien;
            return this;
        }

        public AuditLog build() {
            return new AuditLog(id, bang, banGhiId, hanhDong, duLieuCu, duLieuMoi, lyDo, ngayTao, nguoiThucHienId,
                    nguoiThucHien);
        }
    }
}
