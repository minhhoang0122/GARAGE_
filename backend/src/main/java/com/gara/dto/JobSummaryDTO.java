package com.gara.dto;

import java.time.LocalDateTime;
import java.util.List;

public record JobSummaryDTO(
                Integer id,
                String plate,
                String customerName,
                String customerPhone,
                String vehicleBrand,
                String vehicleModel,
                LocalDateTime createdAt,
                Integer totalItems,
                Integer completedItems,
                String imageUrl,
                String status,
                Integer claimedById,
                String claimedByName,
                List<OrderItemDTO> items) {

        public static JobSummaryDTOBuilder builder() {
                return new JobSummaryDTOBuilder();
        }

        public static class JobSummaryDTOBuilder {
                private Integer id;
                private String plate;
                private String customerName;
                private String customerPhone;
                private String vehicleBrand;
                private String vehicleModel;
                private LocalDateTime createdAt;
                private Integer totalItems;
                private Integer completedItems;
                private String imageUrl;
                private String status;
                private Integer claimedById;
                private String claimedByName;
                private List<OrderItemDTO> items;

                public JobSummaryDTOBuilder id(Integer id) {
                        this.id = id;
                        return this;
                }

                public JobSummaryDTOBuilder plate(String plate) {
                        this.plate = plate;
                        return this;
                }

                public JobSummaryDTOBuilder customerName(String customerName) {
                        this.customerName = customerName;
                        return this;
                }

                public JobSummaryDTOBuilder customerPhone(String customerPhone) {
                        this.customerPhone = customerPhone;
                        return this;
                }

                public JobSummaryDTOBuilder vehicleBrand(String vehicleBrand) {
                        this.vehicleBrand = vehicleBrand;
                        return this;
                }

                public JobSummaryDTOBuilder vehicleModel(String vehicleModel) {
                        this.vehicleModel = vehicleModel;
                        return this;
                }

                public JobSummaryDTOBuilder createdAt(LocalDateTime createdAt) {
                        this.createdAt = createdAt;
                        return this;
                }

                public JobSummaryDTOBuilder totalItems(Integer totalItems) {
                        this.totalItems = totalItems;
                        return this;
                }

                public JobSummaryDTOBuilder completedItems(Integer completedItems) {
                        this.completedItems = completedItems;
                        return this;
                }

                public JobSummaryDTOBuilder imageUrl(String imageUrl) {
                        this.imageUrl = imageUrl;
                        return this;
                }

                public JobSummaryDTOBuilder status(String status) {
                        this.status = status;
                        return this;
                }

                public JobSummaryDTOBuilder claimedById(Integer claimedById) {
                        this.claimedById = claimedById;
                        return this;
                }

                public JobSummaryDTOBuilder claimedByName(String claimedByName) {
                        this.claimedByName = claimedByName;
                        return this;
                }

                public JobSummaryDTOBuilder items(List<OrderItemDTO> items) {
                        this.items = items;
                        return this;
                }

                public JobSummaryDTO build() {
                        return new JobSummaryDTO(id, plate, customerName, customerPhone, vehicleBrand, vehicleModel,
                                        createdAt,
                                        totalItems, completedItems, imageUrl, status, claimedById, claimedByName, items);
                }
        }
}
