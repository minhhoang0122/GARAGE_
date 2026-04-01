package com.gara.modules.service.service;

import com.gara.entity.ReceptionTimeline;
import com.gara.entity.User;
import com.gara.modules.service.repository.ReceptionTimelineRepository;
import com.gara.modules.support.service.RealtimeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;

@Service
public class TimelineService {

    private final ReceptionTimelineRepository timelineRepository;
    private final RealtimeService realtimeService;

    public TimelineService(ReceptionTimelineRepository timelineRepository, RealtimeService realtimeService) {
        this.timelineRepository = timelineRepository;
        this.realtimeService = realtimeService;
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

            // Tối ưu hóa: Chỉ phát sự kiện real-time sau khi Transaction đã commit thành công
            // Giúp giải phóng kết nối DB sớm và tránh thông báo sai nếu transaction bị rollback
            if (TransactionSynchronizationManager.isActualTransactionActive()) {
                TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            String topic = "reception:" + receptionId;
                            realtimeService.broadcastToTopic(topic, "EVENT_TIMELINE", timeline);
                        }
                    }
                );
            } else {
                // Nếu không có transaction, phát luôn
                String topic = "reception:" + receptionId;
                realtimeService.broadcastToTopic(topic, "EVENT_TIMELINE", timeline);
            }
            
        } catch (Exception e) {
            System.err.println("Lỗi khi ghi timeline: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<ReceptionTimeline> getTimeline(Integer receptionId) {
        return timelineRepository.findByReceptionIdOrderByCreatedAtDesc(receptionId);
    }
}
