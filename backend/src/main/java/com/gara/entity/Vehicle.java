package com.gara.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles", indexes = {
        @Index(name = "idx_vehicles_license_plate", columnList = "license_plate", unique = true),
        @Index(name = "idx_vehicles_vin", columnList = "vin"),
        @Index(name = "idx_vehicles_brand", columnList = "vehicle_name"),
        @Index(name = "idx_vehicles_model", columnList = "model"),
        @Index(name = "idx_vehicles_customer_id", columnList = "customer_id")
})
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "license_plate", length = 20, unique = true, nullable = false)
    private String licensePlate;

    @Column(name = "vin", length = 50)
    private String vin;

    @Column(name = "engine_number", length = 50)
    private String engineNumber;

    @Column(name = "vehicle_name", length = 100)
    private String brand;

    @Column(name = "model", length = 50)
    private String model;

    @Column(name = "color", length = 30)
    private String color;

    @Column(name = "production_year")
    private Integer productionYear;

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType = "CAR"; // CAR, MOTO, TRUCK...

    @Column(name = "current_odo")
    private Integer currentOdo = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "customer_id", insertable = false, updatable = false)
    private Integer customerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (currentOdo == null) {
            currentOdo = 0;
        }
        normalizeAndValidate();
    }

    @PreUpdate
    protected void onUpdate() {
        normalizeAndValidate();
    }

    private void normalizeAndValidate() {
        if (licensePlate == null || licensePlate.isBlank()) {
            throw new RuntimeException("Biển số không được để trống.");
        }

        // 1. Clean: Remove all non-alphanumeric characters and Uppercase
        String raw = licensePlate.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();

        if (raw.length() < 7 || raw.length() > 9) {
            throw new RuntimeException("Độ dài biển số không hợp lệ (7-9 ký tự số/chữ).");
        }

        // 2. Auto-Format based on Vehicle Type and Length
        if ("CAR".equalsIgnoreCase(vehicleType)) {
            // New Standard (5 numbers): 30K12345 -> 30K-123.45
            if (raw.length() == 8) {
                this.licensePlate = raw.substring(0, 3) + "-" + raw.substring(3, 6) + "." + raw.substring(6);
            }
            // Old Standard (4 numbers): 29A9999 -> 29A-9999
            else if (raw.length() == 7) {
                this.licensePlate = raw.substring(0, 3) + "-" + raw.substring(3);
            } else {
                this.licensePlate = raw;
            }
        } else if ("MOTO".equalsIgnoreCase(vehicleType)) {
            // New/Standard (5 numbers): 29X112345 -> 29-X1 123.45
            if (raw.length() == 9) {
                this.licensePlate = raw.substring(0, 2) + "-" + raw.substring(2, 4) + " " + raw.substring(4, 7) + "."
                        + raw.substring(7);
            }
            // Old 4-num MOTO if needed (29H19999 -> 29-H1 9999) - Length 8
            else if (raw.length() == 8) {
                this.licensePlate = raw.substring(0, 2) + "-" + raw.substring(2, 4) + " " + raw.substring(4);
            } else {
                this.licensePlate = raw;
            }
        } else {
            this.licensePlate = raw;
        }
    }

    public Vehicle() {
    }

    public Vehicle(Integer id, String licensePlate, String vin, String engineNumber, String brand, String model,
            Integer currentOdo,
            LocalDateTime createdAt, Integer customerId, Customer customer) {
        this.id = id;
        this.licensePlate = licensePlate;
        this.vin = vin;
        this.engineNumber = engineNumber;
        this.brand = brand;
        this.model = model;
        this.currentOdo = currentOdo;
        this.createdAt = createdAt;
        this.customerId = customerId;
        this.customer = customer;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getVin() {
        return vin;
    }

    public void setVin(String vin) {
        this.vin = vin;
    }

    public String getEngineNumber() {
        return engineNumber;
    }

    public void setEngineNumber(String engineNumber) {
        this.engineNumber = engineNumber;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public Integer getCurrentOdo() {
        return currentOdo;
    }

    public void setCurrentOdo(Integer currentOdo) {
        this.currentOdo = currentOdo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public static VehicleBuilder builder() {
        return new VehicleBuilder();
    }

    public static class VehicleBuilder {
        private Integer id;
        private String licensePlate;
        private String vin;
        private String engineNumber;
        private String brand;
        private String model;
        private Integer currentOdo = 0;
        private LocalDateTime createdAt;
        private Integer customerId;
        private Customer customer;

        public VehicleBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public VehicleBuilder licensePlate(String licensePlate) {
            this.licensePlate = licensePlate;
            return this;
        }

        public VehicleBuilder vin(String vin) {
            this.vin = vin;
            return this;
        }

        public VehicleBuilder engineNumber(String engineNumber) {
            this.engineNumber = engineNumber;
            return this;
        }

        public VehicleBuilder brand(String brand) {
            this.brand = brand;
            return this;
        }

        public VehicleBuilder model(String model) {
            this.model = model;
            return this;
        }

        public VehicleBuilder currentOdo(Integer currentOdo) {
            this.currentOdo = currentOdo;
            return this;
        }

        public VehicleBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public VehicleBuilder customerId(Integer customerId) {
            this.customerId = customerId;
            return this;
        }

        public VehicleBuilder customer(Customer customer) {
            this.customer = customer;
            return this;
        }

        public Vehicle build() {
            return new Vehicle(id, licensePlate, vin, engineNumber, brand, model, currentOdo, createdAt, customerId,
                    customer);
        }
    }
}
