package com.gara.modules.cms.repository;

import com.gara.modules.cms.entity.CmsLandingSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CmsLandingSectionRepository extends JpaRepository<CmsLandingSection, Integer> {
    List<CmsLandingSection> findByIsActiveOrderByOrderIndexAsc(Boolean isActive);
    boolean existsBySectionId(String sectionId);
    CmsLandingSection findBySectionId(String sectionId);
}
