package com.gara.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "vaitro")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_vaitro", unique = true, nullable = false, length = 50)
    private String name; // Ví dụ: MANAGER, RECEPTIONIST, MECHANIC

    @Column(name = "mo_ta", length = 255)
    private String description;

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "vaitro_quyen_map", joinColumns = @JoinColumn(name = "vaitro_id"), inverseJoinColumns = @JoinColumn(name = "quyen_id"))
    private Set<Permission> permissions = new HashSet<>();
}
