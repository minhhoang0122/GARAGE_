package com.gara.dto;

import java.time.LocalDateTime;

public record VehicleHistoryDTO(
        Integer id,
        String licensePlate,
        String brand,
        String model,
        String vin,
        Integer currentOdo,
        String customerName,
        String customerPhone,
        LocalDateTime lastServiceDate,
        LocalDateTime nextMaintenanceDate,
        Integer nextMaintenanceOdo
) {
    public static VehicleHistoryDTOBuilder builder() {
        return new VehicleHistoryDTOBuilder();
    }

    public static class VehicleHistoryDTOBuilder {
        private Integer id;
        private String licensePlate;
        private String brand;
        private String model;
        private String vin;
        private Integer currentOdo;
        private String customerName;
        private String customerPhone;
        private LocalDateTime lastServiceDate;
        private LocalDateTime nextMaintenanceDate;
        private Integer nextMaintenanceOdo;

        public VehicleHistoryDTOBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public VehicleHistoryDTOBuilder licensePlate(String licensePlate) {
            this.licensePlate = licensePlate;
            return this;
        }

        public VehicleHistoryDTOBuilder brand(String brand) {
            this.brand = brand;
            return this;
        }

        public VehicleHistoryDTOBuilder model(String model) {
            this.model = model;
            return this;
        }

        public VehicleHistoryDTOBuilder vin(String vin) {
            this.vin = vin;
            return this;
        }

        public VehicleHistoryDTOBuilder currentOdo(Integer currentOdo) {
            this.currentOdo = currentOdo;
            return this;
        }

        public VehicleHistoryDTOBuilder customerName(String customerName) {
            this.customerName = customerName;
            return this;
        }

        public VehicleHistoryDTOBuilder customerPhone(String customerPhone) {
            this.customerPhone = customerPhone;
            return this;
        }

        public VehicleHistoryDTOBuilder lastServiceDate(LocalDateTime lastServiceDate) {
            this.lastServiceDate = lastServiceDate;
            return this;
        }

        public VehicleHistoryDTOBuilder nextMaintenanceDate(LocalDateTime nextMaintenanceDate) {
            this.nextMaintenanceDate = nextMaintenanceDate;
            return this;
        }

        public VehicleHistoryDTOBuilder nextMaintenanceOdo(Integer nextMaintenanceOdo) {
            this.nextMaintenanceOdo = nextMaintenanceOdo;
            return this;
        }

        public VehicleHistoryDTO build() {
            return new VehicleHistoryDTO(id, licensePlate, brand, model, vin, currentOdo, customerName, customerPhone, lastServiceDate, nextMaintenanceDate, nextMaintenanceOdo);
        }
    }
}
