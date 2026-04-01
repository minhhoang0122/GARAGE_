-- V5: Tự động hóa trạng thái Đơn hàng (Order Status Automation)

-- 1. Hàm tự động chuyển trạng thái đơn hàng
CREATE OR REPLACE FUNCTION auto_update_order_status()
RETURNS TRIGGER AS $$
DECLARE
    all_finished BOOLEAN;
BEGIN
    -- Chỉ kiểm tra khi trạng thái của hạng mục thay đổi sang FINISHED
    IF NEW.status = 'FINISHED' THEN
        -- Kiểm tra xem còn hạng mục nào chưa xong không
        SELECT NOT EXISTS (
            SELECT 1 FROM "order_items" 
            WHERE repair_order_id = NEW.repair_order_id 
              AND status != 'FINISHED'
        ) INTO all_finished;

        -- Nếu tất cả đã xong thì chuyển đơn hàng sang trạng thái KIEM_TRA_CHAT_LUONG (Waiting for QC)
        IF all_finished THEN
            UPDATE "repair_orders"
            SET status = 'KIEM_TRA_CHAT_LUONG',
                updated_at = NOW()
            WHERE id = NEW.repair_order_id
              AND status = 'DANG_SUA_CHUA'; -- Chỉ tự động chuyển nếu đang trong quá trình sửa
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Gán TRIGGER
DROP TRIGGER IF EXISTS trg_auto_update_order_status ON "order_items";
CREATE TRIGGER trg_auto_update_order_status
AFTER UPDATE OF status ON "order_items"
FOR EACH ROW EXECUTE FUNCTION auto_update_order_status();
