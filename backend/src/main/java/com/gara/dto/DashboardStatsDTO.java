package com.gara.dto;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public record DashboardStatsDTO(
                @JsonProperty("countWaiting") long countWaiting,
                @JsonProperty("countPendingQuotes") long countPendingQuotes,
                @JsonProperty("countPendingPayment") long countPendingPayment,
                @JsonProperty("countWarranty") long countWarranty,
                @JsonProperty("waitingVehicles") List<DashboardVehicleDTO> waitingVehicles,
                @JsonProperty("recentOrders") List<DashboardOrderDTO> recentOrders) {

        public static DashboardStatsDTOBuilder builder() {
                return new DashboardStatsDTOBuilder();
        }

        public static class DashboardStatsDTOBuilder {
                private long countWaiting;
                private long countPendingQuotes;
                private long countPendingPayment;
                private long countWarranty;
                private List<DashboardVehicleDTO> waitingVehicles;
                private List<DashboardOrderDTO> recentOrders;

                public DashboardStatsDTOBuilder countWaiting(long countWaiting) {
                        this.countWaiting = countWaiting;
                        return this;
                }

                public DashboardStatsDTOBuilder countPendingQuotes(long countPendingQuotes) {
                        this.countPendingQuotes = countPendingQuotes;
                        return this;
                }

                public DashboardStatsDTOBuilder countPendingPayment(long countPendingPayment) {
                        this.countPendingPayment = countPendingPayment;
                        return this;
                }

                public DashboardStatsDTOBuilder countWarranty(long countWarranty) {
                        this.countWarranty = countWarranty;
                        return this;
                }

                public DashboardStatsDTOBuilder waitingVehicles(List<DashboardVehicleDTO> waitingVehicles) {
                        this.waitingVehicles = waitingVehicles;
                        return this;
                }

                public DashboardStatsDTOBuilder recentOrders(List<DashboardOrderDTO> recentOrders) {
                        this.recentOrders = recentOrders;
                        return this;
                }

                public DashboardStatsDTO build() {
                        return new DashboardStatsDTO(countWaiting, countPendingQuotes, countPendingPayment,
                                        countWarranty, waitingVehicles, recentOrders);
                }
        }

        public record DashboardVehicleDTO(
                        @JsonProperty("ID") Integer id,
                        @JsonProperty("XeBienSo") String plate,
                        @JsonProperty("KhachHangName") String customerName,
                        @JsonProperty("NgayGio") LocalDateTime time,
                        @JsonProperty("ODO") Integer odo,
                        @JsonProperty("NguoiTiepNhanName") String receptionistName,
                        @JsonProperty("vehicleBrand") String vehicleBrand,
                        @JsonProperty("vehicleModel") String vehicleModel) {

                public static DashboardVehicleDTOBuilder builder() {
                        return new DashboardVehicleDTOBuilder();
                }

                public static class DashboardVehicleDTOBuilder {
                        private Integer id;
                        private String plate;
                        private String customerName;
                        private LocalDateTime time;
                        private Integer odo;
                        private String receptionistName;
                        private String vehicleBrand;
                        private String vehicleModel;

                        public DashboardVehicleDTOBuilder id(Integer id) {
                                this.id = id;
                                return this;
                        }

                        public DashboardVehicleDTOBuilder plate(String plate) {
                                this.plate = plate;
                                return this;
                        }

                        public DashboardVehicleDTOBuilder customerName(String customerName) {
                                this.customerName = customerName;
                                return this;
                        }

                        public DashboardVehicleDTOBuilder time(LocalDateTime time) {
                                this.time = time;
                                return this;
                        }

                        public DashboardVehicleDTOBuilder odo(Integer odo) {
                                this.odo = odo;
                                return this;
                        }

                        public DashboardVehicleDTOBuilder receptionistName(String receptionistName) {
                                this.receptionistName = receptionistName;
                                return this;
                        }

                        public DashboardVehicleDTOBuilder vehicleBrand(String vehicleBrand) {
                                this.vehicleBrand = vehicleBrand;
                                return this;
                        }

                        public DashboardVehicleDTOBuilder vehicleModel(String vehicleModel) {
                                this.vehicleModel = vehicleModel;
                                return this;
                        }

                        public DashboardVehicleDTO build() {
                                return new DashboardVehicleDTO(id, plate, customerName, time, odo, receptionistName, vehicleBrand, vehicleModel);
                        }
                }
        }

        public record DashboardOrderDTO(
                        @JsonProperty("ID") Integer id,
                        @JsonProperty("XeBienSo") String plate,
                        @JsonProperty("TongCong") BigDecimal total,
                        @JsonProperty("TrangThai") String status,
                        @JsonProperty("KhachHangName") String customerName,
                        @JsonProperty("NgayGio") LocalDateTime time,
                        @JsonProperty("NguoiTiepNhanName") String receptionistName,
                        @JsonProperty("vehicleBrand") String vehicleBrand,
                        @JsonProperty("vehicleModel") String vehicleModel,
                        @JsonProperty("itemCount") Integer itemCount) {

                public static DashboardOrderDTOBuilder builder() {
                        return new DashboardOrderDTOBuilder();
                }

                public static class DashboardOrderDTOBuilder {
                        private Integer id;
                        private String plate;
                        private BigDecimal total;
                        private String status;
                        private String customerName;
                        private LocalDateTime time;
                        private String receptionistName;
                        private String vehicleBrand;
                        private String vehicleModel;
                        private Integer itemCount;

                        public DashboardOrderDTOBuilder id(Integer id) {
                                this.id = id;
                                return this;
                        }

                        public DashboardOrderDTOBuilder plate(String plate) {
                                this.plate = plate;
                                return this;
                        }

                        public DashboardOrderDTOBuilder total(BigDecimal total) {
                                this.total = total;
                                return this;
                        }

                        public DashboardOrderDTOBuilder status(String status) {
                                this.status = status;
                                return this;
                        }

                        public DashboardOrderDTOBuilder customerName(String customerName) {
                                this.customerName = customerName;
                                return this;
                        }

                        public DashboardOrderDTOBuilder time(LocalDateTime time) {
                                this.time = time;
                                return this;
                        }

                        public DashboardOrderDTOBuilder receptionistName(String receptionistName) {
                                this.receptionistName = receptionistName;
                                return this;
                        }

                        public DashboardOrderDTOBuilder vehicleBrand(String vehicleBrand) {
                                this.vehicleBrand = vehicleBrand;
                                return this;
                        }

                        public DashboardOrderDTOBuilder vehicleModel(String vehicleModel) {
                                this.vehicleModel = vehicleModel;
                                return this;
                        }

                        public DashboardOrderDTOBuilder itemCount(Integer itemCount) {
                                this.itemCount = itemCount;
                                return this;
                        }

                        public DashboardOrderDTO build() {
                                return new DashboardOrderDTO(id, plate, total, status, customerName, time, receptionistName, vehicleBrand, vehicleModel, itemCount);
                        }
                }
        }
}
