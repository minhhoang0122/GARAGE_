'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { MapPin, PhoneCall, Clock, Wrench, Settings, Search, Menu, User, CarFront, LayoutDashboard, LogOut, ChevronRight, Save, Eye, Edit3, Plus } from 'lucide-react';
import { BlogPost, LandingSection, Announcement } from '@/modules/landing/types/cms';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getHomeRoute } from '@/lib/routes';
import SectionRegistry from '@/modules/landing/components/SectionRegistry';
import EditableWrapper from '@/modules/landing/components/EditableWrapper';
import Footer from '@/modules/landing/components/Footer';

export default function LandingPage() {
    const { data: session, status } = useSession();
    const queryClient = useQueryClient();
    const [isEditMode, setIsEditMode] = useState(false);
    
    // States for Hero/Tracking (kept in parent for coordination)
    const [trackingPlate, setTrackingPlate] = useState('');
    
    // 1. Fetch CMS Sections
    const { data: landingData, isLoading: isLoadingSections } = useQuery<LandingSection[]>({
        queryKey: ['public', 'cms', 'landing'],
        queryFn: () => api.get('/public/cms/landing')
    });

    const [sections, setSections] = useState<LandingSection[]>([]);
    
    useEffect(() => {
        if (landingData && landingData.length > 0) {
            setSections(landingData);
        } else if (landingData) {
            setSections([
                { sectionId: 'hero', title: '', content: '', imageUrl: '', orderIndex: 0, isActive: true },
                { sectionId: 'intro', title: '', content: '', imageUrl: '', orderIndex: 1, isActive: true },
                { sectionId: 'process', title: '', content: '', imageUrl: '', orderIndex: 2, isActive: true },
                { sectionId: 'facilities', title: '', content: '', imageUrl: '', orderIndex: 3, isActive: true },
                { sectionId: 'blog', title: '', content: '', imageUrl: '', orderIndex: 4, isActive: true },
                { sectionId: 'social_proof', title: '', content: '', imageUrl: '', orderIndex: 5, isActive: true },
                { sectionId: 'cta', title: '', content: '', imageUrl: '', orderIndex: 6, isActive: true }
            ]);
        }
    }, [landingData]);

    // 2. Fetch Other Home Data
    const { data: servicesData = [], isLoading: isLoadingServices } = useQuery<any[]>({
        queryKey: ['public', 'services'],
        queryFn: () => api.getCached('/public/services')
    });

    const { data: blogData = [], isLoading: isLoadingBlog } = useQuery<BlogPost[]>({
        queryKey: ['public', 'cms', 'blog'],
        queryFn: () => api.getCached('/public/cms/blog')
    });

    const { data: announcementsData = [], isLoading: isLoadingAnnouncements } = useQuery<Announcement[]>({
        queryKey: ['public', 'cms', 'announcements'],
        queryFn: () => api.getCached('/public/cms/announcements')
    });

    // 3. Tracking Query
    const { data: trackingResult, isLoading: isTracking, error: trackingFetchError, refetch: executeTrack } = useQuery({
        queryKey: ['public', 'tracking', trackingPlate],
        queryFn: () => api.getCached(`/public/tracking?bienSo=${trackingPlate.replace(/[-. ]/g, '').toUpperCase()}`),
        enabled: false, // Only manual refetch
    });

    const isLoading = isLoadingSections || isLoadingServices || isLoadingBlog || isLoadingAnnouncements;

    const [trackError, setTrackError] = useState('');
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const hotServices = servicesData.slice(0, 6);
    const recentPosts = blogData.slice(0, 3);
    const announcements = announcementsData.slice(0, 3);

    const roles = (session?.user as any)?.roles || [];
    const isStaff = roles.some((r: string) => ['ADMIN', 'SALE', 'KHO', 'QUAN_LY_XUONG', 'THO_SUA_CHUA'].includes(r));
    const isAdmin = roles.includes('ADMIN');

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingPlate.trim()) return;
        
        // Validate biển số xe Việt Nam (VD: 30A-123.45, 29C1-12345, v.v.)
        const plateRegex = /^([1-9]{2}[A-Z]{1}[1-9A-Z]{1})[-. ]?([0-9]{4,5})$/;
        const cleanPlate = trackingPlate.replace(/[-. ]/g, '').toUpperCase();
        
        if (!plateRegex.test(cleanPlate)) {
            setTrackError('Biển số không hợp lệ. Vui lòng nhập đúng định dạng (VD: 30A12345).');
            return;
        }

        setTrackError('');
        executeTrack();
    };

    // Actions for Builder
    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newSections.length) return;
        
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        setSections(newSections.map((s, i) => ({ ...s, orderIndex: i })));
    };

    const toggleSectionActive = (index: number) => {
        const newSections = [...sections];
        newSections[index].isActive = !newSections[index].isActive;
        setSections(newSections);
    };

    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const saveChanges = async () => {
        setIsSaving(true);
        setSaveStatus('saving');
        try {
            await Promise.all(sections.map(section => {
                if (section.id) {
                    return api.put(`/admin/cms/landing/${section.id}`, section);
                } else {
                    return api.post('/admin/cms/landing', section);
                }
            }));
            
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
            setIsEditMode(false);
            queryClient.invalidateQueries({ queryKey: ['public', 'cms', 'landing'] });
            alert('Đã lưu tất cả thay đổi thành công!');
        } catch (err) {
            console.error('Failed to save landing layout:', err);
            setSaveStatus('error');
            alert('Gặp lỗi khi lưu thay đổi. Vui lòng kiểm tra lại kết nối.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={`flex flex-col min-h-screen bg-[#fafaf8] selection:bg-orange-200 overflow-x-hidden ${isEditMode ? 'pt-16' : ''}`}>
            {/* Direct Edit Mode Toolbar */}
            <AnimatePresence>
                {isAdmin && (
                    <motion.div 
                        initial={{ y: -100 }}
                        animate={{ y: 0 }}
                        className="fixed top-0 left-0 right-0 h-16 bg-[#111] border-b border-orange-500/30 z-[100] flex items-center px-6 justify-between shadow-2xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-600 p-2 rounded">
                                <Settings size={20} className="text-white animate-spin-slow" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm uppercase tracking-tighter">Hệ thống Quản trị Nội dung</h4>
                                <p className="text-[10px] text-stone-400 font-mono tracking-widest uppercase">Visual Page Builder v1.0</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {isEditMode ? (
                                <>
                                    <button 
                                        onClick={() => setIsEditMode(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-stone-400 hover:text-white text-xs font-bold uppercase transition-colors"
                                    >
                                        <Eye size={16} /> Xem trước
                                    </button>
                                    <button 
                                        onClick={saveChanges}
                                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-sm text-xs font-bold uppercase transition-all shadow-lg shadow-orange-600/20"
                                    >
                                        <Save size={16} /> Lưu thay đổi
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => setIsEditMode(true)}
                                    className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white px-6 py-2 border border-stone-700 rounded-sm text-xs font-bold uppercase transition-all"
                                >
                                    <Edit3 size={16} /> Bật Chế độ Sửa
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Bar - Trust Signal First */}
            <div className="bg-[#1C1917] text-stone-300 py-2 px-4 text-xs font-semibold border-b border-white/10 hidden md:block">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-orange-500" /> 123 Đường Láng, Đống Đa, HN</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-orange-500" /> T2 - T7: 8:00 - 18:00 | CN: Nghỉ</span>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="bg-[#111] text-white/90 sticky top-0 z-50 border-b border-white/10 shadow-xl">
                <div className="container mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-orange-600 rounded flex items-center justify-center font-black text-white text-xl border-b-4 border-orange-800">GM</div>
                        <span className="font-extrabold text-xl tracking-tight uppercase">Garage Master</span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-8 font-semibold text-sm">
                        <Link href="/services" className="hover:text-orange-500 transition-colors uppercase">Bảng giá</Link>
                        <a href="#quy-trinh" className="hover:text-orange-500 transition-colors uppercase">Quy trình</a>
                        <a href="#co-so" className="hover:text-orange-500 transition-colors uppercase">Cơ sở</a>
                        <Link href="/blog" className="hover:text-orange-500 transition-colors uppercase">Kiến thức</Link>
                        <div className="flex items-center gap-6 ml-4">
                            <div className="flex items-center gap-2 text-orange-500 font-bold text-lg">
                                <PhoneCall size={18} className="animate-pulse" /> 098.765.4321
                            </div>
                            
                            {status === 'authenticated' ? (
                                <Link href={getHomeRoute(roles)} className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-sm text-xs font-bold uppercase transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2">
                                    <LayoutDashboard size={14} /> Dashboard
                                </Link>
                            ) : (
                                <div className="relative">
                                    <button 
                                        onClick={() => setIsLoginOpen(!isLoginOpen)}
                                        className="border border-white/20 hover:border-orange-500 hover:text-orange-500 text-white px-5 py-2 rounded-sm text-xs font-bold uppercase transition-all flex items-center gap-2"
                                    >
                                        Đăng nhập <Menu size={14} className={isLoginOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
                                    </button>

                                    <AnimatePresence>
                                        {isLoginOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-56 bg-[#111] border border-stone-800 shadow-2xl p-2 flex flex-col gap-1"
                                            >
                                                <div className="px-3 py-2 text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-800 mb-1">
                                                    Chọn vai trò đăng nhập
                                                </div>
                                                <Link 
                                                    href="/customer/login" 
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-stone-900 text-white transition-colors group"
                                                    onClick={() => setIsLoginOpen(false)}
                                                >
                                                    <div className="w-8 h-8 rounded bg-blue-600/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-white">Khách hàng</div>
                                                        <div className="text-[10px] text-stone-400 font-medium">Xem lịch hẹn & tiến độ</div>
                                                    </div>
                                                </Link>
                                                <Link 
                                                    href="/admin/login" 
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-stone-900 text-white transition-colors group"
                                                    onClick={() => setIsLoginOpen(false)}
                                                >
                                                    <div className="w-8 h-8 rounded bg-orange-600/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                                        <Wrench size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-white">Nhân viên</div>
                                                        <div className="text-[10px] text-stone-400 font-medium">Hệ thống quản trị nội bộ</div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <Link href="/customer/login" className="lg:hidden p-2 text-white">
                        <User size={24} />
                    </Link>
                </div>
            </nav>

            {/* Dynamic Sections Loop */}
            <main className="flex-grow">
                {sections.map((section, index) => (
                    <EditableWrapper
                        key={section.id || section.sectionId}
                        isEditMode={isEditMode}
                        sectionId={section.sectionId}
                        isActive={section.isActive}
                        onMoveUp={() => moveSection(index, 'up')}
                        onMoveDown={() => moveSection(index, 'down')}
                        onToggleActive={() => toggleSectionActive(index)}
                        onEdit={() => alert(`Sửa section: ${section.sectionId}`)}
                    >
                        <SectionRegistry
                            sectionId={section.sectionId}
                            title={section.title}
                            content={section.content}
                            imageUrl={section.imageUrl}
                            status={status}
                            isStaff={isStaff}
                            hotServices={hotServices}
                            recentPosts={recentPosts}
                            announcements={announcements}
                            trackingPlate={trackingPlate}
                            setTrackingPlate={setTrackingPlate}
                            handleTrack={handleTrack}
                            isTracking={isTracking}
                            trackError={trackError}
                            trackingResult={trackingResult}
                        />
                    </EditableWrapper>
                ))}

                {isEditMode && (
                    <div className="py-20 bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 hover:text-orange-500 hover:border-orange-500 transition-all cursor-pointer group">
                        <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus size={32} />
                        </div>
                        <span className="font-bold uppercase tracking-widest text-sm">Thêm Section mới cho trang chủ</span>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
