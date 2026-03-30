package com.gara.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "export_details")
public class ExportDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 18, scale = 2)
    private BigDecimal exportPrice;

    @Column(name = "total_price", precision = 18, scale = 2)
    private BigDecimal totalAmount;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "export_note_id", nullable = false)
    private ExportNote exportNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    public ExportDetail() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getExportPrice() { return exportPrice; }
    public void setExportPrice(BigDecimal exportPrice) { this.exportPrice = exportPrice; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public ExportNote getExportNote() { return exportNote; }
    public void setExportNote(ExportNote exportNote) { this.exportNote = exportNote; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
}
