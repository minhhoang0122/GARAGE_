-- V3: Bảo vệ Kho hàng (Inventory Protection)

-- 1. Tạo hàm check tồn kho không âm
CREATE OR REPLACE FUNCTION check_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu cột stock_quantity bị cập nhật nhỏ hơn 0 thì báo lỗi
    IF NEW.stock_quantity < 0 THEN
        RAISE EXCEPTION 'Số lượng tồn hàng hóa [%] không đủ (Tồn: %, Yêu cầu cập nhật: %)', 
            NEW.sku, OLD.stock_quantity, NEW.stock_quantity;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Gán TRIGGER
DROP TRIGGER IF EXISTS trg_prevent_negative_stock ON "products";
CREATE TRIGGER trg_prevent_negative_stock
BEFORE UPDATE ON "products"
FOR EACH ROW
WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
EXECUTE FUNCTION check_inventory_stock();
