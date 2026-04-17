'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, CalendarPlus, CheckCircle, Loader2, 
    AlertCircle, Car, Phone, Calendar, Clock, 
    Wrench, FileText, ChevronRight
} from 'lucide-react';
import { useCreateBooking } from '@/modules/customer/hooks/useCustomer';

const SERVICE_TYPES = [
    { value: 'BAO_DUONG', label: '🔧 Bảo dưỡng định kỳ' },
    { value: 'SUA_CHUA', label: '🛠️ Sửa chữa / Khắc phục sự cố' },
    { value: 'DONG_SON', label: '🎨 Đồng sơn / Ngoại thất' },
    { value: 'CHAN_DOAN', label: '🔍 Chẩn đoán lỗi' },
    { value: 'THAY_THE', label: '♻️ Thay thế phụ tùng' },
    { value: 'KHAC', label: '📋 Khác' },
];

const TIME_SLOTS = [
    '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '13:30', '14:00',
    '14:30', '15:00', '15:30', '16:00', '16:30',
];

interface FormState {
    bienSoXe: string;
    hangXe: string;
    dongXe: string;
    soDienThoai: string;
    loaiDichVu: string;
    ngayHen: string;
    gioHen: string;
    ghiChu: string;
}

interface FormErrors {
    bienSoXe?: string;
    hangXe?: string;
    soDienThoai?: string;
    loaiDichVu?: string;
    ngayHen?: string;
    gioHen?: string;
}

// Vietnamese license plate pattern
const BIEN_SO_PATTERN = /^[0-9]{2}[A-Z]{1,2}[-.]?[0-9]{4,5}$/i;
const PHONE_PATTERN = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

function getTomorrow(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
}

function getMaxDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
}

