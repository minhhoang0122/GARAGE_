package com.gara.modules.notification.repository;

import com.gara.entity.Notification;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

        @Query("SELECT n FROM Notification n WHERE " +
                        "(:userId IS NULL OR n.userId = :userId) AND " +
                        "(:role IS NULL OR n.role = :role) AND " +
                        "n.title = :title AND n.content = :content AND " +
                        "n.isRead = false AND " +
                        "n.createdAt > :since")
        List<Notification> findDuplicateUnread(@Param("userId") Integer userId,
                        @Param("role") String role,
                        @Param("title") String title,
                        @Param("content") String content,
                        @Param("since") LocalDateTime since);

        @Query("SELECT n FROM Notification n WHERE n.userId = :userId OR n.role IN :roles ORDER BY n.createdAt DESC")
        List<Notification> findByUserOrRoles(@Param("userId") Integer userId, @Param("roles") List<String> roles);

        @Query("SELECT n FROM Notification n WHERE n.userId = :userId OR n.role IN :roles ORDER BY n.createdAt DESC")
        List<Notification> findRecentByUserOrRoles(@Param("userId") Integer userId, @Param("roles") List<String> roles,
                        org.springframework.data.domain.Pageable pageable);

        @Query("SELECT n FROM Notification n WHERE (n.userId = :userId OR n.role IN :roles) AND n.isRead = false ORDER BY n.createdAt DESC")
        List<Notification> findUnreadByUserOrRoles(@Param("userId") Integer userId, @Param("roles") List<String> roles,
                        org.springframework.data.domain.Pageable pageable);

        @Modifying
        @Transactional
        @Query("UPDATE Notification n SET n.isRead = true WHERE (n.userId = :userId OR n.role IN :roles) AND n.isRead = false")
        void markAllAsRead(@Param("userId") Integer userId, @Param("roles") List<String> roles);
}
