package com.gara.modules.service.service;

import com.gara.entity.ReceptionTimeline;
import com.gara.entity.User;
import com.gara.modules.service.repository.ReceptionTimelineRepository;
import com.gara.modules.support.service.SseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TimelineService {

    private final ReceptionTimelineRepository timelineRepository;
    private final SseService sseService;

    public TimelineService(ReceptionTimelineRepository timelineRepository, SseService sseService) {
        this.timelineRepository = timelineRepository;
        this.sseService = sseService;
    }

    /**
     * Ghi lại một sự kiện vào dòng thời gian của đơn hàng
     * Sử dụng @Async để không làm chậm giao dịch chính
     */
    // Remove @Async to avoid Foreign Key violations before main txn commit
    @Transactional
    public void recordEvent(Integer receptionId, User actor, String actionType, String content, 
                          String oldValue, String newValue, boolean isInternal) {
        try {
            ReceptionTimeline timeline = ReceptionTimeline.builder()
                    .receptionId(receptionId)
                    .actorId(actor != null ? actor.getId() : null)
                    .actorName(actor != null ? actor.getFullName() : "Hệ thống")
                    .actorRole(actor != null && actor.getRoles() != null && !actor.getRoles().isEmpty() 
                               ? actor.getRoles().iterator().next().getName() : "SYSTEM")
                    .actorAvatar(actor != null ? actor.getAvatar() : null)
                    .actionType(actionType)
                    .content(content)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .isInternal(isInternal)
                    .build();

            timelineRepository.save(timeline);

            // Phát sự kiện SSE để cập nhật giao diện real-time
            String topic = "reception:" + receptionId;
            sseService.broadcastToTopic(topic, "EVENT_TIMELINE", timeline);
            
        } catch (Exception e) {
            // Đảm bảo rủi ro lỗi ghi log không phá nát logic hệ thống chính
            // Ở đây ta chỉ log lỗi ghi nhật ký ra console/logger
            System.err.println("Lỗi khi ghi timeline: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<ReceptionTimeline> getTimeline(Integer receptionId) {
        return timelineRepository.findByReceptionIdOrderByCreatedAtDesc(receptionId);
    }
}
