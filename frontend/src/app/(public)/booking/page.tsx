'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, User, Phone, Car, FileText, CheckCircle2, Loader2, Wrench, ArrowLeft, TriangleAlert } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BookingPage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [services, setServices] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        hoTen: '',
        soDienThoai: '',
        email: '',
        diaChi: '',
        bienSoXe: '',
        modelXe: '',
        ngayHen: '',
        ghiChu: '',
        selectedServiceIds: [] as number[]
    });

    useEffect(() => {
        // Fetch public services for pricing/selection
        fetch('/api/public/services')
            .then(res => res.json())
            .then(data => setServices(data))
            .catch(err => console.error('Error fetching services:', err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/public/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (result.success) {
                setSubmitted(true);
                // Xoá toast success mỏng manh vì đã có màn hình Phiếu cứng cáp
            } else {
                showToast('error', result.message || 'Có lỗi xảy ra khi truyền dữ liệu');
            }
        } catch (error) {
            showToast('error', 'Mất kết nối với máy chủ xưởng');
        } finally {
            setLoading(false);
        }
    };

    const toggleService = (id: number) => {
        setFormData(prev => ({
            ...prev,
            selectedServiceIds: prev.selectedServiceIds.includes(id)
                ? prev.selectedServiceIds.filter(s => s !== id)
                : [...prev.selectedServiceIds, id]
        }));
    };

    // --- Mechanical Motion Variants ---
    const mechanicalSpring = {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        show: { opacity: 1, scale: 1, y: 0, transition: mechanicalSpring }
    };

    // --- Màn hình Hoàn tất: Dạng "Phiếu Tiếp Nhận" Công nghiệp ---
    if (submitted) {
        return (
            <div className="min-h-screen bg-[#1C1917] flex items-center justify-center p-4 selection:bg-orange-500 selection:text-white">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={mechanicalSpring}
                    className="max-w-xl w-full bg-[#fafaf8] border-t-[12px] border-orange-600 shadow-2xl relative"
                >
                    {/* Dấu xé giấy ở viền */}
                    <div className="absolute top-0 left-0 w-full h-3 flex overflow-hidden -mt-3">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-[#1C1917] -mt-5 mx-0.5 shrink-0"></div>
                        ))}
                    </div>

                    <div className="p-10 md:p-14">
                        <div className="flex justify-between items-start mb-10 border-b-2 border-stone-200 pb-8">
                            <div>
                                <h2 className="text-3xl font-extrabold text-[#111] uppercase tracking-tight">Phiếu Tiếp Nhận</h2>
                                <p className="text-stone-500 mt-1 font-mono uppercase text-sm">Mã chờ: #GN-{Math.floor(1000 + Math.random() * 9000)}</p>
                            </div>
                            <div className="w-16 h-16 bg-stone-900 flex items-center justify-center text-orange-500 shadow-[4px_4px_0_0_#ea580c]">
                                <CheckCircle2 size={32} strokeWidth={2.5} />
                            </div>
                        </div>

                        <div className="space-y-6 mb-12 font-mono text-sm tracking-tight text-stone-700">
                            <div className="grid grid-cols-3 gap-4 border-l-2 border-stone-300 pl-4">
                                <span className="font-bold">Khách hàng:</span>
                                <span className="col-span-2 text-stone-900 uppercase font-bold">{formData.hoTen}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-l-2 border-stone-300 pl-4">
                                <span className="font-bold">Biển số:</span>
                                <span className="col-span-2 text-stone-900 border border-stone-900 bg-white px-2 py-0.5 inline-block w-fit font-bold">{formData.bienSoXe || 'CHƯA CẬP NHẬT'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-l-2 border-stone-300 pl-4">
                                <span className="font-bold">SĐT Liên hệ:</span>
                                <span className="col-span-2 text-stone-900">{formData.soDienThoai}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-l-2 border-stone-300 pl-4">
                                <span className="font-bold">Hạng mục:</span>
                                <span className="col-span-2 text-stone-900">
                                    {formData.selectedServiceIds.length > 0
                                        ? `${formData.selectedServiceIds.length} Dịch vụ yêu cầu`
                                        : 'Chẩn đoán chung'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-orange-50 p-4 border border-orange-200 mb-10 flex gap-4">
                            <TriangleAlert className="text-orange-600 shrink-0" />
                            <p className="text-sm font-medium text-orange-900 leading-relaxed">
                                Cố vấn Dịch vụ sẽ gọi cho quý khách trong vòng 30 phút để chốt giờ đưa xe vào cầu nâng. Xin để ý điện thoại.
                            </p>
                        </div>

                        <Link href="/" className="group block w-full bg-[#111] hover:bg-black text-white text-center py-5 font-bold uppercase tracking-widest transition-all active:scale-95 shadow-xl hover:shadow-orange-600/20 shadow-orange-600/10 flex items-center justify-center gap-3">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            Quay Về Trang Chủ
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    // --- Màn hình Form Booking ---
    return (
        <div className="min-h-screen bg-[#1C1917] selection:bg-orange-500 selection:text-white py-12 md:py-20 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header Back & Info */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={mechanicalSpring}
                    >
                        <Link href="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-white mb-6 uppercase text-xs font-bold tracking-widest transition-colors">
                            <ArrowLeft size={16} /> Quay lại
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tighter uppercase">Xếp Nốt Đưa Xe Vào Xưởng</h1>
                        <p className="text-stone-400 text-lg border-l-4 border-orange-600 pl-4 mt-4">Khai báo tình trạng để thợ máy chuẩn bị cầu nâng và phụ tùng trước khi bạn đến.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={mechanicalSpring}
                        className="bg-stone-800 text-stone-300 p-4 border border-stone-700 flex items-center gap-4 hidden lg:flex shrink-0"
                    >
                        <div className="w-12 h-12 bg-orange-600 flex items-center justify-center text-white font-bold text-xl scale-110">
                            24/7
                        </div>
                        <div>
                            <p className="text-sm uppercase tracking-wide">Hotline Cứu Hộ Lốp/Máy</p>
                            <a href="tel:0987654321" className="text-xl font-bold text-white tracking-widest">098.765.4321</a>
                        </div>
                    </motion.div>
                </div>

                {/* Form Wrapper */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="bg-[#fafaf8] rounded-none shadow-2xl relative"
                >
                    {/* Industrial Tab Edge */}
                    <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500"></div>

                    <form onSubmit={handleSubmit} className="divide-y-4 divide-stone-200">
                        {/* Khu vực 1: Con Người */}
                        <div className="p-8 md:p-12 lg:grid lg:grid-cols-4 gap-12">
                            <div className="lg:col-span-1 mb-8 lg:mb-0">
                                <div className="flex items-center gap-3 font-bold text-[#111] uppercase tracking-wider mb-2">
                                    <div className="bg-[#111] text-white p-2 shrink-0 shadow-[2px_2px_0_0_#ea580c]">
                                        <User size={20} />
                                    </div>
                                    <span className="text-lg">Tài xế</span>
                                </div>
                                <p className="text-sm text-stone-500 mt-4 leading-relaxed">Thông tin người liên hệ trực tiếp nhận báo giá và tư vấn từ Cố Vấn Dịch Vụ.</p>
                            </div>

                            <motion.div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
                                <motion.div variants={itemVariants}>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Tên gọi *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-5 py-4 bg-white border-2 border-stone-200 focus:border-[#111] focus:ring-0 outline-none transition-colors font-medium text-lg placeholder:font-normal placeholder:text-stone-300 shadow-inner"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.hoTen}
                                        onChange={e => setFormData({ ...formData, hoTen: e.target.value })}
                                    />
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Số điện thoại *</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full px-5 py-4 bg-white border-2 border-stone-200 focus:border-[#111] focus:ring-0 outline-none transition-colors font-medium text-lg placeholder:font-normal placeholder:text-stone-300 font-mono shadow-inner"
                                        placeholder="09xx xxx xxx"
                                        value={formData.soDienThoai}
                                        onChange={e => setFormData({ ...formData, soDienThoai: e.target.value })}
                                    />
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Biển số (* Bắt buộc)</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-5 py-4 bg-yellow-50 border-2 border-yellow-400 focus:border-[#111] text-[#111] focus:bg-white focus:ring-0 outline-none transition-colors font-bold text-xl uppercase tracking-widest placeholder:text-yellow-300/50 placeholder:font-medium shadow-inner"
                                        placeholder="30E-123.45"
                                        value={formData.bienSoXe}
                                        onChange={e => setFormData({ ...formData, bienSoXe: e.target.value })}
                                    />
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Đời xe (VD: CX5 2020)</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-white border-2 border-stone-200 focus:border-[#111] focus:ring-0 outline-none transition-colors font-medium text-lg placeholder:font-normal placeholder:text-stone-300 uppercase shadow-inner"
                                        placeholder="Hãng/Model/Năm"
                                        value={formData.modelXe}
                                        onChange={e => setFormData({ ...formData, modelXe: e.target.value })}
                                    />
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Khu Vực 2: Tình Trạng */}
                        <div className="p-8 md:p-12 lg:grid lg:grid-cols-4 gap-12 bg-white">
                            <div className="lg:col-span-1 mb-8 lg:mb-0">
                                <div className="flex items-center gap-3 font-bold text-[#111] uppercase tracking-wider mb-2">
                                    <div className="bg-orange-600 text-white p-2 shrink-0 shadow-[2px_2px_0_0_#111]">
                                        <Wrench size={20} />
                                    </div>
                                    <span className="text-lg">Bắt Bệnh</span>
                                </div>
                                <p className="text-sm text-stone-500 mt-4 leading-relaxed">Hãy miêu tả chi tiết tiếng kêu, biểu hiện lạ hoặc đèn báo rỗi trên taplo.</p>
                            </div>

                            <div className="lg:col-span-3 space-y-8">
                                <motion.div variants={itemVariants}>
                                    <label className="block text-xs font-bold text-[#111] uppercase tracking-widest mb-3">Ngày giờ vứt xe tại xưởng *</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full md:w-1/2 px-5 py-4 bg-[#fafaf8] border-2 border-[#111] focus:ring-0 outline-none transition-colors font-bold text-lg font-mono shadow-[4px_4px_0_0_#111] focus:translate-y-1 focus:translate-x-1 focus:shadow-[0px_0px_0_0_#111]"
                                        value={formData.ngayHen}
                                        onChange={e => setFormData({ ...formData, ngayHen: e.target.value })}
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Miêu tả triệu chứng xe</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-5 py-4 bg-[#fafaf8] border-2 border-stone-200 focus:border-[#111] focus:ring-0 outline-none transition-colors font-medium text-lg placeholder:font-normal placeholder:text-stone-300 shadow-inner resize-none"
                                        placeholder="VD: Xe chạy cao tốc rung tay lái. Đèn check engine sáng vàng. Điều hòa hàng ghế sau không mát..."
                                        value={formData.ghiChu}
                                        onChange={e => setFormData({ ...formData, ghiChu: e.target.value })}
                                    ></textarea>
                                </motion.div>

                                {services.length > 0 && (
                                    <motion.div variants={itemVariants}>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-4 border-b border-stone-200 pb-2">Hạng mục đã chốt (Option)</label>
                                        <div className="flex flex-wrap gap-3">
                                            {services.map(s => {
                                                const isSelected = formData.selectedServiceIds.includes(s.id);
                                                return (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() => toggleService(s.id)}
                                                        className={`px-4 py-3 text-sm font-bold tracking-wide uppercase transition-all duration-75 active:scale-95 border-2 ${isSelected
                                                                ? 'bg-[#111] border-[#111] text-white shadow-[2px_2px_0_0_#ea580c] -translate-y-0.5'
                                                                : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:text-[#111]'
                                                            }`}
                                                    >
                                                        {isSelected && <CheckCircle2 size={16} className="inline mr-2 text-orange-500" />}
                                                        {s.tenHang}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Submit Action */}
                        <motion.div variants={itemVariants} className="p-8 md:p-12 bg-stone-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <p className="text-stone-500 text-sm font-medium w-full md:max-w-xs text-center md:text-left leading-relaxed">
                                Nhấp xác nhận, kỹ thuật viên sẽ chuẩn bị báo giá vật tư và chờ đón lõng xe của bạn ở khu vực lễ tân.
                            </p>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto min-w-[300px] bg-orange-600 border-2 border-[#111] text-white py-5 px-10 font-bold uppercase tracking-widest text-lg hover:bg-orange-500 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-[8px_8px_0_0_#111] hover:shadow-[4px_4px_0_0_#111] hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        ĐANG BÁO BỘ ĐÀM...
                                    </>
                                ) : (
                                    'XÁC NHẬN MANG XE TỚI'
                                )}
                            </button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
