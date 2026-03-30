package com.gara.config;

import com.gara.entity.Product;
import com.gara.modules.inventory.repository.ProductRepository;
import com.gara.modules.identity.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DataSeeder {

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

    @EventListener(ApplicationReadyEvent.class)
    public void run() {
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
                Product.builder().sku("DAUNHOT_CASTROL_10W40")
                    .name("Dầu nhớt Castrol Power 1 10W-40 (1L)")
                    .costPrice(new BigDecimal("120000"))
                    .retailPrice(new BigDecimal("150000")).stockQuantity(100)
                    .isService(false).build(),
                Product.builder().sku("LOCDAU_TOYOTA")
                    .name("Lọc dầu Toyota Innova/Fortuner")
                    .costPrice(new BigDecimal("80000"))
                    .retailPrice(new BigDecimal("120000")).stockQuantity(50)
                    .isService(false).build(),
                Product.builder().sku("BOPHANH_TRUOC_VIOS")
                    .name("Má phanh trước Vios 2018+")
                    .costPrice(new BigDecimal("450000"))
                    .retailPrice(new BigDecimal("850000")).stockQuantity(20)
                    .isService(false).build(),
                Product.builder().sku("NUOCLAMMAT_BLUE")
                    .name("Nước làm mát màu xanh (Can 1L)")
                    .costPrice(new BigDecimal("60000"))
                    .retailPrice(new BigDecimal("90000")).stockQuantity(60)
                    .isService(false).build(),
                Product.builder().sku("GAT_MUA_BOSCH").name("Gạt mưa Bosch 24 inch")
                    .costPrice(new BigDecimal("150000"))
                    .retailPrice(new BigDecimal("250000")).stockQuantity(30)
                    .isService(false).build(),
                Product.builder().sku("LOCGIO_DONGCO").name("Lọc gió động cơ Honda Civic")
                    .costPrice(new BigDecimal("180000"))
                    .retailPrice(new BigDecimal("280000")).stockQuantity(15)
                    .isService(false).build(),

                // Services
                Product.builder().sku("DV_KIEMTRA").name("Công kiểm tra tổng quát")
                    .costPrice(BigDecimal.ZERO)
                    .retailPrice(new BigDecimal("200000")).isService(true)
                    .stockQuantity(0).build(),
                Product.builder().sku("DV_BAODUONG_CAP1").name("Bảo dưỡng cấp 1 (5000km)")
                    .costPrice(BigDecimal.ZERO).retailPrice(new BigDecimal("350000"))
                    .isService(true)
                    .stockQuantity(0).build(),
                Product.builder().sku("DV_RUAXE").name("Rửa xe hút bụi chi tiết")
                    .costPrice(BigDecimal.ZERO)
                    .retailPrice(new BigDecimal("80000")).isService(true)
                    .stockQuantity(0).build(),
                Product.builder().sku("DV_THAYDAU").name("Công thay dầu máy")
                    .costPrice(BigDecimal.ZERO)
                    .retailPrice(new BigDecimal("50000")).isService(true)
                    .stockQuantity(0).build()
            };

            productRepository.saveAll(Arrays.asList(products));
            log.info("Seeded " + products.length + " products.");
        } catch (Exception e) {
            log.error("Failed to seed data: {}", e.getMessage());
        }
    }
}
