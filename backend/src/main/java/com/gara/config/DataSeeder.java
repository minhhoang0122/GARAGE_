package com.gara.config;

import com.gara.entity.Product;
import com.gara.modules.inventory.repository.ProductRepository;
import com.gara.modules.identity.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final ProductRepository productRepository;
    private final AuthService authService;
    private final com.gara.modules.auth.repository.RoleRepository roleRepository;

    public DataSeeder(ProductRepository productRepository,
                      AuthService authService,
                      com.gara.modules.auth.repository.RoleRepository roleRepository) {
        this.productRepository = productRepository;
        this.authService = authService;
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        try {
            log.info("Seeding default users...");
            authService.seedDefaultUsers(roleRepository);

            if (productRepository.count() > 0) {
                log.info("Products already exist, skipping seed.");
                return;
            }

            log.info("Seeding products...");

            Product[] products = {
                // Parts
                Product.builder().maHang("DAUNHOT_CASTROL_10W40")
                    .tenHang("Dầu nhớt Castrol Power 1 10W-40 (1L)")
                    .giaVon(new BigDecimal("120000"))
                    .giaBanNiemYet(new BigDecimal("150000")).soLuongTon(100)
                    .laDichVu(false).build(),
                Product.builder().maHang("LOCDAU_TOYOTA")
                    .tenHang("Lọc dầu Toyota Innova/Fortuner")
                    .giaVon(new BigDecimal("80000"))
                    .giaBanNiemYet(new BigDecimal("120000")).soLuongTon(50)
                    .laDichVu(false).build(),
                Product.builder().maHang("BOPHANH_TRUOC_VIOS")
                    .tenHang("Má phanh trước Vios 2018+")
                    .giaVon(new BigDecimal("450000"))
                    .giaBanNiemYet(new BigDecimal("850000")).soLuongTon(20)
                    .laDichVu(false).build(),
                Product.builder().maHang("NUOCLAMMAT_BLUE")
                    .tenHang("Nước làm mát màu xanh (Can 1L)")
                    .giaVon(new BigDecimal("60000"))
                    .giaBanNiemYet(new BigDecimal("90000")).soLuongTon(60)
                    .laDichVu(false).build(),
                Product.builder().maHang("GAT_MUA_BOSCH").tenHang("Gạt mưa Bosch 24 inch")
                    .giaVon(new BigDecimal("150000"))
                    .giaBanNiemYet(new BigDecimal("250000")).soLuongTon(30)
                    .laDichVu(false).build(),
                Product.builder().maHang("LOCGIO_DONGCO").tenHang("Lọc gió động cơ Honda Civic")
                    .giaVon(new BigDecimal("180000"))
                    .giaBanNiemYet(new BigDecimal("280000")).soLuongTon(15)
                    .laDichVu(false).build(),

                // Services
                Product.builder().maHang("DV_KIEMTRA").tenHang("Công kiểm tra tổng quát")
                    .giaVon(BigDecimal.ZERO)
                    .giaBanNiemYet(new BigDecimal("200000")).laDichVu(true)
                    .soLuongTon(0).build(),
                Product.builder().maHang("DV_BAODUONG_CAP1").tenHang("Bảo dưỡng cấp 1 (5000km)")
                    .giaVon(BigDecimal.ZERO).giaBanNiemYet(new BigDecimal("350000"))
                    .laDichVu(true)
                    .soLuongTon(0).build(),
                Product.builder().maHang("DV_RUAXE").tenHang("Rửa xe hút bụi chi tiết")
                    .giaVon(BigDecimal.ZERO)
                    .giaBanNiemYet(new BigDecimal("80000")).laDichVu(true)
                    .soLuongTon(0).build(),
                Product.builder().maHang("DV_THAYDAU").tenHang("Công thay dầu máy")
                    .giaVon(BigDecimal.ZERO)
                    .giaBanNiemYet(new BigDecimal("50000")).laDichVu(true)
                    .soLuongTon(0).build()
            };

            productRepository.saveAll(Arrays.asList(products));
            log.info("Seeded " + products.length + " products.");
        } catch (Exception e) {
            log.error("Failed to seed data: {}", e.getMessage());
        }
    }
}
