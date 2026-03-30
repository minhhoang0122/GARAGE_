package com.gara.modules.cms.repository;

import com.gara.modules.cms.entity.CmsBlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Repository
public interface CmsBlogPostRepository extends JpaRepository<CmsBlogPost, Integer> {
    List<CmsBlogPost> findByStatusOrderByCreatedAtDesc(String status);
    
    @Query("SELECT b FROM CmsBlogPost b WHERE b.status = :status " +
           "AND (b.publishedAt IS NULL OR b.publishedAt <= :now) " +
           "ORDER BY b.publishedAt DESC")
    List<CmsBlogPost> findPublished(@Param("status") String status, @Param("now") LocalDateTime now);

    Optional<CmsBlogPost> findBySlugAndStatus(String slug, String status);
}

