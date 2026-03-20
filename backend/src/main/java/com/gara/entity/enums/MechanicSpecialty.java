package com.gara.entity.enums;

public enum MechanicSpecialty {
    MAY("Thợ Máy"),
    GAM("Thợ Gầm"),
    DIEN("Thợ Điện"),
    DONG_SON("Đồng/Sơn"),
    BAO_DUONG("Bảo dưỡng"),
    TONG_HOP("Tổng hợp");

    private final String description;

    MechanicSpecialty(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
