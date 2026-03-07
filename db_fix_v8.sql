DO $$ 
BEGIN
    -- Rename Tables to snake_case if they exist with old names
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'hanghoa') THEN
        ALTER TABLE hanghoa RENAME TO hang_hoa;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'nguoidung') THEN
        ALTER TABLE nguoidung RENAME TO nguoi_dung;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'khachhang') THEN
        ALTER TABLE khachhang RENAME TO khach_hang;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'phieutiepnhan') THEN
        ALTER TABLE phieutiepnhan RENAME TO phieu_tiep_nhan;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'donhangsuachua') THEN
        ALTER TABLE donhangsuachua RENAME TO don_hang_sua_chua;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'chitietdonhang') THEN
        ALTER TABLE chitietdonhang RENAME TO chi_tiet_don_hang;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'thongbao') THEN
        ALTER TABLE thongbao RENAME TO thong_bao;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'auditlog') THEN
        ALTER TABLE auditlog RENAME TO audit_log;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'exportdetail') THEN
        ALTER TABLE exportdetail RENAME TO export_detail;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'exportnote') THEN
        ALTER TABLE exportnote RENAME TO export_note;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'financialtransaction') THEN
        ALTER TABLE financialtransaction RENAME TO financial_transaction;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'importdetail') THEN
        ALTER TABLE importdetail RENAME TO import_detail;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'importnote') THEN
        ALTER TABLE importnote RENAME TO import_note;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'inventoryreservation') THEN
        ALTER TABLE inventoryreservation RENAME TO inventory_reservation;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'systemconfig') THEN
        ALTER TABLE systemconfig RENAME TO system_config;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'taskassignment') THEN
        ALTER TABLE taskassignment RENAME TO task_assignment;
    END IF;
END $$;