export default function CustomerBookingPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();

    const [form, setForm] = useState<FormState>({
        bienSoXe: '',
        hangXe: '',
        dongXe: '',
        soDienThoai: '',
        loaiDichVu: '',
        ngayHen: getTomorrow(),
        gioHen: '',
        ghiChu: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [success, setSuccess] = useState(false);
    const bookingMutation = useCreateBooking();

    useEffect(() => {
        if (authStatus === 'unauthenticated') { router.push('/customer/login'); }
    }, [authStatus, router]);

    // Per-field validation
    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case 'bienSoXe':
                if (!value.trim()) return 'Vui lòng nhập biển số xe';
                if (!BIEN_SO_PATTERN.test(value.trim().replace(/\s/g, '')))
                    return 'Biển số không hợp lệ (VD: 51A-12345 hoặc 30A12345)';
                return undefined;
            case 'hangXe':
                if (!value.trim()) return 'Vui lòng nhập hãng xe';
                if (value.trim().length < 2) return 'Hãng xe phải có ít nhất 2 ký tự';
                return undefined;
            case 'soDienThoai':
                if (!value.trim()) return 'Vui lòng nhập số điện thoại liên hệ';
                if (!PHONE_PATTERN.test(value.trim())) return 'Số điện thoại không hợp lệ';
                return undefined;
            case 'loaiDichVu':
                if (!value) return 'Vui lòng chọn loại dịch vụ';
                return undefined;
            case 'ngayHen':
                if (!value) return 'Vui lòng chọn ngày hẹn';
                if (value < getTomorrow()) return 'Ngày hẹn phải từ ngày mai trở đi';
                return undefined;
            case 'gioHen':
                if (!value) return 'Vui lòng chọn khung giờ';
                return undefined;
            default:
                return undefined;
        }
    };

    const validateAll = (): boolean => {
        const newErrors: FormErrors = {};
        const requiredFields: (keyof FormErrors)[] = ['bienSoXe', 'hangXe', 'soDienThoai', 'loaiDichVu', 'ngayHen', 'gioHen'];
        requiredFields.forEach(f => {
            const err = validateField(f, form[f as keyof FormState]);
            if (err) newErrors[f] = err;
        });
        setErrors(newErrors);
        // Mark all required as touched
        const allTouched: Record<string, boolean> = {};
        requiredFields.forEach(f => allTouched[f] = true);
        setTouched(prev => ({ ...prev, ...allTouched }));
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (name: string, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));
        if (touched[name]) {
            const err = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: err }));
        }
    };

    const handleBlur = (name: string) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        const err = validateField(name, form[name as keyof FormState]);
        setErrors(prev => ({ ...prev, [name]: err }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateAll()) return;

        // Build structured notes (ghi chú cho Sale đọc)
        const serviceLabel = SERVICE_TYPES.find(s => s.value === form.loaiDichVu)?.label || form.loaiDichVu;
        const ghiChuFull = [
            `Loại dịch vụ: ${serviceLabel}`,
            form.ghiChu ? `Yêu cầu thêm: ${form.ghiChu}` : '',
        ].filter(Boolean).join('\n');

        // Combine ngayHen + gioHen into ISO datetime
        const appointmentDateTime = form.ngayHen && form.gioHen
            ? `${form.ngayHen}T${form.gioHen}:00`
            : null;

        bookingMutation.mutate({
            bienSoXe: form.bienSoXe.trim().toUpperCase(),
            model: [form.hangXe.trim(), form.dongXe.trim()].filter(Boolean).join(' ') || null,
            ghiChu: ghiChuFull,
            appointmentTime: appointmentDateTime,
        }, {
            onSuccess: () => setSuccess(true),
        });
    };

    const loading = bookingMutation.isPending;
    const apiError = (bookingMutation.error as any)?.message;

    if (authStatus === 'loading') {
        return (
            <div className="min-h-screen bg-stone-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-emerald-500" />
                    </div>
                    <h2 className="text-white font-black text-2xl mb-3 tracking-tight">Đặt lịch thành công!</h2>
                    <p className="text-stone-400 mb-2 leading-relaxed">
                        Yêu cầu đặt lịch của Quý khách đã được ghi nhận.
                    </p>
                    <p className="text-stone-500 text-sm mb-8">
                        Cố vấn dịch vụ sẽ liên hệ xác nhận trong vòng <span className="text-orange-400 font-bold">30 phút</span> trong giờ làm việc.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Link
                            href="/"
                            className="bg-stone-800 hover:bg-stone-700 text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm"
                        >
                            Về trang chủ
                        </Link>
                        <Link
                            href="/customer/progress"
                            className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm flex items-center gap-2"
                        >
                            Tra cứu tiến độ <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-950">
            {/* Header */}
            <header className="bg-stone-900 border-b border-stone-800 px-4 py-3 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Link
                        href="/"
                        className="w-9 h-9 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg flex items-center justify-center transition-colors group"
                    >
                        <ArrowLeft size={18} className="text-stone-300 group-hover:text-white transition-colors group-hover:-translate-x-0.5 transform" />
                    </Link>
                    <div>
                        <h1 className="text-white font-bold leading-none">Đặt lịch hẹn dịch vụ</h1>
                        <p className="text-stone-500 text-xs mt-0.5">Phục vụ trong giờ hành chính 07:30 – 17:00</p>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                {/* API Error */}
                {apiError && (
                    <div className="mb-4 bg-red-900/30 border border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-300 text-sm">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{apiError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 pb-8">
                    {/* Section: Thông tin xe */}
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-stone-800 bg-stone-950/50">
                            <Car size={16} className="text-orange-500" />
                            <span className="text-white font-bold text-sm uppercase tracking-wider">Thông tin phương tiện</span>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Biển số */}
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                                    Biển số xe <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.bienSoXe}
                                    onChange={(e) => handleChange('bienSoXe', e.target.value.toUpperCase())}
                                    onBlur={() => handleBlur('bienSoXe')}
                                    placeholder="VD: 51A-12345"
                                    className={`w-full bg-stone-800/80 border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-stone-600 font-mono tracking-widest
                                        ${errors.bienSoXe && touched.bienSoXe
                                            ? 'border-red-500/70 focus:ring-red-500/20'
                                            : 'border-stone-700 focus:ring-orange-500/30 focus:border-orange-500/50'
                                        }`}
                                />
                                {errors.bienSoXe && touched.bienSoXe && (
                                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.bienSoXe}
                                    </p>
                                )}
                            </div>

                            {/* Hãng xe + Dòng xe */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                                        Hãng xe <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.hangXe}
                                        onChange={(e) => handleChange('hangXe', e.target.value)}
                                        onBlur={() => handleBlur('hangXe')}
                                        placeholder="VD: Toyota, Honda..."
                                        className={`w-full bg-stone-800/80 border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-stone-600
                                            ${errors.hangXe && touched.hangXe
                                                ? 'border-red-500/70 focus:ring-red-500/20'
                                                : 'border-stone-700 focus:ring-orange-500/30 focus:border-orange-500/50'
                                            }`}
                                    />
                                    {errors.hangXe && touched.hangXe && (
                                        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.hangXe}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                                        Dòng xe <span className="text-stone-600 font-normal normal-case">(tùy chọn)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.dongXe}
                                        onChange={(e) => handleChange('dongXe', e.target.value)}
                                        placeholder="VD: Vios, Civic..."
                                        className="w-full bg-stone-800/80 border border-stone-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all placeholder:text-stone-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Liên hệ & Dịch vụ */}
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-stone-800 bg-stone-950/50">
                            <Wrench size={16} className="text-orange-500" />
                            <span className="text-white font-bold text-sm uppercase tracking-wider">Dịch vụ & Liên hệ</span>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Loại dịch vụ */}
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                                    Loại dịch vụ <span className="text-red-400">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SERVICE_TYPES.map(s => (
                                        <button
                                            key={s.value}
                                            type="button"
                                            onClick={() => handleChange('loaiDichVu', s.value)}
                                            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all
                                                ${form.loaiDichVu === s.value
                                                    ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                                                    : 'border-stone-700 bg-stone-800/50 text-stone-400 hover:border-stone-600 hover:text-stone-300'
                                                }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                                {errors.loaiDichVu && touched.loaiDichVu && (
                                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.loaiDichVu}
                                    </p>
                                )}
                            </div>

                            {/* Số điện thoại */}
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                                    Số điện thoại liên hệ <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                                    <input
                                        type="tel"
                                        value={form.soDienThoai}
                                        onChange={(e) => handleChange('soDienThoai', e.target.value)}
                                        onBlur={() => handleBlur('soDienThoai')}
                                        placeholder="VD: 0912345678"
                                        className={`w-full bg-stone-800/80 border text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-stone-600
                                            ${errors.soDienThoai && touched.soDienThoai
                                                ? 'border-red-500/70 focus:ring-red-500/20'
                                                : 'border-stone-700 focus:ring-orange-500/30 focus:border-orange-500/50'
                                            }`}
                                    />
                                </div>
                                {errors.soDienThoai && touched.soDienThoai && (
                                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.soDienThoai}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section: Thời gian hẹn */}
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-stone-800 bg-stone-950/50">
                            <Calendar size={16} className="text-orange-500" />
                            <span className="text-white font-bold text-sm uppercase tracking-wider">Thời gian hẹn</span>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Ngày hẹn */}
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                                    Ngày hẹn <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                                    <input
                                        type="date"
                                        value={form.ngayHen}
                                        min={getTomorrow()}
                                        max={getMaxDate()}
                                        onChange={(e) => handleChange('ngayHen', e.target.value)}
                                        onBlur={() => handleBlur('ngayHen')}
                                        className={`w-full bg-stone-800/80 border text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all
                                            [color-scheme:dark]
                                            ${errors.ngayHen && touched.ngayHen
                                                ? 'border-red-500/70 focus:ring-red-500/20'
                                                : 'border-stone-700 focus:ring-orange-500/30 focus:border-orange-500/50'
                                            }`}
                                    />
                                </div>
                                {errors.ngayHen && touched.ngayHen && (
                                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.ngayHen}
                                    </p>
                                )}
                                <p className="mt-1.5 text-xs text-stone-600">Có thể đặt lịch tối đa 30 ngày trước.</p>
                            </div>

                            {/* Giờ hẹn */}
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                                    Khung giờ <span className="text-red-400">*</span>
                                </label>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {TIME_SLOTS.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => handleChange('gioHen', t)}
                                            className={`py-2 rounded-lg border text-xs font-bold transition-all
                                                ${form.gioHen === t
                                                    ? 'border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                    : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600 hover:text-stone-200'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                {errors.gioHen && touched.gioHen && (
                                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.gioHen}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section: Ghi chú thêm */}
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-stone-800 bg-stone-950/50">
                            <FileText size={16} className="text-stone-500" />
                            <span className="text-white font-bold text-sm uppercase tracking-wider">Ghi chú bổ sung</span>
                            <span className="text-stone-600 text-xs font-normal">(tùy chọn)</span>
                        </div>
                        <div className="p-5">
                            <textarea
                                value={form.ghiChu}
                                onChange={(e) => handleChange('ghiChu', e.target.value)}
                                placeholder="Mô tả thêm triệu chứng, tình trạng xe hoặc yêu cầu đặc biệt..."
                                rows={3}
                                maxLength={500}
                                className="w-full bg-stone-800/80 border border-stone-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all placeholder:text-stone-600 resize-none"
                            />
                            <p className="text-right text-xs text-stone-600 mt-1">{form.ghiChu.length}/500</p>
                        </div>
                    </div>

                    {/* Summary Preview */}
                    {(form.ngayHen && form.gioHen) && (
                        <div className="bg-orange-950/20 border border-orange-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
                            <Clock size={16} className="text-orange-500 shrink-0" />
                            <p className="text-orange-200">
                                Lịch hẹn: <span className="font-bold text-orange-400">
                                    {new Date(form.ngayHen).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} lúc {form.gioHen}
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest shadow-lg shadow-orange-600/20 active:scale-[0.98]"
                    >
                        {loading
                            ? <><Loader2 size={18} className="animate-spin" /> Đang gửi yêu cầu...</>
                            : <><CalendarPlus size={18} /> Xác nhận đặt lịch</>
                        }
                    </button>

                    <p className="text-center text-xs text-stone-600 leading-relaxed">
                        Bằng cách đặt lịch, Quý khách đồng ý để Cố vấn dịch vụ liên hệ xác nhận qua số điện thoại đã cung cấp.
                    </p>
                </form>
            </main>
        </div>
    );
}
