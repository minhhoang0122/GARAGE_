package com.gara.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import com.gara.entity.enums.OrderStatus;

@Entity
@Table(name = "repair_orders", indexes = {
        @Index(name = "idx_repair_orders_status", columnList = "status"),
        @Index(name = "idx_repair_orders_reception_id", columnList = "reception_id"),
        @Index(name = "idx_repair_orders_person_in_charge_id", columnList = "person_in_charge_id"),
        @Index(name = "idx_repair_orders_created_at", columnList = "created_at"),
        @Index(name = "idx_repair_orders_uuid", columnList = "uuid", unique = true)
})
public class RepairOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "uuid", unique = true, columnDefinition = "UUID")
    private UUID uuid;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    private OrderStatus status = OrderStatus.RECEIVED;
    
    @Version
    @Column(name = "version")
    private Integer version;

    @Column(name = "deposit_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal deposit = BigDecimal.ZERO;

    @Column(name = "total_parts_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal partsTotal = BigDecimal.ZERO;

    @Column(name = "total_labor_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal laborTotal = BigDecimal.ZERO;

    @Column(name = "total_discount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalDiscount = BigDecimal.ZERO;

    @Column(name = "total_vat", nullable = false, precision = 18, scale = 2)
    private BigDecimal vatAmount = BigDecimal.ZERO;

    @Column(name = "vat_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal vatPercentage = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "is_warranty")
    private Boolean isWarrantyOrder = false;

    @Column(name = "paid_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "debt_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal balanceDue = BigDecimal.ZERO;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "cancellation_notes", length = 500)
    private String cancelNotes;

    @Column(name = "parent_order_id", insertable = false, updatable = false)
    private Integer parentOrderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_order_id")
    private RepairOrder parentOrder;

    @Column(name = "reception_id", insertable = false, updatable = false)
    private Integer receptionId;

    @Column(name = "assignment_mechanic_id", insertable = false, updatable = false)
    private Integer assignedMechanicId;

    @Column(name = "person_in_charge_id", insertable = false, updatable = false)
    private Integer serviceAdvisorId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reception_id", nullable = false)
    private Reception reception;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_mechanic_id")
    private User assignedMechanic;

    @Column(name = "diagnostic_mechanic_id", insertable = false, updatable = false)
    private Integer diagnosticMechanicId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnostic_mechanic_id")
    private User diagnosticMechanic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_in_charge_id")
    private User serviceAdvisor;

    @OneToMany(mappedBy = "repairOrder", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;

    @OneToMany(mappedBy = "repairOrder")
    private List<ExportNote> exportNotes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null)
            status = OrderStatus.RECEIVED;
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public RepairOrder() {
    }

    public RepairOrder(Integer id, UUID uuid, LocalDateTime createdAt, LocalDateTime approvedAt, OrderStatus status,
            BigDecimal deposit,
            BigDecimal partsTotal, BigDecimal laborTotal, BigDecimal totalDiscount, BigDecimal vatAmount,
            BigDecimal grandTotal, Boolean isWarrantyOrder, BigDecimal amountPaid, BigDecimal balanceDue, String paymentMethod,
            LocalDateTime paymentDate, LocalDateTime paidAt, String notes, Integer parentOrderId, RepairOrder parentOrder,
            Integer receptionId, Integer assignedMechanicId, Integer serviceAdvisorId, Reception reception,
            User assignedMechanic, Integer diagnosticMechanicId, User diagnosticMechanic, User serviceAdvisor,
            List<OrderItem> orderItems, List<ExportNote> exportNotes, BigDecimal vatPercentage, LocalDateTime updatedAt) {
        this.id = id;
        this.uuid = uuid;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.approvedAt = approvedAt;
        this.paidAt = paidAt;
        this.status = status;
        this.deposit = deposit;
        this.partsTotal = partsTotal;
        this.laborTotal = laborTotal;
        this.totalDiscount = totalDiscount;
        this.vatAmount = vatAmount;
        this.grandTotal = grandTotal;
        this.isWarrantyOrder = isWarrantyOrder;
        this.amountPaid = amountPaid;
        this.balanceDue = balanceDue;
        this.paymentMethod = paymentMethod;
        this.paymentDate = paymentDate;
        this.notes = notes;
        this.parentOrderId = parentOrderId;
        this.parentOrder = parentOrder;
        this.receptionId = receptionId;
        this.assignedMechanicId = assignedMechanicId;
        this.serviceAdvisorId = serviceAdvisorId;
        this.reception = reception;
        this.assignedMechanic = assignedMechanic;
        this.diagnosticMechanicId = diagnosticMechanicId;
        this.diagnosticMechanic = diagnosticMechanic;
        this.serviceAdvisor = serviceAdvisor;
        this.orderItems = orderItems;
        this.exportNotes = exportNotes;
        this.vatPercentage = vatPercentage != null ? vatPercentage : BigDecimal.ZERO;
        this.updatedAt = updatedAt;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
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

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public BigDecimal getDeposit() {
        return deposit;
    }

    public void setDeposit(BigDecimal deposit) {
        this.deposit = deposit;
    }

    public BigDecimal getPartsTotal() {
        return partsTotal;
    }

    public void setPartsTotal(BigDecimal partsTotal) {
        this.partsTotal = partsTotal;
    }

    public BigDecimal getLaborTotal() {
        return laborTotal;
    }

    public void setLaborTotal(BigDecimal laborTotal) {
        this.laborTotal = laborTotal;
    }

    public BigDecimal getTotalDiscount() {
        return totalDiscount;
    }

    public void setTotalDiscount(BigDecimal totalDiscount) {
        this.totalDiscount = totalDiscount;
    }

    public BigDecimal getVatAmount() {
        return vatAmount;
    }

    public void setVatAmount(BigDecimal vatAmount) {
        this.vatAmount = vatAmount;
    }

    public BigDecimal getVatPercentage() {
        return vatPercentage;
    }

    public void setVatPercentage(BigDecimal vatPercentage) {
        this.vatPercentage = vatPercentage;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(BigDecimal grandTotal) {
        this.grandTotal = grandTotal;
    }

    public Boolean getIsWarrantyOrder() {
        return isWarrantyOrder;
    }
    public void setIsWarrantyOrder(Boolean isWarrantyOrder) {
        this.isWarrantyOrder = isWarrantyOrder;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public BigDecimal getBalanceDue() {
        return balanceDue;
    }

    public void setBalanceDue(BigDecimal balanceDue) {
        this.balanceDue = balanceDue;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCancelNotes() {
        return cancelNotes;
    }

    public void setCancelNotes(String cancelNotes) {
        this.cancelNotes = cancelNotes;
    }

    public Integer getParentOrderId() {
        return parentOrderId;
    }

    public void setParentOrderId(Integer parentOrderId) {
        this.parentOrderId = parentOrderId;
    }

    public RepairOrder getParentOrder() {
        return parentOrder;
    }

    public void setParentOrder(RepairOrder parentOrder) {
        this.parentOrder = parentOrder;
    }

    public Integer getReceptionId() {
        return receptionId;
    }

    public void setReceptionId(Integer receptionId) {
        this.receptionId = receptionId;
    }

    public Integer getAssignedMechanicId() {
        return assignedMechanicId;
    }

    public void setAssignedMechanicId(Integer assignedMechanicId) {
        this.assignedMechanicId = assignedMechanicId;
    }

    public Integer getServiceAdvisorId() {
        return serviceAdvisorId;
    }

    public void setServiceAdvisorId(Integer serviceAdvisorId) {
        this.serviceAdvisorId = serviceAdvisorId;
    }

    public Reception getReception() {
        return reception;
    }

    public void setReception(Reception reception) {
        this.reception = reception;
    }

    public User getAssignedMechanic() {
        return assignedMechanic;
    }

    public void setAssignedMechanic(User assignedMechanic) {
        this.assignedMechanic = assignedMechanic;
    }

    public Integer getDiagnosticMechanicId() {
        return diagnosticMechanicId;
    }

    public void setDiagnosticMechanicId(Integer diagnosticMechanicId) {
        this.diagnosticMechanicId = diagnosticMechanicId;
    }

    public User getDiagnosticMechanic() {
        return diagnosticMechanic;
    }

    public void setDiagnosticMechanic(User diagnosticMechanic) {
        this.diagnosticMechanic = diagnosticMechanic;
    }

    public User getServiceAdvisor() {
        return serviceAdvisor;
    }

    public void setServiceAdvisor(User serviceAdvisor) {
        this.serviceAdvisor = serviceAdvisor;
    }

    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }

    public List<ExportNote> getExportNotes() {
        return exportNotes;
    }

    public void setExportNotes(List<ExportNote> exportNotes) {
        this.exportNotes = exportNotes;
    }

    public static RepairOrderBuilder builder() {
        return new RepairOrderBuilder();
    }

    public static class RepairOrderBuilder {
        private Integer id;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime approvedAt;
        private OrderStatus status = OrderStatus.RECEIVED;
        private BigDecimal deposit = BigDecimal.ZERO;
        private BigDecimal partsTotal = BigDecimal.ZERO;
        private BigDecimal laborTotal = BigDecimal.ZERO;
        private BigDecimal totalDiscount = BigDecimal.ZERO;
        private BigDecimal vatAmount = BigDecimal.ZERO;
        private BigDecimal vatPercentage = BigDecimal.ZERO;
        private BigDecimal grandTotal = BigDecimal.ZERO;
        private Boolean isWarrantyOrder = false;
        private BigDecimal amountPaid = BigDecimal.ZERO;
        private BigDecimal balanceDue = BigDecimal.ZERO;
        private String paymentMethod;
        private LocalDateTime paymentDate;
        private LocalDateTime paidAt;
        private String notes;
        private Integer parentOrderId;
        private RepairOrder parentOrder;
        private Integer receptionId;
        private Integer assignedMechanicId;
        private Integer serviceAdvisorId;
        private Reception reception;
        private User assignedMechanic;
        private Integer diagnosticMechanicId;
        private User diagnosticMechanic;
        private User serviceAdvisor;
        private List<OrderItem> orderItems;
        private List<ExportNote> exportNotes;
        private UUID uuid;

        RepairOrderBuilder() {
        }

        public RepairOrderBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public RepairOrderBuilder uuid(UUID uuid) {
            this.uuid = uuid;
            return this;
        }

        public RepairOrderBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public RepairOrderBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public RepairOrderBuilder approvedAt(LocalDateTime approvedAt) {
            this.approvedAt = approvedAt;
            return this;
        }

        public RepairOrderBuilder status(OrderStatus status) {
            this.status = status;
            return this;
        }

        public RepairOrderBuilder deposit(BigDecimal deposit) {
            this.deposit = deposit;
            return this;
        }

        public RepairOrderBuilder partsTotal(BigDecimal partsTotal) {
            this.partsTotal = partsTotal;
            return this;
        }

        public RepairOrderBuilder laborTotal(BigDecimal laborTotal) {
            this.laborTotal = laborTotal;
            return this;
        }

        public RepairOrderBuilder totalDiscount(BigDecimal totalDiscount) {
            this.totalDiscount = totalDiscount;
            return this;
        }

        public RepairOrderBuilder vatAmount(BigDecimal vatAmount) {
            this.vatAmount = vatAmount;
            return this;
        }

        public RepairOrderBuilder vatPercentage(BigDecimal vatPercentage) {
            this.vatPercentage = vatPercentage;
            return this;
        }

        public RepairOrderBuilder grandTotal(BigDecimal grandTotal) {
            this.grandTotal = grandTotal;
            return this;
        }

        public RepairOrderBuilder isWarrantyOrder(Boolean isWarrantyOrder) {
            this.isWarrantyOrder = isWarrantyOrder;
            return this;
        }

        public RepairOrderBuilder amountPaid(BigDecimal amountPaid) {
            this.amountPaid = amountPaid;
            return this;
        }

        public RepairOrderBuilder balanceDue(BigDecimal balanceDue) {
            this.balanceDue = balanceDue;
            return this;
        }

        public RepairOrderBuilder paymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public RepairOrderBuilder paymentDate(LocalDateTime paymentDate) {
            this.paymentDate = paymentDate;
            return this;
        }

        public RepairOrderBuilder paidAt(LocalDateTime paidAt) {
            this.paidAt = paidAt;
            return this;
        }

        public RepairOrderBuilder notes(String notes) {
            this.notes = notes;
            return this;
        }

        public RepairOrderBuilder parentOrderId(Integer parentOrderId) {
            this.parentOrderId = parentOrderId;
            return this;
        }

        public RepairOrderBuilder parentOrder(RepairOrder parentOrder) {
            this.parentOrder = parentOrder;
            return this;
        }

        public RepairOrderBuilder receptionId(Integer receptionId) {
            this.receptionId = receptionId;
            return this;
        }

        public RepairOrderBuilder assignedMechanicId(Integer assignedMechanicId) {
            this.assignedMechanicId = assignedMechanicId;
            return this;
        }

        public RepairOrderBuilder serviceAdvisorId(Integer serviceAdvisorId) {
            this.serviceAdvisorId = serviceAdvisorId;
            return this;
        }

        public RepairOrderBuilder reception(Reception reception) {
            this.reception = reception;
            return this;
        }

        public RepairOrderBuilder assignedMechanic(User assignedMechanic) {
            this.assignedMechanic = assignedMechanic;
            return this;
        }

        public RepairOrderBuilder diagnosticMechanicId(Integer diagnosticMechanicId) {
            this.diagnosticMechanicId = diagnosticMechanicId;
            return this;
        }

        public RepairOrderBuilder diagnosticMechanic(User diagnosticMechanic) {
            this.diagnosticMechanic = diagnosticMechanic;
            return this;
        }

        public RepairOrderBuilder serviceAdvisor(User serviceAdvisor) {
            this.serviceAdvisor = serviceAdvisor;
            return this;
        }

        public RepairOrderBuilder orderItems(List<OrderItem> orderItems) {
            this.orderItems = orderItems;
            return this;
        }

        public RepairOrderBuilder exportNotes(List<ExportNote> exportNotes) {
            this.exportNotes = exportNotes;
            return this;
        }

        public RepairOrder build() {
            return new RepairOrder(id, uuid, createdAt, approvedAt, status, deposit, partsTotal, laborTotal, totalDiscount,
                    vatAmount, grandTotal, isWarrantyOrder, amountPaid, balanceDue, paymentMethod, paymentDate, paidAt, notes,
                    parentOrderId, parentOrder, receptionId, assignedMechanicId, serviceAdvisorId, reception,
                    assignedMechanic, diagnosticMechanicId, diagnosticMechanic, serviceAdvisor, orderItems, exportNotes,
                    vatPercentage, updatedAt);
        }
    }
}
