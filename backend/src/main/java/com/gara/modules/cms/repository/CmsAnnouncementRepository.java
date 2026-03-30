package com.gara.modules.cms.repository;

import com.gara.modules.cms.entity.CmsAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CmsAnnouncementRepository extends JpaRepository<CmsAnnouncement, Long> {
    
    @Query("SELECT a FROM CmsAnnouncement a WHERE a.isActive = true " +
           "AND a.publishedAt <= :now " +
           "AND (a.expiredAt IS NULL OR a.expiredAt > :now) " +
           "ORDER BY a.isPinned DESC, a.publishedAt DESC")
    List<CmsAnnouncement> findAllActive(@Param("now") LocalDateTime now);

    Optional<CmsAnnouncement> findBySlug(String slug);
}
