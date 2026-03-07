package com.gara.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
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

    @Column(name = "reference_code")
    private String referenceCode; // For bank transfer ID

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private RepairOrder order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public FinancialTransaction() {
    }

    public FinancialTransaction(Integer id, BigDecimal amount, TransactionType type, PaymentMethod method,
            String referenceCode, String note, RepairOrder order, User createdBy, LocalDateTime createdAt) {
        this.id = id;
        this.amount = amount;
        this.type = type;
        this.method = method;
        this.referenceCode = referenceCode;
        this.note = note;
        this.order = order;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
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
        private User createdBy;
        private LocalDateTime createdAt;

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

        public FinancialTransactionBuilder createdBy(User createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public FinancialTransactionBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public FinancialTransaction build() {
            return new FinancialTransaction(id, amount, type, method, referenceCode, note, order, createdBy, createdAt);
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
}
