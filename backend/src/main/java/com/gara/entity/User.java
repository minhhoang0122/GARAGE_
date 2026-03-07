package com.gara.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "nguoidung")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Column(name = "ten_dang_nhap", unique = true, nullable = false, length = 50)
    private String tenDangNhap;

    @Column(name = "mat_khau_hash", nullable = false, length = 255)
    private String matKhauHash;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "nguoidung_vaitro", joinColumns = @JoinColumn(name = "nguoidung_id"), inverseJoinColumns = @JoinColumn(name = "vaitro_id"))
    private Set<Role> roles = new HashSet<>();

    @Column(name = "trang_thai_hoat_dong")
    private Boolean trangThaiHoatDong = true;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
        if (trangThaiHoatDong == null) {
            trangThaiHoatDong = true;
        }
    }

    // --- Manual Implementation start ---
    public User() {
    }

    public User(Integer id, String hoTen, String soDienThoai, String tenDangNhap, String matKhauHash, Set<Role> roles,
            Boolean trangThaiHoatDong, LocalDateTime ngayTao) {
        this.id = id;
        this.hoTen = hoTen;
        this.soDienThoai = soDienThoai;
        this.tenDangNhap = tenDangNhap;
        this.matKhauHash = matKhauHash;
        this.roles = roles != null ? roles : new HashSet<>();
        this.trangThaiHoatDong = trangThaiHoatDong;
        this.ngayTao = ngayTao;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    @Deprecated
    public String getVaiTro() {
        // Fallback for current code using getVaiTro - return first role name or empty
        if (roles == null || roles.isEmpty())
            return "";
        return roles.iterator().next().getName();
    }

    public boolean hasPermission(String permissionCode) {
        if (roles == null)
            return false;
        return roles.stream()
                .flatMap(role -> role.getPermissions().stream())
                .anyMatch(p -> p.getCode().equals(permissionCode));
    }

    public boolean hasRole(String roleName) {
        if (roles == null)
            return false;
        return roles.stream()
                .anyMatch(r -> r.getName().equals(roleName));
    }

    public boolean isAdmin() {
        return hasRole("ADMIN");
    }

    public String getTenDangNhap() {
        return tenDangNhap;
    }

    public void setTenDangNhap(String tenDangNhap) {
        this.tenDangNhap = tenDangNhap;
    }

    public String getMatKhauHash() {
        return matKhauHash;
    }

    public void setMatKhauHash(String matKhauHash) {
        this.matKhauHash = matKhauHash;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public Boolean getTrangThaiHoatDong() {
        return trangThaiHoatDong;
    }

    public void setTrangThaiHoatDong(Boolean trangThaiHoatDong) {
        this.trangThaiHoatDong = trangThaiHoatDong;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private Integer id;
        private String hoTen;
        private String soDienThoai;
        private String tenDangNhap;
        private String matKhauHash;
        private Set<Role> roles = new HashSet<>();
        private Boolean trangThaiHoatDong;
        private LocalDateTime ngayTao;

        UserBuilder() {
        }

        public UserBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public UserBuilder hoTen(String hoTen) {
            this.hoTen = hoTen;
            return this;
        }

        public UserBuilder soDienThoai(String soDienThoai) {
            this.soDienThoai = soDienThoai;
            return this;
        }

        public UserBuilder tenDangNhap(String tenDangNhap) {
            this.tenDangNhap = tenDangNhap;
            return this;
        }

        public UserBuilder matKhauHash(String matKhauHash) {
            this.matKhauHash = matKhauHash;
            return this;
        }

        public UserBuilder roles(Set<Role> roles) {
            this.roles = roles;
            return this;
        }

        public UserBuilder role(Role role) {
            if (this.roles == null)
                this.roles = new HashSet<>();
            this.roles.add(role);
            return this;
        }

        public UserBuilder trangThaiHoatDong(Boolean trangThaiHoatDong) {
            this.trangThaiHoatDong = trangThaiHoatDong;
            return this;
        }

        public UserBuilder ngayTao(LocalDateTime ngayTao) {
            this.ngayTao = ngayTao;
            return this;
        }

        public User build() {
            return new User(id, hoTen, soDienThoai, tenDangNhap, matKhauHash, roles, trangThaiHoatDong, ngayTao);
        }
    }
    // --- Manual Implementation end ---
}
