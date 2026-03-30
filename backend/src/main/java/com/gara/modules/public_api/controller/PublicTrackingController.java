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
    private final com.gara.modules.public_api.service.PublicTrackingService publicTrackingService;

    public PublicTrackingController(ReceptionRepository receptionRepository, 
                                   com.gara.modules.public_api.service.PublicTrackingService publicTrackingService) {
        this.receptionRepository = receptionRepository;
        this.publicTrackingService = publicTrackingService;
    }

    @GetMapping("/tracking/{uuid}")
    public ResponseEntity<?> getTrackingByUuid(@PathVariable String uuid) {
        return publicTrackingService.getTrackingByUuid(uuid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tracking")
    public ResponseEntity<?> trackVehicleProgress(@RequestParam String bienSo) {
        if (bienSo == null || bienSo.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Biển số không hợp lệ"));
        }

        // Tối ưu query format
        String processedBienSo = bienSo.trim().toUpperCase();

        List<Reception> records = receptionRepository.findByVehicleLicensePlateOrderByReceptionDateDesc(processedBienSo);

        if (records.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy dữ liệu bảo dưỡng cho biển số " + processedBienSo));
        }

        // Lấy phiếu nhận xe gần nhất
        Reception latestReception = records.get(0);
        RepairOrder order = latestReception.getRepairOrder();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("bienSo", latestReception.getVehicle().getLicensePlate());
        response.put("modelXe", latestReception.getVehicle() != null ? latestReception.getVehicle().getModel() : "Không rõ");
        response.put("ngayTiepNhan",
                latestReception.getReceptionDate() != null ? latestReception.getReceptionDate().format(formatter) : "");
        response.put("yeuCauSoBo", latestReception.getPreliminaryRequest());

        // Nếu đã duyệt báo giá và tạo Order
        if (order != null) {
            response.put("trangThai", order.getStatus().name());
            response.put("trangThaiLabel", getLabelByStatus(order.getStatus().name()));
            response.put("tongTien", order.getGrandTotal());
            response.put("daThanhToan", order.getAmountPaid());
        } else {
            response.put("trangThai", "WAITING_FOR_DIAGNOSIS");
            response.put("trangThaiLabel", "Đang khám xe & Lên báo giá");
            response.put("tongTien", 0);
        }

        return ResponseEntity.ok(response);
    }

    private String getLabelByStatus(String status) {
        return switch (status) {
            case "RECEIVED" -> "Đang chờ vào xưởng";
            case "IN_PROGRESS" -> "Đang thi công trên cầu nâng";
            case "WAITING_FOR_PARTS" -> "Đang chờ nhập vật tư/phụ tùng";
            case "COMPLETED" -> "Đã rửa xe - Hoàn thành";
            case "CLOSED" -> "Đã xuất xưởng";
            case "CANCELLED" -> "Đã hủy bỏ";
            default -> "Đang xử lý";
        };
    }
}
