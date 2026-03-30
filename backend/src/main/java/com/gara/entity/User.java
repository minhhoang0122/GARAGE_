package com.gara.entity;

import com.gara.entity.enums.UserType;
import jakarta.persistence.*;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Collections;
import java.util.Collection;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_username", columnList = "username", unique = true),
        @Index(name = "idx_users_email", columnList = "email")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "specialty", length = 30)
    private com.gara.entity.enums.MechanicSpecialty specialty;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", length = 20)
    private com.gara.entity.enums.MechanicLevel level;

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false, length = 20)
    private UserType userType = UserType.STAFF;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new java.util.HashSet<>();

    // Getters and Setters
    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public boolean isActive() {
        return isActive != null && isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public com.gara.entity.enums.MechanicSpecialty getSpecialty() {
        return specialty;
    }

    public void setSpecialty(com.gara.entity.enums.MechanicSpecialty specialty) {
        this.specialty = specialty;
    }

    public com.gara.entity.enums.MechanicLevel getLevel() {
        return level;
    }

    public void setLevel(com.gara.entity.enums.MechanicLevel level) {
        this.level = level;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public UserType getUserType() {
        return userType;
    }

    public void setUserType(UserType userType) {
        this.userType = userType;
    }

    // Helper: Check if user is Workshop Manager
    public boolean isManager() {
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
