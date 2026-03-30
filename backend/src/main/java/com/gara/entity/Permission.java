package com.gara.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "permissions")
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "code", unique = true, nullable = false, length = 50)
    private String code; // Ví dụ: CREATE_ORDER, APPROVE_QC

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "module", length = 50)
    private String module; // Ví dụ: SERVICE, INVENTORY, FINANCE

    public Permission() {
    }

    public Permission(Integer id, String code, String name, String module) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.module = module;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getModule() {
        return module;
    }

    public void setModule(String module) {
        this.module = module;
    }

    public static PermissionBuilder builder() {
        return new PermissionBuilder();
    }

    public static class PermissionBuilder {
        private Integer id;
        private String code;
        private String name;
        private String module;

        PermissionBuilder() {
        }

        public PermissionBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public PermissionBuilder code(String code) {
            this.code = code;
            return this;
        }

        public PermissionBuilder name(String name) {
            this.name = name;
            return this;
        }

        public PermissionBuilder module(String module) {
            this.module = module;
            return this;
        }

        public Permission build() {
            return new Permission(id, code, name, module);
        }
    }
}
