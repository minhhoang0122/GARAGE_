package com.gara.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vaitro_quyen")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_quyen", unique = true, nullable = false, length = 50)
    private String code; // Ví dụ: CREATE_ORDER, APPROVE_QC

    @Column(name = "ten_quyen", nullable = false, length = 100)
    private String name;

    @Column(name = "module", length = 50)
    private String module; // Ví dụ: SERVICE, INVENTORY, FINANCE
}
