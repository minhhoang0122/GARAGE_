-- V4: Đồng bộ Tài chính & Tổng tiền (Financial & Total Sync)

-- 1. Hàm cập nhật TỔNG TIỀN Đơn hàng
CREATE OR REPLACE FUNCTION update_repair_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    r_id INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        r_id := OLD.repair_order_id;
    ELSE
        r_id := NEW.repair_order_id;
    END IF;

    -- Chỉ cập nhật nếu đơn hàng còn hiệu lực (không bị hủy)
    IF r_id IS NOT NULL THEN
        UPDATE "repair_orders"
        SET 
            total_parts_amount = COALESCE((SELECT SUM(oi.total_amount) FROM "order_items" oi JOIN "products" p ON oi.product_id = p.id WHERE oi.repair_order_id = r_id AND p.is_service = false), 0),
            total_labor_amount = COALESCE((SELECT SUM(oi.total_amount) FROM "order_items" oi JOIN "products" p ON oi.product_id = p.id WHERE oi.repair_order_id = r_id AND p.is_service = true), 0),
            total_amount = COALESCE((SELECT SUM(oi.total_amount) FROM "order_items" oi WHERE oi.repair_order_id = r_id), 0),
            debt_amount = COALESCE((SELECT SUM(oi.total_amount) FROM "order_items" oi WHERE oi.repair_order_id = r_id), 0) - paid_amount,
            updated_at = NOW()
        WHERE id = r_id;
    END IF;
    
    RETURN NULL; -- AFTER trigger nên return null
END;
$$ language 'plpgsql';

-- 2. Gán TRIGGER cho bảng order_items
DROP TRIGGER IF EXISTS trg_sync_order_totals ON "order_items";
CREATE TRIGGER trg_sync_order_totals
AFTER INSERT OR UPDATE OR DELETE ON "order_items"
FOR EACH ROW EXECUTE FUNCTION update_repair_order_totals();

-- 3. Hàm cập nhật TIẾN ĐỘ THANH TOÁN
CREATE OR REPLACE FUNCTION update_order_paid_amount()
RETURNS TRIGGER AS $$
DECLARE
    r_id INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        r_id := OLD.repair_order_id;
    ELSE
        r_id := NEW.repair_order_id;
    END IF;

    IF r_id IS NOT NULL THEN
        UPDATE "repair_orders"
        SET 
            paid_amount = COALESCE((SELECT SUM(amount) FROM "financial_transactions" WHERE repair_order_id = r_id AND status = 'COMPLETED'), 0),
            debt_amount = total_amount - COALESCE((SELECT SUM(amount) FROM "financial_transactions" WHERE repair_order_id = r_id AND status = 'COMPLETED'), 0),
            paid_at = CASE 
                WHEN (SELECT SUM(amount) FROM "financial_transactions" WHERE repair_order_id = r_id AND status = 'COMPLETED') >= total_amount 
                THEN NOW() 
                ELSE NULL 
            END,
            updated_at = NOW()
        WHERE id = r_id;
    END IF;

    RETURN NULL;
END;
$$ language 'plpgsql';

-- 4. Gán TRIGGER cho bảng financial_transactions
DROP TRIGGER IF EXISTS trg_sync_payment_amount ON "financial_transactions";
CREATE TRIGGER trg_sync_payment_amount
AFTER INSERT OR UPDATE OR DELETE ON "financial_transactions"
FOR EACH ROW EXECUTE FUNCTION update_order_paid_amount();
