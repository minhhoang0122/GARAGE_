-- Script dọn dẹp các bảng cũ (legacy) có tên tiếng Việt và các bảng không tuân thủ đặt tên chuẩn

-- 1. Xóa các bảng liên quan đến Phân quyền/Người dùng cũ
DROP TABLE IF EXISTS "vaitro_quyen_map" CASCADE;
DROP TABLE IF EXISTS "vaitro_quyen" CASCADE;
DROP TABLE IF EXISTS "vaitro" CASCADE;
DROP TABLE IF EXISTS "nguoidung_vaitro" CASCADE;
DROP TABLE IF EXISTS "nguoidung" CASCADE;

-- 2. Xóa các bảng liên quan đến Nghiệp vụ sửa chữa cũ
DROP TABLE IF EXISTS "phieutiepnhan" CASCADE;
DROP TABLE IF EXISTS "donhangsuachua" CASCADE;
DROP TABLE IF EXISTS "chitietdonhang" CASCADE;
DROP TABLE IF EXISTS "phan_cong_cong_viec" CASCADE;
DROP TABLE IF EXISTS "xe" CASCADE;
DROP TABLE IF EXISTS "khachhang" CASCADE;
DROP TABLE IF EXISTS "hanghoa" CASCADE;

-- 3. Xóa các bảng liên quan đến Kho/Tài chính cũ
DROP TABLE IF EXISTS "importdetail" CASCADE;
DROP TABLE IF EXISTS "importnote" CASCADE;
DROP TABLE IF EXISTS "exportdetail" CASCADE;
DROP TABLE IF EXISTS "exportnote" CASCADE;
DROP TABLE IF EXISTS "inventory_reservation" CASCADE;
DROP TABLE IF EXISTS "financial_transaction" CASCADE;

-- 4. Xóa các bảng khác
DROP TABLE IF EXISTS "thongbao" CASCADE;
DROP TABLE IF EXISTS "auditlog" CASCADE;
