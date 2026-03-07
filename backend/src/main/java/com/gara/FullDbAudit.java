package com.gara;

import java.sql.*;
import java.util.*;

public class FullDbAudit {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/postgres";
        String user = "postgres";
        String password = "talama123";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet tables = metaData.getTables(null, "public", "%", new String[] { "TABLE" });

            System.out.println("--- BÁO CÁO TỔNG QUÁT CẤU TRÚC DATABASE ---");

            while (tables.next()) {
                String tableName = tables.getString("TABLE_NAME");
                if (tableName.startsWith("databasechangelog"))
                    continue;

                System.out.println("\nBảng: [" + tableName + "]");
                ResultSet columns = metaData.getColumns(null, "public", tableName, "%");

                List<String> colNames = new ArrayList<>();
                while (columns.next()) {
                    String colName = columns.getString("COLUMN_NAME");
                    colNames.add(colName);
                    System.out.print(colName + ", ");
                }
                System.out.println();

                // Thuật toán phát hiện shadow columns:
                // Nếu tồn tại 'ngay_tao' và 'ngaytao' trong cùng 1 bảng -> 'ngaytao' là rác.
                for (String col : colNames) {
                    if (col.contains("_")) {
                        String legacy = col.replace("_", "");
                        if (colNames.contains(legacy)) {
                            System.out.println("  [!] PHÁT HIỆN CỘT RÁC: " + legacy + " (vì đã có " + col + ")");
                            // Thực hiện xóa luôn cho nóng
                            try (Statement stmt = conn.createStatement()) {
                                stmt.execute("ALTER TABLE " + tableName + " DROP COLUMN IF EXISTS " + legacy);
                                System.out.println("      -> ĐÃ XÓA " + tableName + "." + legacy);
                            } catch (SQLException e) {
                                System.err.println("      -> LỖI KHI XÓA: " + e.getMessage());
                            }
                        }
                    }
                }
            }

            System.out.println("\n--- HOÀN TẤT DỌN DẸP TOÀN BỘ DATABASE ---");

        } catch (SQLException e) {
            System.err.println("Lỗi kết nối DB: " + e.getMessage());
        }
    }
}
