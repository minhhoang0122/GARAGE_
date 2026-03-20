package com.gara.entity.enums;

public enum ItemStatus {
    TIEP_NHAN("Tiếp nhận xe"),
    CHO_CHAN_DOAN("Chờ kỹ thuật kiểm tra"),
    KHACH_DONG_Y("Khách đồng ý sửa chữa"),
    KHACH_TU_CHOI("Khách từ chối sửa chữa"),
    BAO_GIA_LAI("Yêu cầu báo giá lại"),
    CHO_KY_THUAT_DUYET("Chờ Quản lý duyệt kỹ thuật"),
    DE_XUAT("Thợ sửa đề xuất phát sinh thêm"),
    CHO_SUA_CHUA("Chờ kho xuất phụ tùng"),
    DANG_SUA("Đang tiến hành sửa chữa"),
    HOAN_THANH("Sửa chữa hoàn tất");

    private final String description;

    ItemStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
