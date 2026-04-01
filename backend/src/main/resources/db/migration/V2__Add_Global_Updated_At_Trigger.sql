-- V2: Tự động hóa Metadata (updated_at) cho toàn bộ hệ thống

-- 1. Thêm cột updated_at cho các bảng còn thiếu
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE "financial_transactions" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE "receptions" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE "task_assignments" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- 2. Tạo hàm trigger dùng chung (Nếu chưa có)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Gán Trigger cho tất cả các bảng
DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
          AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_update_updated_at ON %I', t);
        EXECUTE format('CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
    END LOOP;
END $$;
