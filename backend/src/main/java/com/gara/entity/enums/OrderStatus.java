package com.gara.entity.enums;

public enum OrderStatus {
    RECEIVED("Tiếp nhận xe"),
    WAITING_FOR_DIAGNOSIS("Chờ kỹ thuật kiểm tra"),
    QUOTING("Đang làm báo giá"),
    RE_QUOTATION("Yêu cầu báo giá lại"),
    WAITING_FOR_CUSTOMER_APPROVAL("Chờ khách duyệt báo giá"),
    CUSTOMER_REJECTED("Khách từ chối sửa chữa"),
    APPROVED("Khách đã duyệt"),
    WAITING_FOR_PARTS("Chờ xuất kho phụ tùng"),
    IN_PROGRESS("Đang sửa chữa"),
    WAITING_FOR_PAYMENT("Chờ thanh toán"),
    WAITING_FOR_QC("Chờ nghiệm thu QC"),
    COMPLETED("Đã bàn giao xe - Hoàn thành"),
    CLOSED("Đã đóng Hóa Đơn"),
    CANCELLED("Đã hủy"),
    SETTLED("Đã quyết toán");

    private final String description;

    OrderStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
