'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, Lock, UserCircle2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { useSession } from 'next-auth/react';

export default function BookingPage() {
    const { data: session, status } = useSession();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [services, setServices] = useState<any[]>([]);

    const roles = (session?.user as any)?.roles || [];
    const isStaff = roles.some((r: string) => ['ADMIN', 'SALE', 'KHO', 'QUAN_LY_XUONG', 'THO_SUA_CHUA', 'KE_TOAN'].includes(r));
    const isCustomer = roles.includes('KHACH_HANG') || (!isStaff && roles.length > 0);

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
        fetch(`${API_URL}/public/services`)
            .then(res => res.json())
            .then(data => setServices(data))
            .catch(err => console.error('Error fetching services:', err));
        
        // Auto fill for customer
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                hoTen: session.user?.name || prev.hoTen,
                soDienThoai: (session.user as any)?.phoneNumber || prev.soDienThoai,
                email: session.user?.email || prev.email,
            }));
        }
    }, [session]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-md shadow-sm border border-stone-200 p-10 text-center">
                    <UserCircle2 className="w-16 h-16 mx-auto mb-6 text-stone-300" />
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">Yêu cầu đăng nhập</h2>
                    <p className="text-stone-600 mb-8">
                        Vui lòng đăng nhập tài khoản khách hàng để thực hiện đặt lịch hẹn dịch vụ.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link href="/login" className="w-full bg-orange-600 text-white px-6 py-3 rounded text-sm font-medium hover:bg-orange-700 transition-colors">
                            Đăng nhập ngay
                        </Link>
                        <Link href="/" className="text-stone-500 hover:text-stone-800 text-sm font-medium py-2">
                            Tiếp tục xem trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isStaff) {
        return (
            <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-md shadow-sm border border-stone-200 p-10 text-center">
                    <Lock className="w-16 h-16 mx-auto mb-6 text-orange-600/20" />
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">Truy cập bị chặn</h2>
                    <p className="text-stone-600 mb-8 italic">
                        Bạn đang đăng nhập bằng tài khoản nội bộ Gara. Vui lòng sử dụng hệ thống quản trị để tiếp nhận xe trực tiếp.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link href="/sale/reception" className="w-full bg-stone-800 text-white px-6 py-3 rounded text-sm font-medium hover:bg-stone-900 transition-colors">
                            Đến trang tiếp nhận xe
                        </Link>
                        <Link href="/" className="text-stone-500 hover:text-stone-800 text-sm font-medium py-2">
                            Quay lại trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/public/booking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    userId: (session?.user as any)?.id // Send ID from session
                })
            });

            const result = await res.json();

            if (result.success) {
                setSubmitted(true);
            } else {
                showToast('error', result.message || 'Có lỗi xảy ra, vui lòng thử lại');
            }
        } catch (error) {
            showToast('error', 'Không thể kết nối đến máy chủ');
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
                <div className="max-w-md w-full bg-white rounded-md shadow-sm border border-stone-200 p-8 text-center">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-800 mb-3">Đặt lịch thành công</h2>
                    <p className="text-stone-600 mb-8 leading-relaxed">
                        Cảm ơn anh/chị <strong>{formData.hoTen}</strong>. Gara đã nhận được thông tin đặt lịch. Cố vấn dịch vụ sẽ gọi lại cho anh/chị qua số điện thoại <strong>{formData.soDienThoai}</strong> để xác nhận trong thời gian sớm nhất.
                    </p>
                    <Link href="/" className="inline-block bg-orange-600 text-white px-6 py-3 rounded text-sm font-medium hover:bg-orange-700 transition-colors">
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafaf8] py-8 md:py-12 px-4 selection:bg-orange-200">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors mb-6 text-sm font-medium">
                        <ArrowLeft size={16} /> Trang chủ
                    </Link>
                    <h1 className="text-3xl font-bold text-stone-800 mb-2">Đặt lịch hẹn dịch vụ</h1>
                    <p className="text-stone-600">Vui lòng điền thông tin tham khảo bên dưới, Gara sẽ liên hệ lại để xác nhận.</p>
                </div>

                <div className="bg-white border border-stone-200 shadow-sm rounded-md overflow-hidden">
                    <form onSubmit={handleSubmit} className="divide-y divide-stone-100">
                        {/* Thông tin khách hàng */}
                        <div className="p-6 md:p-8">
                            <h2 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-3">
                                <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">1</span>
                                Thông tin liên hệ
                            </h2>
                            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-stone-800"
                                        placeholder="Nhập họ và tên"
                                        value={formData.hoTen}
                                        onChange={e => setFormData({ ...formData, hoTen: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full px-4 py-2.5 rounded border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-stone-800"
                                        placeholder="Nhập số điện thoại"
                                        value={formData.soDienThoai}
                                        onChange={e => setFormData({ ...formData, soDienThoai: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Thông tin xe */}
                        <div className="p-6 md:p-8 bg-stone-50/50">
                            <h2 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-3">
                                <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">2</span>
                                Thông tin xe
                            </h2>
                            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Biển số xe <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-stone-800 uppercase"
                                        placeholder="VD: 30A-123.45"
                                        value={formData.bienSoXe}
                                        onChange={e => setFormData({ ...formData, bienSoXe: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Dòng xe / Đời xe</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-stone-800"
                                        placeholder="VD: Mazda CX-5 2020"
                                        value={formData.modelXe}
                                        onChange={e => setFormData({ ...formData, modelXe: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Thời gian & Tình trạng */}
                        <div className="p-6 md:p-8">
                            <h2 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-3">
                                <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">3</span>
                                Thời gian & Yêu cầu
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Ngày giờ dự kiến mang xe qua <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full md:w-1/2 px-4 py-2.5 rounded border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-stone-800"
                                        value={formData.ngayHen}
                                        onChange={e => setFormData({ ...formData, ngayHen: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Mô tả tình trạng xe (nếu có)</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-stone-800 resize-none"
                                        placeholder="Ghi chú thêm về tiếng kêu, đèn báo lỗi, hoặc các hiện tượng lạ..."
                                        value={formData.ghiChu}
                                        onChange={e => setFormData({ ...formData, ghiChu: e.target.value })}
                                    ></textarea>
                                </div>
                                {services.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-3">Dịch vụ quan tâm (có thể chọn nhiều)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {services.map(s => {
                                                const isSelected = formData.selectedServiceIds.includes(s.id);
                                                return (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() => toggleService(s.id)}
                                                        className={`px-4 py-2 text-sm rounded border transition-colors ${isSelected
                                                            ? 'bg-orange-50 border-orange-500 text-orange-700 font-medium'
                                                            : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                                                            }`}
                                                    >
                                                        {s.tenHang}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="p-6 md:p-8 bg-stone-50 flex items-center justify-between border-t border-stone-100">
                            <span className="text-sm text-stone-500 hidden md:inline-block">Kỹ thuật viên sẽ kiểm tra thực tế xe trước khi báo giá.</span>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto bg-orange-600 text-white px-8 py-3 rounded font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    'Hoàn tất đặt lịch'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center text-sm text-stone-500">
                    <p>Hotline hỗ trợ kỹ thuật: <a href="tel:0987654321" className="font-medium text-stone-700">098.765.4321</a></p>
                    <p className="mt-1">Địa chỉ: 123 Đường Láng, Đống Đa, Hà Nội</p>
                </div>
            </div>
        </div>
    );
}
