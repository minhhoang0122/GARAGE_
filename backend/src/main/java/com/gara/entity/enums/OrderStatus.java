package com.gara.entity.enums;

public enum OrderStatus {
    TIEP_NHAN("Tiếp nhận xe"),
    CHO_CHAN_DOAN("Chờ kỹ thuật kiểm tra"),
    BAO_GIA("Đang làm báo giá"),
    BAO_GIA_LAI("Yêu cầu báo giá lại"),
    CHO_KH_DUYET("Chờ khách duyệt báo giá"),
    KHACH_TU_CHOI("Khách từ chối sửa chữa"),
    DA_DUYET("Khách đã duyệt"),
    CHO_SUA_CHUA("Chờ xuất kho phụ tùng"),
    DANG_SUA("Đang sửa chữa"),
    CHO_THANH_TOAN("Chờ thanh toán"),
    CHO_KCS("Chờ nghiệm thu QC"),
    HOAN_THANH("Đã bàn giao xe - Hoàn thành"),
    DONG("Đã đóng Hóa Đơn"),
    HUY("Đã hủy");

    private final String description;

    OrderStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
