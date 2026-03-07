package com.gara.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "vaitro")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_vaitro", unique = true, nullable = false, length = 50)
    private String name; // Ví dụ: MANAGER, RECEPTIONIST, MECHANIC

    @Column(name = "mo_ta", length = 255)
    private String description;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "vaitro_quyen_map", joinColumns = @JoinColumn(name = "vaitro_id"), inverseJoinColumns = @JoinColumn(name = "quyen_id"))
    private Set<Permission> permissions = new HashSet<>();

    public Role() {
    }

    public Role(Integer id, String name, String description, Set<Permission> permissions) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.permissions = permissions != null ? permissions : new HashSet<>();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    public void setPermissions(Set<Permission> permissions) {
        this.permissions = permissions;
    }

    public static RoleBuilder builder() {
        return new RoleBuilder();
    }

    public static class RoleBuilder {
        private Integer id;
        private String name;
        private String description;
        private Set<Permission> permissions = new HashSet<>();

        RoleBuilder() {
        }

        public RoleBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public RoleBuilder name(String name) {
            this.name = name;
            return this;
        }

        public RoleBuilder description(String description) {
            this.description = description;
            return this;
        }

        public RoleBuilder permissions(Set<Permission> permissions) {
            this.permissions = permissions;
            return this;
        }

        public Role build() {
            return new Role(id, name, description, permissions);
        }
    }
}
