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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-green-100">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Hoàn tất đặt lịch!</h2>
                    <p className="text-slate-600 mb-8">
                        Cảm ơn {formData.hoTen}. Chúng tôi đã tiếp nhận yêu cầu đặt lịch của bạn.
                        Nhân viên sẽ liên hệ xác nhận trong thời gian sớm nhất.
                    </p>
                    <Link href="/" className="block w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Đặt lịch sửa chữa trực tuyến</h1>
                    <p className="text-slate-600">Nhanh chóng, thuận tiện và không cần đăng nhập.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
                        {/* Section 1: Customer Info */}
                        <div className="p-8">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-indigo-600">
                                <User size={20} />
                                Thông tin khách hàng
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.hoTen}
                                        onChange={e => setFormData({ ...formData, hoTen: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại *</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="09xx xxx xxx"
                                        value={formData.soDienThoai}
                                        onChange={e => setFormData({ ...formData, soDienThoai: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Quận/Huyện, Tỉnh/TP"
                                        value={formData.diaChi}
                                        onChange={e => setFormData({ ...formData, diaChi: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Vehicle Info */}
                        <div className="p-8">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-indigo-600">
                                <Car size={20} />
                                Thông tin xe
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Biển số xe *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="30A-123.45"
                                        value={formData.bienSoXe}
                                        onChange={e => setFormData({ ...formData, bienSoXe: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Dòng xe (Model)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Toyota Vios, Ford Ranger..."
                                        value={formData.modelXe}
                                        onChange={e => setFormData({ ...formData, modelXe: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Appointment & Services */}
                        <div className="p-8">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-indigo-600">
                                <Calendar size={20} />
                                Lịch hẹn & Dịch vụ
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Thời gian mong muốn *</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.ngayHen}
                                        onChange={e => setFormData({ ...formData, ngayHen: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-4">Các dịch vụ mong muốn</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {services.map(s => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => toggleService(s.id)}
                                                className={`p-3 text-sm rounded-xl border text-left transition-all ${formData.selectedServiceIds.includes(s.id)
                                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                                                    : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                                                    }`}
                                            >
                                                {s.tenHang}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú yêu cầu</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Chi tiết tình trạng xe hoặc yêu cầu khác..."
                                        value={formData.ghiChu}
                                        onChange={e => setFormData({ ...formData, ghiChu: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Xác nhận đặt lịch'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
