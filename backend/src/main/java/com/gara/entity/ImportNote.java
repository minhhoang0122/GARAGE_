package com.gara.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "import_notes")
public class ImportNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "import_code", length = 50, unique = true)
    private String importCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplierEntity;

    @Column(name = "supplier_name", length = 200)
    private String supplierName;

    @Column(name = "import_date")
    private LocalDateTime importDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "imported_by_id")
    private User creator;

    @Column(name = "total_amount", precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "notes", length = 500)
    private String note;

    @Column(name = "status", length = 20)
    private String status; // PENDING, COMPLETED, REJECTED

    @OneToMany(mappedBy = "importNote", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ImportDetail> importDetails;

    public ImportNote() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getImportCode() { return importCode; }
    public void setImportCode(String importCode) { this.importCode = importCode; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public LocalDateTime getImportDate() { return importDate; }
    public void setImportDate(LocalDateTime importDate) { this.importDate = importDate; }

    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public List<ImportDetail> getImportDetails() { return importDetails; }
    public void setImportDetails(List<ImportDetail> importDetails) { this.importDetails = importDetails; }
}
