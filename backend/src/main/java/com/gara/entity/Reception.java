package com.gara.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "receptions")
public class Reception {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "reception_date")
    private LocalDateTime receptionDate;

    @Column(name = "shell_status", length = 500)
    private String shellStatus;

    @Column(name = "fuel_level", precision = 3, scale = 2)
    private BigDecimal fuelLevel;

    @Column(name = "odo")
    private Integer odo;

    @Column(name = "preliminary_request", length = 500)
    private String preliminaryRequest;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "images")
    private String images; // Lưu trữ mảng JSON các URL ảnh

    @Column(name = "license_plate", insertable = false, updatable = false)
    private String licensePlate;

    @Column(name = "receptionist_id", insertable = false, updatable = false)
    private Integer receptionistId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "license_plate", referencedColumnName = "license_plate", nullable = false)
    private Vehicle vehicle;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receptionist_id", nullable = false)
    private User receptionist;

    @OneToOne(mappedBy = "reception", cascade = CascadeType.ALL)
    private RepairOrder repairOrder;

    @PrePersist
    protected void onCreate() {
        if (receptionDate == null) {
            receptionDate = LocalDateTime.now();
        }
    }

    public Reception() {
    }

    public Reception(Integer id, LocalDateTime receptionDate, String shellStatus, BigDecimal fuelLevel, Integer odo,
            String preliminaryRequest, String images, String licensePlate, Integer receptionistId, Vehicle vehicle, User receptionist,
            RepairOrder repairOrder) {
        this.id = id;
        this.receptionDate = receptionDate;
        this.shellStatus = shellStatus;
        this.fuelLevel = fuelLevel;
        this.odo = odo;
        this.preliminaryRequest = preliminaryRequest;
        this.images = images;
        this.licensePlate = licensePlate;
        this.receptionistId = receptionistId;
        this.vehicle = vehicle;
        this.receptionist = receptionist;
        this.repairOrder = repairOrder;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDateTime getReceptionDate() {
        return receptionDate;
    }

    public void setReceptionDate(LocalDateTime receptionDate) {
        this.receptionDate = receptionDate;
    }

    public String getShellStatus() {
        return shellStatus;
    }

    public void setShellStatus(String shellStatus) {
        this.shellStatus = shellStatus;
    }

    public BigDecimal getFuelLevel() {
        return fuelLevel;
    }

    public void setFuelLevel(BigDecimal fuelLevel) {
        this.fuelLevel = fuelLevel;
    }

    public Integer getOdo() {
        return odo;
    }

    public void setOdo(Integer odo) {
        this.odo = odo;
    }

    public String getPreliminaryRequest() {
        return preliminaryRequest;
    }

    public void setPreliminaryRequest(String preliminaryRequest) {
        this.preliminaryRequest = preliminaryRequest;
    }

    public String getImages() {
        return images;
    }

    public void setImages(String images) {
        this.images = images;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public Integer getReceptionistId() {
        return receptionistId;
    }

    public void setReceptionistId(Integer receptionistId) {
        this.receptionistId = receptionistId;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public User getReceptionist() {
        return receptionist;
    }

    public void setReceptionist(User receptionist) {
        this.receptionist = receptionist;
    }

    public RepairOrder getRepairOrder() {
        return repairOrder;
    }

    public void setRepairOrder(RepairOrder repairOrder) {
        this.repairOrder = repairOrder;
    }

    public static ReceptionBuilder builder() {
        return new ReceptionBuilder();
    }

    public static class ReceptionBuilder {
        private Integer id;
        private LocalDateTime receptionDate;
        private String shellStatus;
        private BigDecimal fuelLevel;
        private Integer odo;
        private String preliminaryRequest;
        private String images;
        private String licensePlate;
        private Integer receptionistId;
        private Vehicle vehicle;
        private User receptionist;
        private RepairOrder repairOrder;

        ReceptionBuilder() {
        }

        public ReceptionBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public ReceptionBuilder receptionDate(LocalDateTime receptionDate) {
            this.receptionDate = receptionDate;
            return this;
        }

        public ReceptionBuilder shellStatus(String shellStatus) {
            this.shellStatus = shellStatus;
            return this;
        }

        public ReceptionBuilder fuelLevel(BigDecimal fuelLevel) {
            this.fuelLevel = fuelLevel;
            return this;
        }

        public ReceptionBuilder odo(Integer odo) {
            this.odo = odo;
            return this;
        }

        public ReceptionBuilder preliminaryRequest(String preliminaryRequest) {
            this.preliminaryRequest = preliminaryRequest;
            return this;
        }

        public ReceptionBuilder images(String images) {
            this.images = images;
            return this;
        }

        public ReceptionBuilder licensePlate(String licensePlate) {
            this.licensePlate = licensePlate;
            return this;
        }

        public ReceptionBuilder receptionistId(Integer receptionistId) {
            this.receptionistId = receptionistId;
            return this;
        }

        public ReceptionBuilder vehicle(Vehicle vehicle) {
            this.vehicle = vehicle;
            return this;
        }

        public ReceptionBuilder receptionist(User receptionist) {
            this.receptionist = receptionist;
            return this;
        }

        public ReceptionBuilder repairOrder(RepairOrder repairOrder) {
            this.repairOrder = repairOrder;
            return this;
        }

        public Reception build() {
            return new Reception(id, receptionDate, shellStatus, fuelLevel, odo, preliminaryRequest, images, licensePlate,
                    receptionistId, vehicle, receptionist, repairOrder);
        }
    }
}
