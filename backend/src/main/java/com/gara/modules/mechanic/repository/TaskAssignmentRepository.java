package com.gara.modules.mechanic.repository;

import com.gara.entity.TaskAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Integer> {
    List<TaskAssignment> findByOrderItemId(Integer orderItemId);

    List<TaskAssignment> findByOrderItemIdIn(Collection<Integer> orderItemIds);

    // Count active assignments per mechanic (for workload display)
    @Query("SELECT t.mechanic.id as mechanicId, COUNT(DISTINCT i.repairOrder.id) as orderCount " +
           "FROM TaskAssignment t " +
           "JOIN t.orderItem i " +
           "WHERE i.repairOrder.status IN ('IN_PROGRESS', 'RECEIVED') " +
           "GROUP BY t.mechanic.id")
    List<Object[]> countActiveOrdersPerMechanic();

    @Query("SELECT new map(t.mechanic.id as mechanicId, t.mechanic.fullName as mechanicName, COUNT(t) as taskCount, SUM(i.totalAmount * t.laborPercentage / 100) as revenue) " +
           "FROM TaskAssignment t " +
           "JOIN t.orderItem i " +
           "JOIN i.repairOrder r " +
           "WHERE r.status IN ('COMPLETED', 'CLOSED') " +
           "AND (CASE WHEN r.paymentDate IS NOT NULL THEN r.paymentDate ELSE r.createdAt END) BETWEEN :start AND :end " +
           "GROUP BY t.mechanic.id, t.mechanic.fullName " +
           "ORDER BY SUM(i.totalAmount * t.laborPercentage / 100) DESC")
    List<Map<String, Object>> getMechanicPerformanceStats(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    void deleteByOrderItemId(Integer orderItemId);
}
