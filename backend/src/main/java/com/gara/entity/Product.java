package com.gara.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_products_sku", columnList = "sku"),
        @Index(name = "idx_products_name", columnList = "name"),
        @Index(name = "idx_products_is_service", columnList = "is_service")
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "sku", unique = true, nullable = false, length = 50)
    private String sku;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "list_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal listPrice = BigDecimal.ZERO;

    @Column(name = "retail_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal retailPrice = BigDecimal.ZERO;

    @Column(name = "cost_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Column(name = "floor_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal floorPrice = BigDecimal.ZERO;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "min_stock_level", nullable = false)
    private Integer minStockLevel = 5;

    @Column(name = "warranty_months")
    private Integer warrantyMonths = 0;

    @Column(name = "warranty_km")
    private Integer warrantyKm = 0;

    @Column(name = "is_service", nullable = false)
    private Boolean isService = false;

    @Column(name = "vat_rate", precision = 5, scale = 2)
    private BigDecimal vatRate = new BigDecimal("10.00"); // Default 10%

    @Column(name = "is_warranty_eligible")
    private Boolean isWarrantyEligible = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "version")
    private Integer version;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (vatRate == null)
            vatRate = new BigDecimal("10.00");
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Product() {
    }

    public Product(Integer id, String sku, String name, BigDecimal listPrice, BigDecimal retailPrice, BigDecimal costPrice,
            BigDecimal floorPrice, Integer stockQuantity, Integer minStockLevel, Integer warrantyMonths,
            Integer warrantyKm, Boolean isService, BigDecimal vatRate, Boolean isWarrantyEligible, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.sku = sku;
        this.name = name;
        this.listPrice = listPrice;
        this.retailPrice = retailPrice;
        this.costPrice = costPrice;
        this.floorPrice = floorPrice;
        this.stockQuantity = stockQuantity;
        this.minStockLevel = minStockLevel;
        this.warrantyMonths = warrantyMonths;
        this.warrantyKm = warrantyKm;
        this.isService = isService;
        this.vatRate = vatRate;
        this.isWarrantyEligible = isWarrantyEligible;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public BigDecimal getListPrice() {
        return listPrice;
    }

    public void setListPrice(BigDecimal listPrice) {
        this.listPrice = listPrice;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getRetailPrice() {
        return retailPrice;
    }

    public void setRetailPrice(BigDecimal retailPrice) {
        this.retailPrice = retailPrice;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public BigDecimal getFloorPrice() {
        return floorPrice;
    }

    public void setFloorPrice(BigDecimal floorPrice) {
        this.floorPrice = floorPrice;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Integer getMinStockLevel() {
        return minStockLevel;
    }

    public void setMinStockLevel(Integer minStockLevel) {
        this.minStockLevel = minStockLevel;
    }

    public Integer getWarrantyMonths() {
        return warrantyMonths;
    }

    public void setWarrantyMonths(Integer warrantyMonths) {
        this.warrantyMonths = warrantyMonths;
    }

    public Integer getWarrantyKm() {
        return warrantyKm;
    }

    public void setWarrantyKm(Integer warrantyKm) {
        this.warrantyKm = warrantyKm;
    }

    public Boolean getIsService() {
        return isService;
    }

    public void setIsService(Boolean isService) {
        this.isService = isService;
    }

    public BigDecimal getVatRate() {
        return vatRate;
    }

    public void setVatRate(BigDecimal vatRate) {
        this.vatRate = vatRate;
    }

    public Boolean getIsWarrantyEligible() {
        return isWarrantyEligible;
    }

    public void setIsWarrantyEligible(Boolean isWarrantyEligible) {
        this.isWarrantyEligible = isWarrantyEligible;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public static ProductBuilder builder() {
        return new ProductBuilder();
    }

    public static class ProductBuilder {
        private Integer id;
        private String sku;
        private String name;
        private BigDecimal listPrice = BigDecimal.ZERO;
        private BigDecimal retailPrice = BigDecimal.ZERO;
        private BigDecimal costPrice = BigDecimal.ZERO;
        private BigDecimal floorPrice = BigDecimal.ZERO;
        private Integer stockQuantity = 0;
        private Integer minStockLevel = 5;
        private Integer warrantyMonths = 0;
        private Integer warrantyKm = 0;
        private Boolean isService = false;
        private BigDecimal vatRate = new BigDecimal("10.00");
        private Boolean isWarrantyEligible = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Integer version;

        public ProductBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public ProductBuilder sku(String sku) {
            this.sku = sku;
            return this;
        }

        public ProductBuilder name(String name) {
            this.name = name;
            return this;
        }

        public ProductBuilder listPrice(BigDecimal listPrice) {
            this.listPrice = listPrice;
            return this;
        }

        public ProductBuilder retailPrice(BigDecimal retailPrice) {
            this.retailPrice = retailPrice;
            return this;
        }

        public ProductBuilder costPrice(BigDecimal costPrice) {
            this.costPrice = costPrice;
            return this;
        }

        public ProductBuilder floorPrice(BigDecimal floorPrice) {
            this.floorPrice = floorPrice;
            return this;
        }

        public ProductBuilder stockQuantity(Integer stockQuantity) {
            this.stockQuantity = stockQuantity;
            return this;
        }

        public ProductBuilder minStockLevel(Integer minStockLevel) {
            this.minStockLevel = minStockLevel;
            return this;
        }

        public ProductBuilder warrantyMonths(Integer warrantyMonths) {
            this.warrantyMonths = warrantyMonths;
            return this;
        }

        public ProductBuilder warrantyKm(Integer warrantyKm) {
            this.warrantyKm = warrantyKm;
            return this;
        }

        public ProductBuilder isService(Boolean isService) {
            this.isService = isService;
            return this;
        }

        public ProductBuilder vatRate(BigDecimal vatRate) {
            this.vatRate = vatRate;
            return this;
        }

        public ProductBuilder isWarrantyEligible(Boolean isWarrantyEligible) {
            this.isWarrantyEligible = isWarrantyEligible;
            return this;
        }

        public ProductBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ProductBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public ProductBuilder version(Integer version) {
            this.version = version;
            return this;
        }

        public Product build() {
            Product product = new Product(id, sku, name, listPrice, retailPrice, costPrice, floorPrice, stockQuantity, minStockLevel,
                    warrantyMonths, warrantyKm, isService, vatRate, isWarrantyEligible, createdAt, updatedAt);
            product.setVersion(this.version);
            return product;
        }
    }
}
