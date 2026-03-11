package com.gara.modules.inventory.controller;

import com.gara.entity.Product;
import com.gara.modules.inventory.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('MANAGE_INVENTORY', 'ADMIN')")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.createProduct(product));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('MANAGE_INVENTORY', 'ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable Integer id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @PostMapping("/batch-update")
    @PreAuthorize("hasAnyAuthority('MANAGE_INVENTORY', 'ADMIN')")
    public ResponseEntity<?> batchUpdate(@RequestBody java.util.List<java.util.Map<String, Object>> items) {
        try {
            productService.batchUpdatePrices(items);
            return ResponseEntity.ok(java.util.Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("success", false, "error", e.getMessage()));
        }
    }
}
