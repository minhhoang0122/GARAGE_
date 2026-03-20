package com.gara.entity.enums;

public enum MechanicLevel {
    HOC_VIEC("Học việc"),
    KY_THUAT_VIEN("Kỹ thuật viên"),
    KTV_CHINH("KTV Chính");

    private final String description;

    MechanicLevel(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
