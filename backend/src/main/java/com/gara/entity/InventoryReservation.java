package com.gara.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_reservations")
public class InventoryReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "status", length = 20)
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, EXPIRED, CANCELLED

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repair_order_id")
    private RepairOrder repairOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User creator;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
    }

    public InventoryReservation() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public RepairOrder getRepairOrder() { return repairOrder; }
    public void setRepairOrder(RepairOrder repairOrder) { this.repairOrder = repairOrder; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }

    // Manual Builder
    public static InventoryReservationBuilder builder() {
        return new InventoryReservationBuilder();
    }

    public static class InventoryReservationBuilder {
        private Integer id;
        private Integer quantity;
        private String status = "ACTIVE";
        private LocalDateTime expiryDate;
        private LocalDateTime createdAt;
        private RepairOrder repairOrder;
        private Product product;
        private User creator;

        public InventoryReservationBuilder id(Integer id) { this.id = id; return this; }
        public InventoryReservationBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public InventoryReservationBuilder status(String status) { this.status = status; return this; }
        public InventoryReservationBuilder expiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; return this; }
        public InventoryReservationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public InventoryReservationBuilder repairOrder(RepairOrder repairOrder) { this.repairOrder = repairOrder; return this; }
        public InventoryReservationBuilder product(Product product) { this.product = product; return this; }
        public InventoryReservationBuilder creator(User creator) { this.creator = creator; return this; }

        public InventoryReservation build() {
            InventoryReservation res = new InventoryReservation();
            res.setId(id);
            res.setQuantity(quantity);
            res.setStatus(status);
            res.setExpiryDate(expiryDate);
            res.setCreatedAt(createdAt);
            res.setRepairOrder(repairOrder);
            res.setProduct(product);
            res.setCreator(creator);
            return res;
        }
    }
}
