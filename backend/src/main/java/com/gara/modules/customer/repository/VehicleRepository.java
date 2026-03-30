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
    Optional<Vehicle> findByLicensePlate(String licensePlate);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM Vehicle v WHERE v.licensePlate = :licensePlate")
    Optional<Vehicle> findByLicensePlateWithLock(@Param("licensePlate") String licensePlate);

    // Like search for autocomplete
    java.util.List<Vehicle> findByLicensePlateContaining(String licensePlate);

    // Customer portal: get all vehicles owned by a customer
    java.util.List<Vehicle> findByCustomerId(Integer customerId);
}
