package com.gara.dto;

public record CreateOrderRequest(
        String customerName,
        String customerPhone,
        String plateNumber,
        String carBrand,
        String carModel,
        String description) {
}
