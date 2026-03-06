package com.gara.modules.notification.repository;

import com.gara.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId OR n.role = :role ORDER BY n.createdAt DESC")
    List<Notification> findByUserOrRole(@Param("userId") Integer userId, @Param("role") String role);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId OR n.role = :role ORDER BY n.createdAt DESC")
    List<Notification> findRecentByUserOrRole(@Param("userId") Integer userId, @Param("role") String role,
            org.springframework.data.domain.Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE (n.userId = :userId OR n.role = :role) AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUserOrRole(@Param("userId") Integer userId, @Param("role") String role,
            org.springframework.data.domain.Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE (n.userId = :userId OR n.role = :role) AND n.isRead = false")
    void markAllAsRead(@Param("userId") Integer userId, @Param("role") String role);
}
