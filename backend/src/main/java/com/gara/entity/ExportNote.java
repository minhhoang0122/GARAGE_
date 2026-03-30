package com.gara.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "export_notes")
public class ExportNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "export_type", length = 50)
    private String exportType = "SUA_CHUA";

    @Column(name = "export_date")
    private LocalDateTime exportDate;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repair_order_id", nullable = true)
    private RepairOrder repairOrder;

    @OneToMany(mappedBy = "exportNote", cascade = CascadeType.ALL)
    private List<ExportDetail> exportDetails;

    public ExportNote() {}

    @PrePersist
    protected void onCreate() {
        if (exportDate == null) {
            exportDate = LocalDateTime.now();
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getExportType() { return exportType; }
    public void setExportType(String exportType) { this.exportType = exportType; }

    public LocalDateTime getExportDate() { return exportDate; }
    public void setExportDate(LocalDateTime exportDate) { this.exportDate = exportDate; }

    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }

    public RepairOrder getRepairOrder() { return repairOrder; }
    public void setRepairOrder(RepairOrder repairOrder) { this.repairOrder = repairOrder; }

    public List<ExportDetail> getExportDetails() { return exportDetails; }
    public void setExportDetails(List<ExportDetail> exportDetails) { this.exportDetails = exportDetails; }
}
