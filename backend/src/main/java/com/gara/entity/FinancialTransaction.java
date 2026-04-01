package com.gara.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_transactions", indexes = {
    @Index(name = "idx_financial_transactions_order_id", columnList = "repair_order_id"),
    @Index(name = "idx_financial_transactions_customer_id", columnList = "customer_id")
})
public class FinancialTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TransactionType type; // DEPOSIT, PAYMENT, REFUND

    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false)
    private PaymentMethod method; // CASH, TRANSFER

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TransactionStatus status = TransactionStatus.COMPLETED;

    @Column(name = "reference_code")
    private String referenceCode; // For bank transfer ID

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repair_order_id")
    private RepairOrder order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Generated(event = {EventType.INSERT, EventType.UPDATE})
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public FinancialTransaction() {
    }

    public FinancialTransaction(Integer id, BigDecimal amount, TransactionType type, PaymentMethod method,
            TransactionStatus status, String referenceCode, String note, RepairOrder order, Customer customer,
            User createdBy, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.amount = amount;
        this.type = type;
        this.method = method;
        this.status = status;
        this.referenceCode = referenceCode;
        this.note = note;
        this.order = order;
        this.customer = customer;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }

    public String getReferenceCode() {
        return referenceCode;
    }

    public void setReferenceCode(String referenceCode) {
        this.referenceCode = referenceCode;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public RepairOrder getOrder() {
        return order;
    }

    public void setOrder(RepairOrder order) {
        this.order = order;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static FinancialTransactionBuilder builder() {
        return new FinancialTransactionBuilder();
    }

    public static class FinancialTransactionBuilder {
        private Integer id;
        private BigDecimal amount;
        private TransactionType type;
        private PaymentMethod method;
        private String referenceCode;
        private String note;
        private RepairOrder order;
        private Customer customer;
        private User createdBy;
        private LocalDateTime createdAt;
        private TransactionStatus status = TransactionStatus.COMPLETED;
        private LocalDateTime updatedAt;

        public FinancialTransactionBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public FinancialTransactionBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public FinancialTransactionBuilder type(TransactionType type) {
            this.type = type;
            return this;
        }

        public FinancialTransactionBuilder method(PaymentMethod method) {
            this.method = method;
            return this;
        }

        public FinancialTransactionBuilder referenceCode(String referenceCode) {
            this.referenceCode = referenceCode;
            return this;
        }

        public FinancialTransactionBuilder note(String note) {
            this.note = note;
            return this;
        }

        public FinancialTransactionBuilder order(RepairOrder order) {
            this.order = order;
            return this;
        }

        public FinancialTransactionBuilder customer(Customer customer) {
            this.customer = customer;
            return this;
        }

        public FinancialTransactionBuilder createdBy(User createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public FinancialTransactionBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public FinancialTransactionBuilder status(TransactionStatus status) {
            this.status = status;
            return this;
        }

        public FinancialTransactionBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public FinancialTransaction build() {
            return new FinancialTransaction(id, amount, type, method, status, referenceCode, note, order, customer, createdBy, createdAt, updatedAt);
        }
    }

    public enum TransactionType {
        DEPOSIT, // Đặt cọc
        PAYMENT, // Thanh toán
        REFUND // Hoàn tiền
    }

    public enum PaymentMethod {
        CASH, // Tiền mặt
        TRANSFER // Chuyển khoản
    }

    public enum TransactionStatus {
        PENDING,
        COMPLETED,
        FAILED,
        CANCELLED
    }
}
