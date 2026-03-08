package com.gara.modules.public_api.controller;

import com.gara.modules.public_api.dto.PublicBookingDTO;
import com.gara.modules.public_api.dto.PublicProductDTO;
import com.gara.modules.public_api.service.BookingService;
import com.gara.modules.inventory.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicBookingController {

    private final ProductRepository productRepository;
    private final BookingService bookingService;

    public PublicBookingController(ProductRepository productRepository, BookingService bookingService) {
        this.productRepository = productRepository;
        this.bookingService = bookingService;
    }

    @GetMapping("/services")
    public List<PublicProductDTO> getPublicServices() {
        return productRepository.findAll().stream()
                .filter(p -> p.getLaDichVu())
                .map(p -> new PublicProductDTO(
                        p.getId(),
                        p.getMaHang(),
                        p.getTenHang(),
                        p.getGiaBanNiemYet(),
                        p.getThueVAT(),
                        p.getLaDichVu(),
                        p.getBaoHanhSoThang(),
                        p.getBaoHanhKm()))
                .toList();
    }

    @PostMapping("/booking")
    public ResponseEntity<?> createBooking(@RequestBody PublicBookingDTO bookingDto) {
        try {
            Integer receptionId = bookingService.createBooking(bookingDto);
            return ResponseEntity.ok().body(java.util.Map.of(
                    "success", true,
                    "message", "Đặt lịch thành công",
                    "receptionId", receptionId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }
}
