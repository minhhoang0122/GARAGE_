package com.gara.modules.inventory.service;

import com.gara.entity.Product;
import com.gara.modules.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import java.math.BigDecimal;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final com.gara.modules.support.service.RealtimeService realtimeService;

    public ProductService(ProductRepository productRepository, com.gara.modules.support.service.RealtimeService realtimeService) {
        this.productRepository = productRepository;
        this.realtimeService = realtimeService;
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

        if (req.getName() != null)
            product.setName(req.getName());

        // Update Price
        if (req.getRetailPrice() != null) {
            product.setRetailPrice(req.getRetailPrice());
            validatePrice(product); // Rule 83 check
        }

        if (req.getCostPrice() != null)
            product.setCostPrice(req.getCostPrice());

        Product saved = productRepository.save(product);
        realtimeService.broadcast("metadata_updated", java.util.Map.of(
            "type", "PRODUCT",
            "id", saved.getId(),
            "action", "UPDATE",
            "message", "Giá hoặc thông tin vật tư/dịch vụ đã được cập nhật"
        ));
        return saved;
    }

    // Rule 83: Enforce Selling Price Control
    private void validatePrice(Product product) {
        if (product.getRetailPrice() == null || product.getCostPrice() == null)
            return;

        // Example Rule: Selling Price must be >= Cost Price
        if (product.getRetailPrice().compareTo(product.getCostPrice()) < 0) {
            throw new RuntimeException("Vi phạm quy tắc giá (Rule 83): Giá bán (" +
                    product.getRetailPrice() + ") thấp hơn Giá vốn (" + product.getCostPrice() + ").");
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
                product.setRetailPrice(new BigDecimal(item.get("price").toString()));
            }
            if (item.containsKey("warrantyMonths")) {
                product.setWarrantyMonths(Integer.parseInt(item.get("warrantyMonths").toString()));
            }
            if (item.containsKey("warrantyKm")) {
                product.setWarrantyKm(Integer.parseInt(item.get("warrantyKm").toString()));
            }

            validatePrice(product);
            productRepository.save(product);
        }
        realtimeService.broadcast("metadata_updated", java.util.Map.of(
            "type", "PRODUCT",
            "action", "BATCH_UPDATE",
            "message", "Danh sách giá vật tư đã được cập nhật hàng loạt"
        ));
    }
}
