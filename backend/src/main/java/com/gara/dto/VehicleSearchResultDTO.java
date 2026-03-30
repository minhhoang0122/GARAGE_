package com.gara.dto;

public record VehicleSearchResultDTO(
        boolean exists,
        String plate,
        String customerName,
        String customerPhone,
        String customerAddress,
        String customerEmail,
        String brand,
        String model,
        String soKhung,
        String soMay,
        Integer odo,
        Object history,
        Object customer,
        int activeWarrantyCount) {

    public static VehicleSearchResultDTOBuilder builder() {
        return new VehicleSearchResultDTOBuilder();
    }

    public static class VehicleSearchResultDTOBuilder {
        private boolean exists;
        private String plate;
        private String customerName;
        private String customerPhone;
        private String customerAddress;
        private String customerEmail;
        private String brand;
        private String model;
        private String soKhung;
        private String soMay;
        private Integer odo;
        private Object history;
        private Object customer;
        private int activeWarrantyCount;

        public VehicleSearchResultDTOBuilder exists(boolean exists) {
            this.exists = exists;
            return this;
        }

        public VehicleSearchResultDTOBuilder plate(String plate) {
            this.plate = plate;
            return this;
        }

        public VehicleSearchResultDTOBuilder customerName(String customerName) {
            this.customerName = customerName;
            return this;
        }

        public VehicleSearchResultDTOBuilder customerPhone(String customerPhone) {
            this.customerPhone = customerPhone;
            return this;
        }

        public VehicleSearchResultDTOBuilder customerAddress(String customerAddress) {
            this.customerAddress = customerAddress;
            return this;
        }

        public VehicleSearchResultDTOBuilder customerEmail(String customerEmail) {
            this.customerEmail = customerEmail;
            return this;
        }

        public VehicleSearchResultDTOBuilder brand(String brand) {
            this.brand = brand;
            return this;
        }

        public VehicleSearchResultDTOBuilder model(String model) {
            this.model = model;
            return this;
        }

        public VehicleSearchResultDTOBuilder soKhung(String soKhung) {
            this.soKhung = soKhung;
            return this;
        }

        public VehicleSearchResultDTOBuilder soMay(String soMay) {
            this.soMay = soMay;
            return this;
        }

        public VehicleSearchResultDTOBuilder odo(Integer odo) {
            this.odo = odo;
            return this;
        }

        public VehicleSearchResultDTOBuilder history(Object history) {
            this.history = history;
            return this;
        }

        public VehicleSearchResultDTOBuilder customer(Object customer) {
            this.customer = customer;
            return this;
        }

        public VehicleSearchResultDTOBuilder activeWarrantyCount(int activeWarrantyCount) {
            this.activeWarrantyCount = activeWarrantyCount;
            return this;
        }

        public VehicleSearchResultDTO build() {
            return new VehicleSearchResultDTO(exists, plate, customerName, customerPhone, customerAddress, customerEmail, brand, model, soKhung, soMay,
                    odo, history, customer, activeWarrantyCount);
        }
    }
}
