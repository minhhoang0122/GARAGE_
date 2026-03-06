package com.gara.modules.inventory.service;

import com.gara.entity.Product;
import com.gara.modules.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Cacheable("products")
    public List<Product> getAllProducts() {
        // Note: Results are cached - use paginated query for large datasets
        return productRepository.findProductsPaginated();
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public Product createProduct(Product product) {
        validatePrice(product);
        return productRepository.save(product);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public Product updateProduct(Integer id, Product req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (req.getTenHang() != null)
            product.setTenHang(req.getTenHang());

        // Update Price
        if (req.getGiaBanNiemYet() != null) {
            product.setGiaBanNiemYet(req.getGiaBanNiemYet());
            validatePrice(product); // Rule 83 check
        }

        if (req.getGiaVon() != null)
            product.setGiaVon(req.getGiaVon());

        if (req.getThueVAT() != null)
            product.setThueVAT(req.getThueVAT());

        return productRepository.save(product);
    }

    // Rule 83: Enforce Selling Price Control
    private void validatePrice(Product product) {
        if (product.getGiaBanNiemYet() == null || product.getGiaVon() == null)
            return;

        // Example Rule: Selling Price must be >= Cost Price
        if (product.getGiaBanNiemYet().compareTo(product.getGiaVon()) < 0) {
            throw new RuntimeException("Vi phạm quy tắc giá (Rule 83): Giá bán (" +
                    product.getGiaBanNiemYet() + ") thấp hơn Giá vốn (" + product.getGiaVon() + ").");
        }
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void batchUpdatePrices(List<java.util.Map<String, Object>> items) {
        for (java.util.Map<String, Object> item : items) {
            Integer id = Integer.parseInt(item.get("id").toString());

            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + id));

            if (item.containsKey("price")) {
                product.setGiaBanNiemYet(new BigDecimal(item.get("price").toString()));
            }
            if (item.containsKey("warrantyMonths")) {
                product.setBaoHanhSoThang(Integer.parseInt(item.get("warrantyMonths").toString()));
            }
            if (item.containsKey("warrantyKm")) {
                product.setBaoHanhKm(Integer.parseInt(item.get("warrantyKm").toString()));
            }

            validatePrice(product);
            productRepository.save(product);
        }
    }
}
