package com.gara.modules.service.repository;

import com.gara.entity.ReceptionTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReceptionTimelineRepository extends JpaRepository<ReceptionTimeline, Long> {
    List<ReceptionTimeline> findByReceptionIdOrderByCreatedAtDesc(Integer receptionId);
    List<ReceptionTimeline> findByReceptionIdOrderByCreatedAtAsc(Integer receptionId);
}
