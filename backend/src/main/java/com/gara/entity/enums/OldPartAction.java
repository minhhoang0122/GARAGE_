package com.gara.entity.enums;

/**
 * Hành động xử lý phụ tùng cũ sau khi thay thế
 */
public enum OldPartAction {
    RETURN_TO_CUSTOMER, // Trả lại cho khách hàng
    KEEP_IN_GARAGE,    // Lưu tại gara (để xử lý sau/thu mua/tái chế)
    DISCARD,           // Bỏ (rác thải kỹ thuật)
    PENDING            // Đang chờ xác nhận
}
