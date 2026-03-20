package com.gara.entity;

import jakarta.persistence.*;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Collections;
import java.util.Collection;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_dang_nhap", unique = true, nullable = false)
    private String tenDangNhap;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(name = "mat_khau_hash", nullable = false)
    private String matKhauHash;

    @Column(name = "ho_ten")
    private String hoTen;

    @Column(name = "so_dien_thoai")
    private String soDienThoai;

    @Column(name = "email")
    private String email;

    @Column(name = "trang_thai_hoat_dong")
    private Boolean trangThaiHoatDong = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "chuyen_mon", length = 30)
    private com.gara.entity.enums.MechanicSpecialty chuyenMon;

    @Enumerated(EnumType.STRING)
    @Column(name = "cap_bac", length = 20)
    private com.gara.entity.enums.MechanicLevel capBac;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new java.util.HashSet<>();

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getTrangThaiHoatDong() {
        return trangThaiHoatDong;
    }

    public void setTrangThaiHoatDong(Boolean trangThaiHoatDong) {
        this.trangThaiHoatDong = trangThaiHoatDong;
    }

    public com.gara.entity.enums.MechanicSpecialty getChuyenMon() {
        return chuyenMon;
    }

    public void setChuyenMon(com.gara.entity.enums.MechanicSpecialty chuyenMon) {
        this.chuyenMon = chuyenMon;
    }

    public com.gara.entity.enums.MechanicLevel getCapBac() {
        return capBac;
    }

    public void setCapBac(com.gara.entity.enums.MechanicLevel capBac) {
        this.capBac = capBac;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    // Helper: Check if user is Workshop Manager
    public boolean isQuanLy() {
        if (roles == null) return false;
        return roles.stream().anyMatch(r -> "QUAN_LY_XUONG".equals(r.getName()));
    }

    // Helper Methods
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (roles == null)
            return Collections.emptySet();
        Set<SimpleGrantedAuthority> authorities = new java.util.HashSet<>();
        roles.forEach(role -> {
            authorities.add(new SimpleGrantedAuthority(role.getName()));
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
            if (role.getPermissions() != null) {
                role.getPermissions().forEach(p -> authorities.add(new SimpleGrantedAuthority(p.getCode())));
            }
        });
        return authorities;
    }

    public java.util.List<String> getAllPermissions() {
        if (roles == null)
            return Collections.emptyList();
        return roles.stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getCode)
                .distinct()
                .collect(Collectors.toList());
    }

    public boolean isAdmin() {
        if (roles == null)
            return false;
        return roles.stream().anyMatch(r -> "ADMIN".equals(r.getName()));
    }

    public boolean hasPermission(String pCode) {
        if (isAdmin())
            return true;
        if (roles == null)
            return false;
        return roles.stream()
                .flatMap(r -> r.getPermissions().stream())
                .anyMatch(p -> p.getCode().equals(pCode));
    }
}
