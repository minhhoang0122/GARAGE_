package com.gara.modules.public_api.service;

import com.gara.entity.RepairOrder;
import com.gara.modules.public_api.dto.PublicTrackingDTO;
import com.gara.modules.service.repository.RepairOrderRepository;
import com.gara.modules.service.repository.ReceptionTimelineRepository;
import com.gara.entity.ReceptionTimeline;
import com.gara.entity.enums.OrderStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PublicTrackingService {

    private final RepairOrderRepository repairOrderRepository;
    private final ReceptionTimelineRepository timelineRepository;

    public PublicTrackingService(RepairOrderRepository repairOrderRepository,
                                 ReceptionTimelineRepository timelineRepository) {
        this.repairOrderRepository = repairOrderRepository;
        this.timelineRepository = timelineRepository;
    }

    @Transactional(readOnly = true)
    public Optional<PublicTrackingDTO> getTrackingByUuid(String uuid) {
        try {
            return repairOrderRepository.findByUuidWithDetails(UUID.fromString(uuid))
                    .map(this::mapToDto);
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    private PublicTrackingDTO mapToDto(RepairOrder order) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        
        List<PublicTrackingDTO.TrackingItemDTO> items = order.getOrderItems().stream()
                .map(i -> new PublicTrackingDTO.TrackingItemDTO(
                        i.getProduct() != null ? i.getProduct().getName() : "Dịch vụ/Vật tư khác",
                        i.getQuantity() != null ? i.getQuantity().doubleValue() : 0.0,
                        i.getStatus() != null ? i.getStatus().name() : "PENDING"
                ))
                .collect(Collectors.toList());

        // Get timeline entries for the reception
        List<ReceptionTimeline> timelineEntries = timelineRepository.findByReceptionIdOrderByCreatedAtAsc(order.getReceptionId());
        
        List<PublicTrackingDTO.TrackingTimelineDTO> timeline = timelineEntries.stream()
                .filter(t -> !Boolean.TRUE.equals(t.getIsInternal())) // Hide internal notes
                .map(t -> new PublicTrackingDTO.TrackingTimelineDTO(
                        t.getContent(),
                        t.getCreatedAt() != null ? t.getCreatedAt().format(formatter) : "N/A",
                        true, // Historical entries are completed
                        false
                ))
                .collect(Collectors.toList());

        // Add a "current" status marker
        String currentLabel = getLabelByStatus(order.getStatus());
        timeline.add(new PublicTrackingDTO.TrackingTimelineDTO(
                currentLabel,
                "Bây giờ",
                false,
                true
        ));

        return new PublicTrackingDTO(
                order.getUuid() != null ? order.getUuid().toString() : null,
                order.getReception() != null && order.getReception().getVehicle() != null ? order.getReception().getVehicle().getLicensePlate() : "N/A",
                order.getReception() != null && order.getReception().getVehicle() != null ? order.getReception().getVehicle().getModel() : "N/A",
                order.getCreatedAt() != null ? order.getCreatedAt().format(formatter) : "N/A",
                order.getStatus() != null ? order.getStatus().name() : null,
                currentLabel,
                order.getReception() != null ? order.getReception().getPreliminaryRequest() : null,
                items,
                timeline
        );
    }

    private String getLabelByStatus(OrderStatus status) {
        if (status == null) return "Đang xử lý";
        return switch (status) {
            case RECEIVED -> "Đang chờ vào xưởng";
            case WAITING_FOR_DIAGNOSIS -> "Đang chuẩn bị khám xe";
            case QUOTING, RE_QUOTATION -> "Đang làm báo giá";
            case WAITING_FOR_CUSTOMER_APPROVAL -> "Đang chờ khách duyệt báo giá";
            case APPROVED -> "Đã duyệt - Sắp xếp thi công";
            case WAITING_FOR_PARTS -> "Đang chờ phu tùng/vật tư";
            case IN_PROGRESS -> "Đang thi công trên cầu nâng";
            case WAITING_FOR_QC -> "Đang kiểm tra chất lượng cuối cùng";
            case WAITING_FOR_PAYMENT -> "Chờ thanh toán & Bàn giao";
            case COMPLETED -> "Đã bàn giao xe - Hoàn thành";
            case CLOSED, SETTLED -> "Đã hoàn thành thủ tục xuất xưởng";
            case CANCELLED -> "Đã hủy bỏ";
            default -> "Đang xử lý";
        };
    }
}

