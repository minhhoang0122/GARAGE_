-- SQL FIX V7 - TOÀN DIỆN CHO GARA MANAGEMENT SYSTEM
DO $$ 
BEGIN 
    -- ---------------------------------------------------------
    -- 1. BẢNG NGUOIDUNG
    -- ---------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='nguoidung') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nguoidung' AND column_name='ho_ten') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nguoidung' AND column_name='HoTen') THEN EXECUTE 'UPDATE "nguoidung" SET ho_ten = "HoTen" WHERE ho_ten IS NULL'; END IF;
            UPDATE "nguoidung" SET ho_ten = 'Người dùng' WHERE ho_ten IS NULL;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nguoidung' AND column_name='vai_tro') THEN
            UPDATE "nguoidung" SET vai_tro = 'ADMIN' WHERE vai_tro IS NULL;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nguoidung' AND column_name='ten_dang_nhap') THEN
             IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nguoidung' AND column_name='TenDangNhap') THEN EXECUTE 'UPDATE "nguoidung" SET ten_dang_nhap = "TenDangNhap" WHERE ten_dang_nhap IS NULL'; END IF;
             UPDATE "nguoidung" SET ten_dang_nhap = 'user_' || id WHERE ten_dang_nhap IS NULL;
        END IF;
    END IF;

    -- ---------------------------------------------------------
    -- 2. BẢNG HANGHOA
    -- ---------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='hanghoa') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hanghoa' AND column_name='ten_hang') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hanghoa' AND column_name='TenHang') THEN EXECUTE 'UPDATE "hanghoa" SET ten_hang = "TenHang" WHERE ten_hang IS NULL'; END IF;
            UPDATE "hanghoa" SET ten_hang = 'Sản phẩm mới' WHERE ten_hang IS NULL;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hanghoa' AND column_name='ma_hang') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hanghoa' AND column_name='MaHang') THEN EXECUTE 'UPDATE "hanghoa" SET ma_hang = "MaHang" WHERE ma_hang IS NULL'; END IF;
            UPDATE "hanghoa" SET ma_hang = 'MH_' || id WHERE ma_hang IS NULL;
        END IF;
    END IF;

    -- ---------------------------------------------------------
    -- 3. BẢNG XE
    -- ---------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='xe') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='xe' AND column_name='bien_so') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='xe' AND column_name='BienSo') THEN EXECUTE 'UPDATE "xe" SET bien_so = "BienSo" WHERE bien_so IS NULL'; END IF;
            UPDATE "xe" SET bien_so = 'TEMP_' || id WHERE bien_so IS NULL;
        END IF;
    END IF;

    RAISE NOTICE 'SQL FIX V7 - COMPLETED SUCCESSFULLY';
END $$;
