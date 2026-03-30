package com.gara.entity.enums;

public enum ItemStatus {
    RECEIVED("Tiếp nhận xe"),
    WAITING_FOR_DIAGNOSIS("Chờ kỹ thuật kiểm tra"),
    CUSTOMER_APPROVED("Khách đồng ý sửa chữa"),
    CUSTOMER_REJECTED("Khách từ chối sửa chữa"),
    RE_QUOTATION("Yêu cầu báo giá lại"),
    WAITING_FOR_MANAGER_APPROVAL("Chờ Quản lý duyệt kỹ thuật"),
    PROPOSAL("Thợ sửa đề xuất phát sinh thêm"),
    WAITING_FOR_PARTS("Chờ kho xuất phụ tùng"),
    IN_PROGRESS("Đang tiến hành sửa chữa"),
    COMPLETED("Sửa chữa hoàn tất"),
    CANCELLED("Đã hủy"),
    SETTLED("Đã quyết toán"),
    EXPORTED("Đã xuất kho");

    private final String description;

    ItemStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

