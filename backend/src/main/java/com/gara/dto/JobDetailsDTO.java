package com.gara.dto;

import lombok.Data;
import java.util.List;

@Data
public class JobDetailsDTO {
    private Integer id;
    private String licensePlate;
    private String vehicleInfo;
    private String customerName;
    private String customerPhone;
    private String status;
    private Integer odo;
    private String reason;
    private List<JobItemDTO> items;
}
