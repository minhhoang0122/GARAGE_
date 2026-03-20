package com.gara.modules.customer.repository;

import com.gara.entity.Vehicle;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
    // Exact match for Plate search
    Optional<Vehicle> findByBienSo(String bienSo);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM Vehicle v WHERE v.bienSo = :bienSo")
    Optional<Vehicle> findByBienSoWithLock(@Param("bienSo") String bienSo);

    // Like search for autocomplete
    java.util.List<Vehicle> findByBienSoContaining(String bienSo);

    // Customer portal: get all vehicles owned by a customer
    java.util.List<Vehicle> findByKhachHangId(Integer khachHangId);
}
