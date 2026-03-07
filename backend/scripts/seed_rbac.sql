-- 0. Khởi tạo cấu trúc bảng nếu chưa có
CREATE TABLE IF NOT EXISTS vaitro_quyen (
    id SERIAL PRIMARY KEY,
    ma_quyen VARCHAR(50) UNIQUE NOT NULL,
    ten_quyen VARCHAR(100) NOT NULL,
    module VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS vaitro (
    id SERIAL PRIMARY KEY,
    ten_vaitro VARCHAR(50) UNIQUE NOT NULL,
    mo_ta VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS vaitro_quyen_map (
    vaitro_id INTEGER NOT NULL REFERENCES vaitro(id) ON DELETE CASCADE,
    quyen_id INTEGER NOT NULL REFERENCES vaitro_quyen(id) ON DELETE CASCADE,
    PRIMARY KEY (vaitro_id, quyen_id)
);

CREATE TABLE IF NOT EXISTS nguoidung_vaitro (
    nguoidung_id INTEGER NOT NULL REFERENCES nguoidung(id) ON DELETE CASCADE,
    vaitro_id INTEGER NOT NULL REFERENCES vaitro(id) ON DELETE CASCADE,
    PRIMARY KEY (nguoidung_id, vaitro_id)
);

-- 1. Tạo các quyền hạn cơ bản (Permissions)
INSERT INTO vaitro_quyen (ma_quyen, ten_quyen, module) VALUES
('VIEW_DASHBOARD', 'Xem Dashboard tổng quan', 'GENERAL'),
('CREATE_RECEPTION', 'Tạo phiếu tiếp nhận', 'SERVICE'),
('VIEW_ORDER_LIST', 'Xem danh sách đơn hàng', 'SERVICE'),
('CREATE_PROPOSAL', 'Lập đề xuất sửa chữa', 'SERVICE'),
('APPROVE_QC', 'Duyệt chất lượng (QC Pass)', 'SERVICE'),
('REJECT_QC', 'Từ chối chất lượng (QC Fail)', 'SERVICE'),
('CLAIM_REPAIR_JOB', 'Nhận việc sửa chữa', 'SERVICE'),
('COMPLETE_REPAIR_JOB', 'Hoàn thành sửa chữa', 'SERVICE'),
('MANAGE_INVENTORY', 'Quản lý kho hàng', 'INVENTORY'),
('EXPORT_ORDER_WAREHOUSE', 'Xuất kho cho đơn hàng', 'INVENTORY'),
('VIEW_FINANCIAL_REPORTS', 'Xem báo cáo doanh thu', 'FINANCE'),
('MANAGE_USERS', 'Quản lý người dùng', 'ADMIN')
ON CONFLICT (ma_quyen) DO NOTHING;

-- 2. Tạo các vai trò (Roles)
INSERT INTO vaitro (ten_vaitro, mo_ta) VALUES
('ADMIN', 'Quản trị viên toàn hệ thống'),
('SALE', 'Cố vấn dịch vụ / Nhân viên bán hàng'),
('THO_CHAN_DOAN', 'Kỹ thuật viên chẩn đoán / Trưởng nhóm'),
('THO_SUA_CHUA', 'Kỹ thuật viên sửa chữa'),
('KHO', 'Nhân viên kho'),
('KE_TOAN', 'Kế toán')
ON CONFLICT (ten_vaitro) DO NOTHING;

-- 3. Gán quyền cho các vai trò (Role-Permission Mapping)
-- Lấy ID của Roles và Permissions để gán (Dùng subquery cho an toàn)

-- ADMIN: All permissions
INSERT INTO vaitro_quyen_map (vaitro_id, quyen_id)
SELECT r.id, p.id FROM vaitro r, vaitro_quyen p
WHERE r.ten_vaitro = 'ADMIN'
ON CONFLICT DO NOTHING;

-- SALE: Reception, Order list, View Dashboard
INSERT INTO vaitro_quyen_map (vaitro_id, quyen_id)
SELECT r.id, p.id FROM vaitro r, vaitro_quyen p
WHERE r.ten_vaitro = 'SALE' AND p.ma_quyen IN ('VIEW_DASHBOARD', 'CREATE_RECEPTION', 'VIEW_ORDER_LIST')
ON CONFLICT DO NOTHING;

-- THO_CHAN_DOAN: Inspect, QC, View Dashboard
INSERT INTO vaitro_quyen_map (vaitro_id, quyen_id)
SELECT r.id, p.id FROM vaitro r, vaitro_quyen p
WHERE r.ten_vaitro = 'THO_CHAN_DOAN' AND p.ma_quyen IN ('VIEW_DASHBOARD', 'VIEW_ORDER_LIST', 'CREATE_PROPOSAL', 'APPROVE_QC', 'REJECT_QC')
ON CONFLICT DO NOTHING;

-- THO_SUA_CHUA: Claim repair, Complete repair
INSERT INTO vaitro_quyen_map (vaitro_id, quyen_id)
SELECT r.id, p.id FROM vaitro r, vaitro_quyen p
WHERE r.ten_vaitro = 'THO_SUA_CHUA' AND p.ma_quyen IN ('VIEW_ORDER_LIST', 'CLAIM_REPAIR_JOB', 'COMPLETE_REPAIR_JOB')
ON CONFLICT DO NOTHING;
