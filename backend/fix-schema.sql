-- =============================================
-- FIX: Tạo lại bảng hanghoa với đúng schema
-- Chạy script này trên Supabase SQL Editor
-- =============================================

-- Xóa bảng cũ nếu tồn tại (CẢNH BÁO: mất dữ liệu cũ)
DROP TABLE IF EXISTS hanghoa CASCADE;

-- Tạo lại bảng hanghoa theo đúng entity Product.java
CREATE TABLE hanghoa (
    id SERIAL PRIMARY KEY,
    ma_hang VARCHAR(50) UNIQUE NOT NULL,
    ten_hang VARCHAR(200) NOT NULL,
    gia_ban_niem_yet NUMERIC(18, 2),
    gia_von NUMERIC(18, 2) DEFAULT 0,
    gia_san NUMERIC(18, 2) DEFAULT 0,
    so_luong_ton INTEGER DEFAULT 0,
    dinh_muc_ton_toi_thieu INTEGER DEFAULT 5,
    bao_hanh_so_thang INTEGER DEFAULT 0,
    bao_hanh_km INTEGER DEFAULT 0,
    la_dich_vu BOOLEAN DEFAULT FALSE,
    thue_vat NUMERIC(5, 2) DEFAULT 10.00,
    cho_phep_bao_hanh BOOLEAN DEFAULT TRUE,
    ngay_tao TIMESTAMP DEFAULT NOW()
);

-- Thêm dữ liệu mẫu
INSERT INTO hanghoa (ma_hang, ten_hang, gia_ban_niem_yet, la_dich_vu, bao_hanh_so_thang, bao_hanh_km) VALUES
    ('DV001', 'Thay nhớt động cơ', 200000, TRUE, 1, 3000),
    ('DV002', 'Rửa xe cơ bản', 80000, TRUE, 0, 0),
    ('DV003', 'Kiểm tra tổng quát', 150000, TRUE, 0, 0),
    ('DV004', 'Cân chỉnh độ chụm', 300000, TRUE, 3, 5000),
    ('DV005', 'Đánh bóng sơn xe', 500000, TRUE, 0, 0),
    ('PT001', 'Nhớt Castrol 5W-30 (4L)', 450000, FALSE, 6, 10000),
    ('PT002', 'Lọc gió động cơ', 180000, FALSE, 6, 10000),
    ('PT003', 'Lọc nhớt', 120000, FALSE, 6, 10000),
    ('PT004', 'Má phanh trước (bộ)', 850000, FALSE, 12, 20000),
    ('PT005', 'Bugi NGK (bộ 4)', 320000, FALSE, 12, 20000);
