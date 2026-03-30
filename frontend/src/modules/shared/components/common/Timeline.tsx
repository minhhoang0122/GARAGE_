'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card';
import { Badge } from '@/modules/shared/components/ui/badge';
import { 
  PlusCircle, 
  Trash2, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle, 
  MessageSquare,
  Clock,
  User as UserIcon,
  Wrench,
  Send,
  Loader2,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRealtimeUpdate } from '@/hooks/useRealtimeUpdate';
import BaseAvatar from './BaseAvatar';
import { useSSEContext } from '@/modules/common/contexts/SSEContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { receptionService } from '@/modules/reception/services/reception';
import { ROLE_DISPLAY_NAMES } from '@/config/menu';

interface TimelineEvent {
  id: number;
  receptionId: number;
  actionType: string; // ADD_ITEM, DELETE_ITEM, UPDATE_ITEM, STATUS_CHANGE, NOTE, MAN_WORK
  content: string;
  oldValue?: string;
  newValue?: string;
  actorName: string;
  actorRole: string;
  createdAt: string;
  isInternal: boolean;
}

const Timeline: React.FC<{ receptionId: number; initialEvents?: TimelineEvent[] }> = ({ receptionId, initialEvents = [] }) => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'NOTES' | 'SYSTEM'>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { subscribeToTopic, unsubscribeFromTopic, addListener, removeListener } = useSSEContext();

  const { data: events = initialEvents, isLoading } = useQuery({
    queryKey: ['reception', receptionId, 'timeline'],
    queryFn: () => receptionService.getTimeline(receptionId),
    initialData: initialEvents.length > 0 ? initialEvents : undefined,
    staleTime: 5000,
  });

  const mutation = useMutation({
    mutationFn: (content: string) => receptionService.addTimelineNote(receptionId, content),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['reception', receptionId, 'timeline'] });
    },
    onError: (err) => console.error('Failed to send message:', err),
  });
  
  // Real-time listener
  useRealtimeUpdate(['reception', receptionId], {
    filter: (data: any) => String(data.receptionId || data.data?.receptionId) === String(receptionId),
    onUpdate: (payload: any) => {
      // Invalidate on any relevant event to ensure UI is in sync
      if (payload.sseType === 'EVENT_TIMELINE' || payload.type === 'UPDATE_ITEM' || payload.type === 'UPDATE_TOTALS') {
        queryClient.invalidateQueries({ queryKey: ['reception', receptionId, 'timeline'] });
      }
    }
  });

  useEffect(() => {
    const topic = `reception:${receptionId}`;
    subscribeToTopic(topic);
    addListener('EVENT_TIMELINE', () => {});
    return () => { 
        unsubscribeFromTopic(topic); 
        removeListener('EVENT_TIMELINE', () => {}); 
    };
  }, [receptionId, subscribeToTopic, unsubscribeFromTopic, addListener, removeListener]);

  // Tự động cuộn xuống cuối khi có tin mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || mutation.isPending) return;
    mutation.mutate(message.trim());
  };

  const filteredEvents = (events || [])
    .filter((e: TimelineEvent) => {
      if (filter === 'ALL') return true;
      return filter === 'NOTES' ? e.actionType === 'NOTE' : e.actionType !== 'NOTE';
    })
    .sort((a: TimelineEvent, b: TimelineEvent) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'ADD_ITEM': return <PlusCircle className="w-4 h-4 text-emerald-500" />;
      case 'DELETE_ITEM': return <Trash2 className="w-4 h-4 text-rose-500" />;
      case 'UPDATE_ITEM': return <RefreshCcw className="w-4 h-4 text-sky-500" />;
      case 'STATUS_CHANGE': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'NOTE': return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'ADD_ITEM': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">BỔ SUNG</Badge>;
      case 'DELETE_ITEM': return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">XÓA</Badge>;
      case 'UPDATE_ITEM': return <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">CẬP NHẬT</Badge>;
      default: return null;
    }
  };

  return (
    <Card className="h-[600px] flex flex-col border border-slate-200 shadow-sm bg-slate-50/30 overflow-hidden animate-in fade-in duration-500">
      <CardHeader className="py-4 px-6 border-b bg-white flex flex-row items-center justify-between shrink-0">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Nhật ký xe (Garage Chatter)
        </CardTitle>
        <button 
          onClick={() => setFilter(filter === 'ALL' ? 'NOTES' : (filter === 'NOTES' ? 'SYSTEM' : 'ALL'))}
          className="text-[10px] font-bold text-slate-400 border border-slate-200 px-3 py-1 rounded-full hover:bg-slate-50 transition-colors"
        >
          <Filter className="w-3 h-3 inline mr-1" />
          {filter === 'ALL' ? 'Tất cả' : (filter === 'NOTES' ? 'Chỉ ghi chú' : 'Chỉ hệ thống')}
        </button>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        {/* Scrollable Timeline - Activity Feed Style */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-slate-200 space-y-3">
          <div className="flex flex-col gap-3">
            {(isLoading && events.length === 0) ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-10 text-slate-400 italic text-sm">Chưa có hoạt động nào.</div>
            ) : (
              filteredEvents.map((event, idx) => {
                const isNote = event.actionType === 'NOTE';
                return (
                  <div key={event.id || idx} className="group">
                    <div className={`p-4 rounded-xl border shadow-sm transition-all duration-200 ${isNote ? 'bg-white border-indigo-100 ring-1 ring-indigo-50/50' : 'bg-white border-slate-200'}`}>
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="p-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                            {getActionIcon(event.actionType)}
                            {event.actionType}
                          </span>
                          {getActionBadge(event.actionType)}
                        </div>
                        <time className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                          {format(new Date(event.createdAt), 'HH:mm - dd/MM', { locale: vi })}
                        </time>
                      </div>

                      <p className={`text-sm leading-relaxed mb-3 ${isNote ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                        {event.content}
                      </p>

                      <div className="flex items-center gap-2 pt-3 border-t border-dashed border-slate-100">
                        <BaseAvatar
                          src={(event as any).actorAvatar || (event as any).actorImage}
                          name={event.actorName || 'Hệ thống'}
                          size="xs"
                          showStatus={false}
                        />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-700 leading-none">{event.actorName || 'Hệ thống'}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            {ROLE_DISPLAY_NAMES[event.actorRole] || event.actorRole || 'Hệ thống'}
                          </span>
                        </div>
                        {event.isInternal && (
                          <Badge variant="secondary" className="text-[9px] h-4 py-0 px-1 ml-auto bg-amber-50 text-amber-600 border-amber-100">NỘI BỘ</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Input Area - Simple Style */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập ghi chú nhanh..."
              className="flex-1 min-h-[44px] max-h-32 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none font-medium"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
            />
            <button
              type="submit"
              disabled={!message.trim() || mutation.isPending}
              className="h-[44px] w-[44px] shrink-0 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <p className="text-[10px] text-slate-400 mt-2 ml-1 text-center font-bold uppercase tracking-widest">
            Nhấn <span className="text-slate-600">Enter</span> để gửi nhanh
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Timeline;
