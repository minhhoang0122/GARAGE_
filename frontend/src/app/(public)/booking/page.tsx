'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, User, Phone, Car, FileText, CheckCircle2, Loader2, Mail, MapPin } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';

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
                showToast('success', 'Đặt lịch thành công!');
            } else {
                showToast('error', result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            showToast('error', 'Lỗi kết nối máy chủ');
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

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-sm shadow-xl p-10 text-center border-t-4 border-orange-500">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Hoàn tất đặt lịch!</h2>
                    <p className="text-slate-600 mb-8">
                        Cảm ơn {formData.hoTen}. Chúng tôi đã tiếp nhận yêu cầu đặt lịch của bạn.
                        Nhân viên kỹ thuật sẽ liên hệ báo giá sơ bộ và xác nhận trong thời gian sớm nhất.
                    </p>
                    <Link href="/" className="block w-full bg-orange-600 text-white py-4 rounded-sm font-bold hover:bg-orange-700 transition-colors">
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafaf8] py-12 px-4 selection:bg-orange-200">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-[#111] mb-4 tracking-tight">Đặt lịch sửa chữa</h1>
                    <p className="text-stone-600 text-lg">Khám bắt bệnh miễn phí. Có báo giá mới làm.</p>
                </div>

                <div className="bg-white rounded-none shadow-sm border border-stone-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="divide-y divide-stone-100">
                        {/* Section 1: Customer Info */}
                        <div className="p-8">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-orange-600">
                                <User size={20} />
                                THÔNG TIN CHỦ XE
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Họ và tên *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 rounded-none border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.hoTen}
                                        onChange={e => setFormData({ ...formData, hoTen: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Số điện thoại *</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full px-4 py-3 rounded-none border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        placeholder="09xx xxx xxx"
                                        value={formData.soDienThoai}
                                        onChange={e => setFormData({ ...formData, soDienThoai: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 rounded-none border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        placeholder="khach@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Khu vực</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-none border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        placeholder="Quận/Huyện"
                                        value={formData.diaChi}
                                        onChange={e => setFormData({ ...formData, diaChi: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Vehicle Info */}
                        <div className="p-8 bg-[#fafaf8]">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-orange-600">
                                <Car size={20} />
                                THÔNG TIN VỀ XE
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Biển số xe *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 rounded-none border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all uppercase"
                                        placeholder="30A-123.45"
                                        value={formData.bienSoXe}
                                        onChange={e => setFormData({ ...formData, bienSoXe: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Dòng xe (Đời xe)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-none border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        placeholder="Ví dụ: Innova G 2018"
                                        value={formData.modelXe}
                                        onChange={e => setFormData({ ...formData, modelXe: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Appointment & Services */}
                        <div className="p-8">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-orange-600">
                                <Calendar size={20} />
                                NHU CẦU SỬA CHỮA
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Thời gian mang xe qua *</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full px-4 py-3 rounded-none border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        value={formData.ngayHen}
                                        onChange={e => setFormData({ ...formData, ngayHen: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-4">Mô tả bệnh của xe</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-none border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        placeholder="Xe bị hụt ga, điều hòa không mát, gầm kêu lộc cộc..."
                                        value={formData.ghiChu}
                                        onChange={e => setFormData({ ...formData, ghiChu: e.target.value })}
                                    ></textarea>
                                </div>
                                {services.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-4">Các dịch vụ quan tâm thêm</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {services.map(s => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => toggleService(s.id)}
                                                    className={`p-3 text-sm rounded-sm border text-left transition-all font-medium ${formData.selectedServiceIds.includes(s.id)
                                                        ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500'
                                                        : 'border-stone-200 text-stone-600 hover:border-orange-300'
                                                        }`}
                                                >
                                                    {s.tenHang}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 bg-[#111]">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-600 text-white py-5 rounded-sm font-bold text-xl hover:bg-orange-500 transition-all flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(234,88,12,0.4)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Đang chuyển thông tin...
                                    </>
                                ) : (
                                    'XÁC NHẬN ĐẶT LỊCH'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                <div className="mt-8 text-center text-stone-500 text-sm">
                    Gặp sự cố trên đường? Gọi ngay hotline cứu hộ: <a href="tel:098.765.4321" className="font-bold text-orange-600">098.765.4321</a>
                </div>
            </div>
        </div>
    );
}
