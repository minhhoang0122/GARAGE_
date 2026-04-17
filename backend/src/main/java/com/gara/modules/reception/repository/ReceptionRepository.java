package com.gara.modules.reception.repository;

import com.gara.entity.Reception;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface ReceptionRepository extends JpaRepository<Reception, Integer> {

        // Optimized: Eager fetch to avoid N+1 in SaleService.getStats()
        @org.springframework.data.jpa.repository.Query("SELECT r FROM Reception r " +
                        "LEFT JOIN FETCH r.vehicle v " +
                        "LEFT JOIN FETCH v.customer c " +
                        "WHERE r.repairOrder IS NULL AND r.receptionDate > :date " +
                        "ORDER BY r.receptionDate DESC")
        List<Reception> findByRepairOrderIsNullAndReceptionDateAfterOrderByReceptionDateDesc(
                        @org.springframework.data.repository.query.Param("date") LocalDateTime date);

        long countByRepairOrderIsNullAndReceptionDateAfter(LocalDateTime date);

        List<Reception> findByVehicleLicensePlateOrderByReceptionDateDesc(String licensePlate);

        @org.springframework.data.jpa.repository.Query("SELECT " +
                        "r.id, r.receptionDate, v.licensePlate, c.fullName, c.phone, v.brand, v.model, o.id, o.status, r.images, " +
                        "COALESCE(sa.fullName, u.fullName), COALESCE(sa.avatar, u.avatar), " +
                        "COALESCE(dm.id, am.id), COALESCE(dm.fullName, am.fullName), COALESCE(dm.avatar, am.avatar) " +
                        "FROM Reception r " +
                        "JOIN r.vehicle v " +
                        "JOIN v.customer c " +
                        "LEFT JOIN r.receptionist u " +
                        "LEFT JOIN r.repairOrder o " +
                        "LEFT JOIN o.serviceAdvisor sa " +
                        "LEFT JOIN o.diagnosticMechanic dm " +
                        "LEFT JOIN o.assignedMechanic am " +
                        "ORDER BY r.receptionDate DESC")
        List<Object[]> findAllReceptionsRaw(org.springframework.data.domain.Pageable pageable);

        @org.springframework.data.jpa.repository.Query("SELECT r FROM Reception r " +
                        "LEFT JOIN FETCH r.vehicle v " +
                        "LEFT JOIN FETCH v.customer c " +
                        "LEFT JOIN FETCH r.repairOrder o " +
                        "LEFT JOIN FETCH o.serviceAdvisor sa " +
                        "WHERE r.id = :id")
        java.util.Optional<Reception> findByIdWithDetails(
                        @org.springframework.data.repository.query.Param("id") Integer id);

        @org.springframework.data.jpa.repository.Query("SELECT r FROM Reception r " +
                        "LEFT JOIN FETCH r.vehicle v " +
                        "LEFT JOIN FETCH v.customer c " +
                        "LEFT JOIN FETCH r.repairOrder o " +
                        "WHERE r.repairOrder IS NULL " +
                        "AND (r.shellStatus IS NULL OR r.shellStatus NOT IN ('\u0110\u00e3 \u0111\u1ebfn', '\u0110\u00e3 h\u1ee7y')) " +
                        "ORDER BY r.receptionDate DESC")
        List<Reception> findAllBookings();
}
