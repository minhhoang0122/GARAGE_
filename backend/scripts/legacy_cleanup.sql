-- SCRIPT DỌN DẸP DATABASE (LEGACY CLEANUP)
-- Mục tiêu: Xóa bỏ các cột cũ (camelCase dư thừa) để giữ lại các cột chuẩn snake_case.

DO $$ 
BEGIN
    -- 1. Bảng donhangsuachua (Trường hợp nghiêm trọng nhất)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'chietkhautong') THEN
        ALTER TABLE donhangsuachua DROP COLUMN chietkhautong;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'congno') THEN
        ALTER TABLE donhangsuachua DROP COLUMN congno;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'ghichu') THEN
        ALTER TABLE donhangsuachua DROP COLUMN ghichu;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'ladonbaohanh') THEN
        ALTER TABLE donhangsuachua DROP COLUMN ladonbaohanh;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'ngayduyet') THEN
        ALTER TABLE donhangsuachua DROP COLUMN ngayduyet;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'ngaytao') THEN
        ALTER TABLE donhangsuachua DROP COLUMN ngaytao;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'ngaythanhtoan') THEN
        ALTER TABLE donhangsuachua DROP COLUMN ngaythanhtoan;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'nguoiphutrachid') THEN
        ALTER TABLE donhangsuachua DROP COLUMN nguoiphutrachid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'parentorderid') THEN
        ALTER TABLE donhangsuachua DROP COLUMN parentorderid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'phieutiepnhanid') THEN
        ALTER TABLE donhangsuachua DROP COLUMN phieutiepnhanid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'phuongthuc') THEN
        ALTER TABLE donhangsuachua DROP COLUMN phuongthuc;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'sotiendatra') THEN
        ALTER TABLE donhangsuachua DROP COLUMN sotiendatra;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'thochandoanid') THEN
        ALTER TABLE donhangsuachua DROP COLUMN thochandoanid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'thophancongid') THEN
        ALTER TABLE donhangsuachua DROP COLUMN thophancongid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'thuevat') THEN
        ALTER TABLE donhangsuachua DROP COLUMN thuevat;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'tiencoc') THEN
        ALTER TABLE donhangsuachua DROP COLUMN tiencoc;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'tongcong') THEN
        ALTER TABLE donhangsuachua DROP COLUMN tongcong;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'tongtiencong') THEN
        ALTER TABLE donhangsuachua DROP COLUMN tongtiencong;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'tongtienhang') THEN
        ALTER TABLE donhangsuachua DROP COLUMN tongtienhang;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donhangsuachua' AND column_name = 'trangthai') THEN
        ALTER TABLE donhangsuachua DROP COLUMN trangthai;
    END IF;

    -- 2. Bảng nguoidung (Dọn nốt nếu còn)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nguoidung' AND column_name = 'tendangnhap') THEN
        ALTER TABLE nguoidung DROP COLUMN tendangnhap;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nguoidung' AND column_name = 'matkhauhash') THEN
        ALTER TABLE nguoidung DROP COLUMN matkhauhash;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nguoidung' AND column_name = 'hoten') THEN
        ALTER TABLE nguoidung DROP COLUMN hoten;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nguoidung' AND column_name = 'sodienthoai') THEN
        ALTER TABLE nguoidung DROP COLUMN sodienthoai;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nguoidung' AND column_name = 'trangthaihoatdong') THEN
        ALTER TABLE nguoidung DROP COLUMN trangthaihoatdong;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nguoidung' AND column_name = 'ngaytao') THEN
        ALTER TABLE nguoidung DROP COLUMN ngaytao;
    END IF;

    -- 3. Bảng vaitro & vaitro_quyen
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vaitro' AND column_name = 'tenvaitro') THEN
        ALTER TABLE vaitro DROP COLUMN tenvaitro;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vaitro' AND column_name = 'mota') THEN
        ALTER TABLE vaitro DROP COLUMN mota;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vaitro_quyen' AND column_name = 'maquyen') THEN
        ALTER TABLE vaitro_quyen DROP COLUMN maquyen;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vaitro_quyen' AND column_name = 'tenquyen') THEN
        ALTER TABLE vaitro_quyen DROP COLUMN tenquyen;
    END IF;

END $$;
