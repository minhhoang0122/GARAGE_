package com.gara.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ReceptionInspectDTO(
                Integer id,
                String plate,
                String customerName,
                String vehicleBrand,
                String vehicleModel,
                String request,
                LocalDateTime createdAt,
                Integer proposedItemsCount,
                String imageUrl,
                Integer orderId,
                String status,
                List<ProposalItemDTO> existingItems) {

        public static ReceptionInspectDTOBuilder builder() {
                return new ReceptionInspectDTOBuilder();
        }

        public static class ReceptionInspectDTOBuilder {
                private Integer id;
                private String plate;
                private String customerName;
                private String vehicleBrand;
                private String vehicleModel;
                private String request;
                private LocalDateTime createdAt;
                private Integer proposedItemsCount;
                private String imageUrl;
                private Integer orderId;
                private String status;
                private List<ProposalItemDTO> existingItems;

                public ReceptionInspectDTOBuilder id(Integer id) {
                        this.id = id;
                        return this;
                }

                public ReceptionInspectDTOBuilder plate(String plate) {
                        this.plate = plate;
                        return this;
                }

                public ReceptionInspectDTOBuilder customerName(String customerName) {
                        this.customerName = customerName;
                        return this;
                }

                public ReceptionInspectDTOBuilder vehicleBrand(String vehicleBrand) {
                        this.vehicleBrand = vehicleBrand;
                        return this;
                }

                public ReceptionInspectDTOBuilder vehicleModel(String vehicleModel) {
                        this.vehicleModel = vehicleModel;
                        return this;
                }

                public ReceptionInspectDTOBuilder request(String request) {
                        this.request = request;
                        return this;
                }

                public ReceptionInspectDTOBuilder createdAt(LocalDateTime createdAt) {
                        this.createdAt = createdAt;
                        return this;
                }

                public ReceptionInspectDTOBuilder proposedItemsCount(Integer proposedItemsCount) {
                        this.proposedItemsCount = proposedItemsCount;
                        return this;
                }

                public ReceptionInspectDTOBuilder imageUrl(String imageUrl) {
                        this.imageUrl = imageUrl;
                        return this;
                }

                public ReceptionInspectDTOBuilder orderId(Integer orderId) {
                        this.orderId = orderId;
                        return this;
                }

                public ReceptionInspectDTOBuilder status(String status) {
                        this.status = status;
                        return this;
                }

                public ReceptionInspectDTOBuilder existingItems(List<ProposalItemDTO> existingItems) {
                        this.existingItems = existingItems;
                        return this;
                }

                public ReceptionInspectDTO build() {
                        return new ReceptionInspectDTO(id, plate, customerName, vehicleBrand, vehicleModel, request,
                                        createdAt, proposedItemsCount, imageUrl, orderId, status, existingItems);
                }
        }
}
