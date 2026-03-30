package com.gara.modules.public_api.dto;

import java.util.List;

public record PublicTrackingDTO(
    String uuid,
    String licensePlate,
    String model,
    String receptionDate,
    String status,
    String statusLabel,
    String preliminaryRequest,
    List<TrackingItemDTO> items,
    List<TrackingTimelineDTO> timeline
) {
    public record TrackingItemDTO(
        String name,
        Double quantity,
        String status
    ) {}

    public record TrackingTimelineDTO(
        String content,
        String time,
        boolean completed,
        boolean isCurrent
    ) {}
}
