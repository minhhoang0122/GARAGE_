package com.gara.modules.public_api.controller;

import com.gara.entity.Reception;
import com.gara.entity.RepairOrder;
import com.gara.modules.reception.repository.ReceptionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicTrackingController {

    private final ReceptionRepository receptionRepository;

    public PublicTrackingController(ReceptionRepository receptionRepository) {
        this.receptionRepository = receptionRepository;
    }

    @GetMapping("/tracking")
    public ResponseEntity<?> trackVehicleProgress(@RequestParam String bienSo) {
        if (bienSo == null || bienSo.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Biển số không hợp lệ"));
        }

        // Tối ưu query format
        String processedBienSo = bienSo.trim().toUpperCase();

        List<Reception> records = receptionRepository.findByXeBienSoOrderByNgayGioDesc(processedBienSo);

        if (records.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy dữ liệu bảo dưỡng cho biển số " + processedBienSo));
        }

        // Lấy phiếu nhận xe gần nhất
        Reception latestReception = records.get(0);
        RepairOrder order = latestReception.getDonHangSuaChua();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("bienSo", latestReception.getXeBienSo());
        response.put("modelXe", latestReception.getXe() != null ? latestReception.getXe().getModel() : "Không rõ");
        response.put("ngayTiepNhan",
                latestReception.getNgayGio() != null ? latestReception.getNgayGio().format(formatter) : "");
        response.put("yeuCauSoBo", latestReception.getYeuCauSoBo());

        // Nếu đã duyệt báo giá và tạo Order
        if (order != null) {
            response.put("trangThai", order.getTrangThai().name());
            response.put("trangThaiLabel", getLabelByStatus(order.getTrangThai().name()));
            response.put("tongTien", order.getTongCong());
            response.put("daThanhToan", order.getSoTienDaTra());
        } else {
            response.put("trangThai", "DANG_KHAM");
            response.put("trangThaiLabel", "Đang khám xe & Lên báo giá");
            response.put("tongTien", 0);
        }

        return ResponseEntity.ok(response);
    }

    private String getLabelByStatus(String status) {
        return switch (status) {
            case "TIEP_NHAN" -> "Đang chờ vào xưởng";
            case "DANG_SUA_CHUA" -> "Đang thi công trên cầu nâng";
            case "CHO_PHU_TUNG" -> "Đang chờ nhập vật tư/phụ tùng";
            case "HOAN_THANH" -> "Đã rửa xe - Chờ bàn giao";
            case "DA_GIAO_XE" -> "Đã xuất xưởng";
            case "HUY" -> "Đã hủy bỏ";
            default -> "Đang xử lý";
        };
    }
}
