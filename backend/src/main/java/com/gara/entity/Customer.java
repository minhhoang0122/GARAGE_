package com.gara.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "customers", indexes = {
        @Index(name = "idx_customers_full_name", columnList = "full_name"),
        @Index(name = "idx_customers_phone", columnList = "phone"),
        @Index(name = "idx_customers_created_at", columnList = "created_at")
})
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "customer_group", length = 50)
    private String customerGroup;

    @Column(name = "user_id") // Link to system user for notifications
    private Integer userId;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User systemUser;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<Vehicle> vehicles;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Customer() {
    }

    public Customer(Integer id, String fullName, String phone, String address, String email, LocalDateTime createdAt,
            String notes, String customerGroup,
            Integer userId, User systemUser, List<Vehicle> vehicles) {
        this.id = id;
        this.fullName = fullName;
        this.phone = phone;
        this.address = address;
        this.email = email;
        this.createdAt = createdAt;
        this.notes = notes;
        this.customerGroup = customerGroup;
        this.userId = userId;
        this.systemUser = systemUser;
        this.vehicles = vehicles;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCustomerGroup() {
        return customerGroup;
    }

    public void setCustomerGroup(String customerGroup) {
        this.customerGroup = customerGroup;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public User getSystemUser() {
        return systemUser;
    }

    public void setSystemUser(User systemUser) {
        this.systemUser = systemUser;
    }

    public List<Vehicle> getVehicles() {
        return vehicles;
    }

    public void setVehicles(List<Vehicle> vehicles) {
        this.vehicles = vehicles;
    }

    public static CustomerBuilder builder() {
        return new CustomerBuilder();
    }

    public static class CustomerBuilder {
        private Integer id;
        private String fullName;
        private String phone;
        private String address;
        private String email;
        private LocalDateTime createdAt;
        private String notes;
        private String customerGroup;
        private Integer userId;
        private User systemUser;
        private List<Vehicle> vehicles;

        public CustomerBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public CustomerBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public CustomerBuilder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public CustomerBuilder address(String address) {
            this.address = address;
            return this;
        }

        public CustomerBuilder email(String email) {
            this.email = email;
            return this;
        }

        public CustomerBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public CustomerBuilder notes(String notes) {
            this.notes = notes;
            return this;
        }

        public CustomerBuilder customerGroup(String customerGroup) {
            this.customerGroup = customerGroup;
            return this;
        }

        public CustomerBuilder userId(Integer userId) {
            this.userId = userId;
            return this;
        }

        public CustomerBuilder systemUser(User systemUser) {
            this.systemUser = systemUser;
            return this;
        }

        public CustomerBuilder vehicles(List<Vehicle> vehicles) {
            this.vehicles = vehicles;
            return this;
        }

        public Customer build() {
            return new Customer(id, fullName, phone, address, email, createdAt, notes, customerGroup, userId, systemUser, vehicles);
        }
    }
}
