package com.gara.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CustomerDTO(
        Integer id,
        String fullName,
        String phone,
        String email,
        String address,
        String notes,
        String customerGroup,
        LocalDateTime lastVisit,
        Integer vehicleCount,
        List<String> licensePlates
) {
    public static CustomerDTOBuilder builder() {
        return new CustomerDTOBuilder();
    }

    public static class CustomerDTOBuilder {
        private Integer id;
        private String fullName;
        private String phone;
        private String email;
        private String address;
        private String notes;
        private String customerGroup;
        private LocalDateTime lastVisit;
        private Integer vehicleCount = 0;
        private List<String> licensePlates;

        public CustomerDTOBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public CustomerDTOBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public CustomerDTOBuilder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public CustomerDTOBuilder email(String email) {
            this.email = email;
            return this;
        }

        public CustomerDTOBuilder address(String address) {
            this.address = address;
            return this;
        }

        public CustomerDTOBuilder notes(String notes) {
            this.notes = notes;
            return this;
        }

        public CustomerDTOBuilder customerGroup(String customerGroup) {
            this.customerGroup = customerGroup;
            return this;
        }

        public CustomerDTOBuilder lastVisit(LocalDateTime lastVisit) {
            this.lastVisit = lastVisit;
            return this;
        }

        public CustomerDTOBuilder vehicleCount(Integer vehicleCount) {
            this.vehicleCount = vehicleCount;
            return this;
        }

        public CustomerDTOBuilder licensePlates(List<String> licensePlates) {
            this.licensePlates = licensePlates;
            return this;
        }

        public CustomerDTO build() {
            return new CustomerDTO(id, fullName, phone, email, address, notes, customerGroup, lastVisit, vehicleCount, licensePlates);
        }
    }
}
