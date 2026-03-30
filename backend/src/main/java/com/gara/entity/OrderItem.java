package com.gara.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;
import com.gara.entity.enums.ItemStatus;

@Entity
@Table(name = "order_items", indexes = {
        @Index(name = "idx_order_items_repair_order_id", columnList = "repair_order_id"),
        @Index(name = "idx_order_items_product_id", columnList = "product_id"),
        @Index(name = "idx_order_items_status", columnList = "status")
})
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Version
    @Column(name = "version")
    private Integer version;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "discount_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "vat_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal vatPercentage = new BigDecimal("10.00");

    @Column(name = "vat_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal vatAmount = BigDecimal.ZERO;

    @Column(name = "priority")
    private Integer priority = 0;

    @Column(name = "price_adjustment_reason", length = 200)
    private String priceAdjustmentReason;

    @Column(name = "notes", length = 500)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    private ItemStatus status = ItemStatus.PROPOSAL; // PROPOSAL, CUSTOMER_APPROVED, CUSTOMER_REJECTED

    @Column(name = "is_warranty")
    private Boolean isWarranty = false;

    @Column(name = "warranty_notes", length = 500)
    private String warrantyNotes;

    @Column(name = "is_warranty_processed")
    private Boolean isWarrantyProcessed = false;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @Column(name = "max_mechanics")
    private Integer maxMechanics = 4;

    @Column(name = "is_emergency")
    private Boolean isEmergency = false;

    @Column(name = "suggested_at")
    private java.time.LocalDateTime suggestedAt;

    // Foreign Keys
    @Column(name = "repair_order_id", insertable = false, updatable = false)
    private Integer repairOrderId;

    @Column(name = "product_id", insertable = false, updatable = false)
    private Integer productId;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repair_order_id", nullable = false)
    private RepairOrder repairOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "mechanic_id", insertable = false, updatable = false)
    private Integer mechanicId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanic_id")
    private User mechanic;

    @OneToMany(mappedBy = "orderItem", cascade = CascadeType.ALL)
    private List<TaskAssignment> taskAssignments;

    @Column(name = "suggested_by_id", insertable = false, updatable = false)
    private Integer suggestedById;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_by_id")
    private User suggestedBy;

    public OrderItem() {
    }

    public OrderItem(Integer id, Integer quantity, BigDecimal unitPrice, BigDecimal discountAmount,
            BigDecimal discountPercentage, BigDecimal totalAmount, BigDecimal vatPercentage, BigDecimal vatAmount,
            Integer priority, String priceAdjustmentReason, ItemStatus status, String notes,
            Boolean isWarranty, String warrantyNotes, Boolean isCompleted, Integer maxMechanics,
            Integer repairOrderId, Integer productId, RepairOrder repairOrder, Product product,
            Integer mechanicId, User mechanic, List<TaskAssignment> taskAssignments,
            Boolean isEmergency, java.time.LocalDateTime suggestedAt, User suggestedBy) {
        this.id = id;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.discountAmount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
        this.discountPercentage = discountPercentage != null ? discountPercentage : BigDecimal.ZERO;
        this.totalAmount = totalAmount;
        this.vatPercentage = vatPercentage != null ? vatPercentage : new BigDecimal("10.00");
        this.vatAmount = vatAmount != null ? vatAmount : BigDecimal.ZERO;
        this.priority = priority != null ? priority : 0;
        this.priceAdjustmentReason = priceAdjustmentReason;
        this.notes = notes;
        this.status = status != null ? status : ItemStatus.PROPOSAL;
        this.isWarranty = isWarranty != null ? isWarranty : false;
        this.warrantyNotes = warrantyNotes;
        this.isCompleted = isCompleted != null ? isCompleted : false;
        this.maxMechanics = maxMechanics != null ? maxMechanics : 4;
        this.repairOrderId = repairOrderId;
        this.productId = productId;
        this.repairOrder = repairOrder;
        this.product = product;
        this.mechanicId = mechanicId;
        this.mechanic = mechanic;
        this.taskAssignments = taskAssignments;
        this.isEmergency = isEmergency != null ? isEmergency : false;
        this.suggestedAt = suggestedAt;
        this.suggestedBy = suggestedBy;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(BigDecimal discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getVatPercentage() {
        return vatPercentage;
    }

    public void setVatPercentage(BigDecimal vatPercentage) {
        this.vatPercentage = vatPercentage;
    }

    public BigDecimal getVatAmount() {
        return vatAmount;
    }

    public void setVatAmount(BigDecimal vatAmount) {
        this.vatAmount = vatAmount;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public String getPriceAdjustmentReason() {
        return priceAdjustmentReason;
    }

    public void setPriceAdjustmentReason(String priceAdjustmentReason) {
        this.priceAdjustmentReason = priceAdjustmentReason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getNote() {
        return notes;
    }

    public void setNote(String note) {
        this.notes = note;
    }

    public ItemStatus getStatus() {
        return status;
    }

    public void setStatus(ItemStatus status) {
        this.status = status;
    }

    public Boolean getIsWarranty() {
        return isWarranty;
    }

    public void setIsWarranty(Boolean isWarranty) {
        this.isWarranty = isWarranty;
    }

    public String getWarrantyNotes() {
        return warrantyNotes;
    }

    public void setWarrantyNotes(String warrantyNotes) {
        this.warrantyNotes = warrantyNotes;
    }

    public Boolean getIsWarrantyProcessed() {
        return isWarrantyProcessed != null ? isWarrantyProcessed : false;
    }

    public void setIsWarrantyProcessed(Boolean isWarrantyProcessed) {
        this.isWarrantyProcessed = isWarrantyProcessed;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public Integer getMaxMechanics() {
        return maxMechanics;
    }

    public void setMaxMechanics(Integer maxMechanics) {
        this.maxMechanics = maxMechanics;
    }

    public Integer getRepairOrderId() {
        return repairOrderId;
    }

    public void setRepairOrderId(Integer repairOrderId) {
        this.repairOrderId = repairOrderId;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public RepairOrder getRepairOrder() {
        return repairOrder;
    }

    public void setRepairOrder(RepairOrder repairOrder) {
        this.repairOrder = repairOrder;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getMechanicId() {
        return mechanicId;
    }

    public void setMechanicId(Integer mechanicId) {
        this.mechanicId = mechanicId;
    }

    public User getMechanic() {
        return mechanic;
    }

    public void setMechanic(User mechanic) {
        this.mechanic = mechanic;
    }

    public List<TaskAssignment> getTaskAssignments() {
        return taskAssignments;
    }

    public void setTaskAssignments(List<TaskAssignment> taskAssignments) {
        this.taskAssignments = taskAssignments;
    }

    public Integer getSuggestedById() {
        return suggestedById;
    }

    public void setSuggestedById(Integer suggestedById) {
        this.suggestedById = suggestedById;
    }

    public User getSuggestedBy() {
        return suggestedBy;
    }

    public void setSuggestedBy(User suggestedBy) {
        this.suggestedBy = suggestedBy;
    }

    public Boolean getIsEmergency() {
        return isEmergency != null ? isEmergency : false;
    }

    public void setIsEmergency(Boolean isEmergency) {
        this.isEmergency = isEmergency;
    }

    public java.time.LocalDateTime getSuggestedAt() {
        return suggestedAt;
    }

    public void setSuggestedAt(java.time.LocalDateTime suggestedAt) {
        this.suggestedAt = suggestedAt;
    }

    public static OrderItemBuilder builder() {
        return new OrderItemBuilder();
    }

    public static class OrderItemBuilder {
        private Integer id;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discountAmount = BigDecimal.ZERO;
        private BigDecimal discountPercentage = BigDecimal.ZERO;
        private BigDecimal totalAmount;
        private BigDecimal vatPercentage = new BigDecimal("10.00");
        private BigDecimal vatAmount = BigDecimal.ZERO;
        private Integer priority = 0;
        private String priceAdjustmentReason;
        private String notes;
        private ItemStatus status = ItemStatus.PROPOSAL;
        private Boolean isWarranty = false;
        private String warrantyNotes;
        private Boolean isCompleted = false;
        private Integer maxMechanics = 4;
        private Integer repairOrderId;
        private Integer productId;
        private RepairOrder repairOrder;
        private Product product;
        private Integer mechanicId;
        private User mechanic;
        private List<TaskAssignment> taskAssignments;

        public OrderItemBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public OrderItemBuilder quantity(Integer quantity) {
            this.quantity = quantity;
            return this;
        }

        public OrderItemBuilder unitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
            return this;
        }

        public OrderItemBuilder discountAmount(BigDecimal discountAmount) {
            this.discountAmount = discountAmount;
            return this;
        }

        public OrderItemBuilder discountPercentage(BigDecimal discountPercentage) {
            this.discountPercentage = discountPercentage;
            return this;
        }

        public OrderItemBuilder totalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
            return this;
        }

        public OrderItemBuilder vatPercentage(BigDecimal vatPercentage) {
            this.vatPercentage = vatPercentage;
            return this;
        }

        public OrderItemBuilder vatAmount(BigDecimal vatAmount) {
            this.vatAmount = vatAmount;
            return this;
        }

        public OrderItemBuilder priority(Integer priority) {
            this.priority = priority;
            return this;
        }

        public OrderItemBuilder priceAdjustmentReason(String priceAdjustmentReason) {
            this.priceAdjustmentReason = priceAdjustmentReason;
            return this;
        }

        public OrderItemBuilder notes(String notes) {
            this.notes = notes;
            return this;
        }

        public OrderItemBuilder status(ItemStatus status) {
            this.status = status;
            return this;
        }

        public OrderItemBuilder isWarranty(Boolean isWarranty) {
            this.isWarranty = isWarranty;
            return this;
        }

        public OrderItemBuilder warrantyNotes(String warrantyNotes) {
            this.warrantyNotes = warrantyNotes;
            return this;
        }

        public OrderItemBuilder isCompleted(Boolean isCompleted) {
            this.isCompleted = isCompleted;
            return this;
        }

        public OrderItemBuilder maxMechanics(Integer maxMechanics) {
            this.maxMechanics = maxMechanics;
            return this;
        }

        public OrderItemBuilder repairOrderId(Integer repairOrderId) {
            this.repairOrderId = repairOrderId;
            return this;
        }

        public OrderItemBuilder productId(Integer productId) {
            this.productId = productId;
            return this;
        }

        public OrderItemBuilder repairOrder(RepairOrder repairOrder) {
            this.repairOrder = repairOrder;
            return this;
        }

        public OrderItemBuilder product(Product product) {
            this.product = product;
            return this;
        }

        public OrderItemBuilder mechanicId(Integer mechanicId) {
            this.mechanicId = mechanicId;
            return this;
        }

        public OrderItemBuilder mechanic(User mechanic) {
            this.mechanic = mechanic;
            return this;
        }

        public OrderItemBuilder taskAssignments(List<TaskAssignment> taskAssignments) {
            this.taskAssignments = taskAssignments;
            return this;
        }

        private User suggestedBy;
        private Boolean isEmergency = false;
        private java.time.LocalDateTime suggestedAt;

        public OrderItemBuilder suggestedBy(User suggestedBy) {
            this.suggestedBy = suggestedBy;
            return this;
        }

        public OrderItemBuilder isEmergency(Boolean isEmergency) {
            this.isEmergency = isEmergency;
            return this;
        }

        public OrderItemBuilder suggestedAt(java.time.LocalDateTime suggestedAt) {
            this.suggestedAt = suggestedAt;
            return this;
        }

        public OrderItem build() {
            return new OrderItem(id, quantity, unitPrice, discountAmount, discountPercentage, totalAmount, vatPercentage, vatAmount,
                    priority, priceAdjustmentReason, status, notes, isWarranty, warrantyNotes, isCompleted, maxMechanics,
                    repairOrderId, productId, repairOrder, product, mechanicId, mechanic, taskAssignments,
                    isEmergency, suggestedAt, suggestedBy);
        }
    }
}
