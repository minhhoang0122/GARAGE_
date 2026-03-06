package com.gara.modules.customer.repository;

import com.gara.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
    // Exact match for Plate search
    java.util.Optional<Vehicle> findByBienSo(String bienSo);

    // Like search for autocomplete
    java.util.List<Vehicle> findByBienSoContaining(String bienSo);
}
