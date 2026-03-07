-- TOÀN DIỆN DỌN DẸP DATABASE (DYNAMIC CLEANUP)
-- Tự động tìm và xóa các cột camelCase rác trong toàn bộ schema public

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN 
        SELECT 
            t.table_name, 
            c1.column_name AS legacy_col, 
            c2.column_name AS snake_col
        FROM 
            information_schema.tables t
        JOIN 
            information_schema.columns c1 ON t.table_name = c1.table_name
        JOIN 
            information_schema.columns c2 ON t.table_name = c2.table_name
        WHERE 
            t.table_schema = 'public'
            AND t.table_type = 'BASE TABLE'
            -- c2 là cột chuẩn (có dấu _)
            AND c2.column_name LIKE '%\_%'
            -- c1 là cột cũ (camelCase, khi bỏ _ của c2 thì trùng với c1)
            AND c1.column_name = replace(c2.column_name, '_', '')
            -- Loại trừ các bảng hệ thống
            AND t.table_name NOT LIKE 'databasechangelog%'
    LOOP
        EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS %I', r.table_name, r.legacy_col);
        RAISE NOTICE 'Da xoa cot rác: %.%', r.table_name, r.legacy_col;
    END LOOP;
END $$;
