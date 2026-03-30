package com.gara.modules.public_api.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PublicBookingDTO(
        String fullName,
        String phone,
        String email,
        String address,
        String licensePlate,
        String model,
        LocalDateTime appointmentTime,
        String notes,
        List<Integer> selectedServiceIds,
        Integer userId) {
}
