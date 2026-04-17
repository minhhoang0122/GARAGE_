package com.gara.modules.public_api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicTrackingController {

    private final com.gara.modules.public_api.service.PublicTrackingService publicTrackingService;

    public PublicTrackingController(com.gara.modules.public_api.service.PublicTrackingService publicTrackingService) {
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

        return publicTrackingService.getTrackingByPlate(bienSo)
                .map(dto -> {
                    // Wrap in a Map with success:true for easier consumption by the existing frontend logic
                    Map<String, Object> response = new java.util.HashMap<>();
                    response.put("success", true);
                    response.put("uuid", dto.uuid());
                    response.put("licensePlate", dto.licensePlate());
                    response.put("bienSo", dto.licensePlate()); // Backward compatibility
                    response.put("model", dto.model());
                    response.put("modelXe", dto.model()); // Backward compatibility
                    response.put("receptionDate", dto.receptionDate());
                    response.put("ngayTiepNhan", dto.receptionDate()); // Backward compatibility
                    response.put("status", dto.status());
                    response.put("statusLabel", dto.statusLabel());
                    response.put("trangThaiLabel", dto.statusLabel()); // Backward compatibility
                    response.put("preliminaryRequest", dto.preliminaryRequest());
                    response.put("yeuCauSoBo", dto.preliminaryRequest()); // Backward compatibility
                    response.put("items", dto.items());
                    response.put("timeline", dto.timeline());
                    response.put("totalAmount", dto.totalAmount());
                    response.put("tongTien", dto.totalAmount()); // Backward compatibility
                    response.put("paidAmount", dto.paidAmount());
                    response.put("daThanhToan", dto.paidAmount()); // Backward compatibility
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Không tìm thấy dữ liệu bảo dưỡng cho biển số " + bienSo.toUpperCase())));
    }
}
