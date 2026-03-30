package com.gara.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "task_assignments")
public class TaskAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanic_id", nullable = false)
    private User mechanic;

    @Column(name = "work_percentage", precision = 5, scale = 2)
    private BigDecimal laborPercentage; // e.g. 70.00 for 70%

    @Column(name = "is_main_mechanic")
    private Boolean isMainMechanic = false;

    @Column(name = "status", length = 20)
    private String status; // APPROVED, PENDING

    public TaskAssignment() {
    }

    public TaskAssignment(Integer id, OrderItem orderItem, User mechanic, BigDecimal laborPercentage, Boolean isMainMechanic,
            String status) {
        this.id = id;
        this.orderItem = orderItem;
        this.mechanic = mechanic;
        this.laborPercentage = laborPercentage;
        this.isMainMechanic = isMainMechanic != null ? isMainMechanic : false;
        this.status = status;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public OrderItem getOrderItem() {
        return orderItem;
    }

    public void setOrderItem(OrderItem orderItem) {
        this.orderItem = orderItem;
    }

    public User getMechanic() {
        return mechanic;
    }

    public void setMechanic(User mechanic) {
        this.mechanic = mechanic;
    }

    public BigDecimal getLaborPercentage() {
        return laborPercentage;
    }

    public void setLaborPercentage(BigDecimal laborPercentage) {
        this.laborPercentage = laborPercentage;
    }

    public Boolean getIsMainMechanic() {
        return isMainMechanic;
    }

    public void setIsMainMechanic(Boolean isMainMechanic) {
        this.isMainMechanic = isMainMechanic;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public static TaskAssignmentBuilder builder() {
        return new TaskAssignmentBuilder();
    }

    public static class TaskAssignmentBuilder {
        private Integer id;
        private OrderItem orderItem;
        private User mechanic;
        private BigDecimal laborPercentage;
        private Boolean isMainMechanic = false;
        private String status;

        public TaskAssignmentBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public TaskAssignmentBuilder orderItem(OrderItem orderItem) {
            this.orderItem = orderItem;
            return this;
        }

        public TaskAssignmentBuilder mechanic(User mechanic) {
            this.mechanic = mechanic;
            return this;
        }

        public TaskAssignmentBuilder laborPercentage(BigDecimal laborPercentage) {
            this.laborPercentage = laborPercentage;
            return this;
        }

        public TaskAssignmentBuilder isMainMechanic(Boolean isMainMechanic) {
            this.isMainMechanic = isMainMechanic;
            return this;
        }

        public TaskAssignmentBuilder status(String status) {
            this.status = status;
            return this;
        }

        public TaskAssignment build() {
            return new TaskAssignment(id, orderItem, mechanic, laborPercentage, isMainMechanic, status);
        }
    }
}
