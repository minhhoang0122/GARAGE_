'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { searchVehicle, createReception, VehicleSearchResult } from '@/modules/customer/vehicle';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Car, User, History, Save, ArrowLeft, Fuel, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import ImageCapture from '@/modules/shared/components/common/ImageCapture';
import { useToast } from '@/contexts/ToastContext';

export default function ReceptionPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [vehicleType, setVehicleType] = useState<'CAR' | 'MOTO'>('CAR');
    const [plate, setPlate] = useState('');
    const debouncedPlate = useDebounce(plate, 500);

    // ... existing state ...

    // Update handleSubmit to include loaiXe
    // ...


    const [segments, setSegments] = useState({ s1: '', s2: '', s3: '' });

    // Sync segments to plate string
    useEffect(() => {
        let formatted = '';
        if (vehicleType === 'CAR') {
            // Car: 30K-123.45
            if (segments.s1 && segments.s2) {
                const s2Formatted = segments.s2.length === 5
                    ? `${segments.s2.slice(0, 3)}.${segments.s2.slice(3)}`
                    : segments.s2;

                formatted = `${segments.s1}-${s2Formatted}`;
            } else {
                formatted = segments.s1 + (segments.s2 ? '-' + segments.s2 : '');
            }
        } else {
            // Moto: 29-X1 123.45
            if (segments.s1 && segments.s2 && segments.s3) {
                const s3Formatted = segments.s3.length === 5
                    ? `${segments.s3.slice(0, 3)}.${segments.s3.slice(3)}`
                    : segments.s3;
                formatted = `${segments.s1}-${segments.s2} ${s3Formatted}`;
            } else {
                formatted = [segments.s1, segments.s2, segments.s3].filter(Boolean).join('-');
            }
        }

        // Remove trailing separators for clean partials
        formatted = formatted.replace(/[-.\s]*$/, '');

        setPlate(formatted.toUpperCase());
    }, [segments, vehicleType]);

    // Validate segments individually
    // Validate segments individually
    useEffect(() => {
        const errs: Record<string, string> = {};
        if (vehicleType === 'CAR') {
            if (segments.s1 && !/^[0-9]{2}[A-Z]$/.test(segments.s1)) errs.s1 = 'Sai (VD: 30K)';
            if (segments.s2 && !/^[0-9]{4,5}$/.test(segments.s2)) errs.s2 = '4-5 số';
        } else {
            if (segments.s1 && !/^[0-9]{2}$/.test(segments.s1)) errs.s1 = 'Sai (VD: 29)';
            if (segments.s2 && !/^[A-Z0-9]{2}$/.test(segments.s2)) errs.s2 = 'Sai (VD: X1)';
            if (segments.s3 && !/^[0-9]{4,5}$/.test(segments.s3)) errs.s3 = '4-5 số';
        }

        setFormErrors(prev => {
            const next = { ...prev };
            // Clear old segment errors
            delete next.s1;
            delete next.s2;
            delete next.s3;

            // Apply new errors
            return { ...next, ...errs };
        });
    }, [segments, vehicleType]);

    const [isPending, startTransition] = useTransition();
    const [searchResult, setSearchResult] = useState<VehicleSearchResult | null>(null);

    // Form states
    const [odo, setOdo] = useState<number | string>(0);
    const [fuel, setFuel] = useState(50);
    const [bodyStatus, setBodyStatus] = useState<string[]>([]);
    const [bodyStatusNote, setBodyStatusNote] = useState('');
    const [request, setRequest] = useState('');

    // New Customer/Car states
    const [newCarInfo, setNewCarInfo] = useState({ brand: '', model: '', vin: '', engine: '' });
    const [newCustomerInfo, setNewCustomerInfo] = useState({ name: '', phone: '', address: '', email: '' });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Loading & submit states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: session } = useSession();
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const isSubmittingRef = useRef(false);

    // Dirty check for unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (plate || request || Number(odo) > 0 || newCustomerInfo.name) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [plate, request, odo, newCustomerInfo]);

    // Effect để search khi nhập biển số
    useEffect(() => {
        if (debouncedPlate.length >= 3) {
            startTransition(async () => {
                const result = await searchVehicle(debouncedPlate);
                setSearchResult(result);

                // Auto fill ODO nếu xe đã tồn tại
                if (result.exists && result.vehicle) {
                    setOdo(result.vehicle.ODO_HienTai);
                }
            });
        } else {
            setSearchResult(null);
        }
    }, [debouncedPlate]);

    const validateForm = () => {
        const errors: Record<string, string> = {};
        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

        if (!plate) errors.plate = 'Vui lòng nhập biển số xe';
        if (Number(odo) < 0) errors.odo = 'Số ODO không hợp lệ';
        if (searchResult?.vehicle && Number(odo) < searchResult.vehicle.ODO_HienTai) {
            errors.odo = `ODO mới (${odo}) không thể nhỏ hơn ODO cũ (${searchResult.vehicle.ODO_HienTai})`;
        }

        if (!searchResult?.exists) {
            if (!newCustomerInfo.name) errors.name = 'Tên khách hàng là bắt buộc';
            if (!newCustomerInfo.phone) errors.phone = 'Số điện thoại là bắt buộc';
            else if (!phoneRegex.test(newCustomerInfo.phone)) errors.phone = 'Số điện thoại không đúng định dạng (VN)';

            if (!newCarInfo.brand) errors.brand = 'Nhãn hiệu xe là bắt buộc';
            if (!newCarInfo.model) errors.model = 'Model xe là bắt buộc';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (isSubmittingRef.current) return;
        if (!validateForm()) {
            setError('Vui lòng kiểm tra lại thông tin nhập liệu');
            return;
        }

        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setError('');

        // Gom dữ liệu body status
        let bodyStatusText = bodyStatus.join(', ');
        if (bodyStatusNote) {
            bodyStatusText = bodyStatusText ? `${bodyStatusText}. Ghi chú: ${bodyStatusNote}` : bodyStatusNote;
        }
        if (!bodyStatusText) bodyStatusText = 'Nguyên vẹn';

        try {
            let finalImageUrl = '';

            // 1. Upload nhiều ảnh nếu có
            if (selectedFiles.length > 0) {
                // @ts-ignore
                const token = session?.user?.accessToken;
                if (token) {
                    const uploadPromises = selectedFiles.map(file => {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('folder', 'receptions');
                        return api.upload('/images/upload', formData, token);
                    });

                    const uploadResults = await Promise.all(uploadPromises);
                    finalImageUrl = uploadResults.map(res => res.url).join(',');
                }
            }

            const result = await createReception({
                bienSo: plate,
                odo: Number(odo),
                mucXang: fuel / 100,
                tinhTrangVo: bodyStatusText,
                yeuCauKhach: request,
                loaiXe: vehicleType, // Add vehicle type
                nhanHieu: newCarInfo.brand,
                model: newCarInfo.model,
                soKhung: newCarInfo.vin,
                soMay: newCarInfo.engine,
                tenKhach: newCustomerInfo.name,
                sdtKhach: newCustomerInfo.phone,
                diaChiKhach: newCustomerInfo.address,
                emailKhach: newCustomerInfo.email,
                hinhAnh: finalImageUrl
            });

            if (result.success) {
                // Invalidate cache for dashboards
                api.invalidateCache('/sale/stats');
                api.invalidateCache('/reception');
                api.invalidateCache('/mechanic/inspect');
                api.invalidateCache('/warehouse/stats');
                api.invalidateCache('/warehouse/pending');

                showToast('success', 'Đã tiếp nhận xe thành công!');
                router.replace('/sale');
                router.refresh();
            } else {
                setError(result.error || 'Có lỗi xảy ra');
                showToast('error', result.error || 'Có lỗi xảy ra khi tạo phiếu tiếp nhận');
            }
        } catch (e) {
            setError('Lỗi kết nối');
            showToast('error', 'Lỗi kết nối đến máy chủ');
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    const handleBodyStatusToggle = (status: string) => {
        setBodyStatus(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    return (
        <DashboardLayout title="Tiếp nhận xe" subtitle="Tạo phiếu tiếp nhận mới">
            <div className="max-w-5xl mx-auto">
                <Link href="/sale/reception" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cột trái: Tìm kiếm & Thông tin xe */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Loại phương tiện</label>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-4">
                                <button
                                    onClick={() => {
                                        setVehicleType('CAR');
                                        setPlate('');
                                        setSegments({ s1: '', s2: '', s3: '' });
                                        setFormErrors(prev => { const n = { ...prev }; delete n.plate; return n; });
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${vehicleType === 'CAR'
                                        ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                        }`}
                                >
                                    <Car className="w-4 h-4" /> Ô tô
                                </button>
                                <button
                                    onClick={() => {
                                        setVehicleType('MOTO');
                                        setPlate('');
                                        setSegments({ s1: '', s2: '', s3: '' });
                                        setFormErrors(prev => { const n = { ...prev }; delete n.plate; return n; });
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${vehicleType === 'MOTO'
                                        ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                        }`}
                                >
                                    <div className="w-4 h-4 text-center font-bold">M</div> Xe máy
                                </button>
                            </div>

                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Biển số xe</label>
                            <div className="relative">
                                <div className="flex items-center gap-2">
                                    {vehicleType === 'CAR' ? (
                                        <>
                                            {/* CAR FORMAT: [30K] - [123.45] */}
                                            <div className="relative w-1/3">
                                                <input
                                                    type="text"
                                                    placeholder="30K"
                                                    value={segments.s1}
                                                    onChange={(e) => {
                                                        let val = e.target.value.toUpperCase();
                                                        // Enforce format: 2 Digits + 1 Letter (e.g., 30K)

                                                        // Split into parts to validate per character position if possible, 
                                                        // but simplistic approach:
                                                        // 1. Keep only allowed chars globally first to avoid confusing jumps? 
                                                        // No, strict per position is better.

                                                        const chars = val.split('');
                                                        const newChars: string[] = [];

                                                        for (let i = 0; i < chars.length; i++) {
                                                            const c = chars[i];
                                                            if (i < 2) {
                                                                // First 2 chars: Digits only
                                                                if (/[0-9]/.test(c)) newChars.push(c);
                                                            } else if (i === 2) {
                                                                // 3rd char: Letter only
                                                                if (/[A-Z]/.test(c)) newChars.push(c);
                                                            }
                                                        }

                                                        val = newChars.join('').slice(0, 3);
                                                        setSegments(prev => ({ ...prev, s1: val }));
                                                        if (val.length === 3) document.getElementById('plate-s2')?.focus();
                                                    }}
                                                    className="w-full text-center text-xl font-bold p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                                />
                                                <span className="absolute -right-3 top-1/2 -translate-y-[60%] text-slate-400 font-bold text-3xl">-</span>
                                                {formErrors.s1 && <p className="absolute -bottom-5 left-0 text-[10px] text-red-500">{formErrors.s1}</p>}
                                            </div>
                                            <div className="w-2/3 relative">
                                                <input
                                                    id="plate-s2"
                                                    type="text"
                                                    placeholder="12345"
                                                    value={segments.s2}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
                                                        setSegments(prev => ({ ...prev, s2: val }));
                                                    }}
                                                    className="w-full text-center text-xl font-bold p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tracking-widest"
                                                />
                                                {formErrors.s2 && <p className="absolute -bottom-5 left-0 text-[10px] text-red-500">{formErrors.s2}</p>}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* MOTO FORMAT: [29] - [X1] [123.45] */}
                                            <div className="relative w-1/4">
                                                <input
                                                    type="text"
                                                    placeholder="29"
                                                    value={segments.s1}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                                                        setSegments(prev => ({ ...prev, s1: val }));
                                                        if (val.length === 2) document.getElementById('plate-s2')?.focus();
                                                    }}
                                                    className="w-full text-center text-xl font-bold p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                                <span className="absolute -right-2 top-1/2 -translate-y-[60%] text-slate-400 font-bold text-3xl">-</span>
                                                {formErrors.s1 && <p className="absolute -bottom-5 left-0 text-[10px] text-red-500 whitespace-nowrap">{formErrors.s1}</p>}
                                            </div>
                                            <div className="w-1/4 relative">
                                                <input
                                                    id="plate-s2"
                                                    type="text"
                                                    placeholder="X1"
                                                    value={segments.s2}
                                                    onChange={(e) => {
                                                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 2);
                                                        setSegments(prev => ({ ...prev, s2: val }));
                                                        if (val.length === 2) document.getElementById('plate-s3')?.focus();
                                                    }}
                                                    className="w-full text-center text-xl font-bold p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                                {formErrors.s2 && <p className="absolute -bottom-5 left-0 text-[10px] text-red-500 whitespace-nowrap">{formErrors.s2}</p>}
                                            </div>
                                            <div className="w-2/4 relative">
                                                <input
                                                    id="plate-s3"
                                                    type="text"
                                                    placeholder="12345"
                                                    value={segments.s3}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
                                                        setSegments(prev => ({ ...prev, s3: val }));
                                                    }}
                                                    className="w-full text-center text-xl font-bold p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tracking-widest"
                                                />
                                                {formErrors.s3 && <p className="absolute -bottom-5 left-0 text-[10px] text-red-500">{formErrors.s3}</p>}
                                            </div>
                                        </>
                                    )}

                                    {isPending && (
                                        <div className="absolute right-[-30px] top-1/2 -translate-y-1/2">
                                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex justify-between items-center px-1">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {vehicleType === 'CAR' ? 'Nhập biển số OTO' : 'Nhập biển số XE MÁY'}
                                    </span>
                                    {plate.length > 3 && (
                                        <span className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                            {plate}
                                        </span>
                                    )}
                                </div>
                                {formErrors.plate && <p className="text-xs text-red-500 mt-1">{formErrors.plate}</p>}
                            </div>

                            {/* Hiển thị thông tin xe nếu tìm thấy */}
                            {searchResult?.exists && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                                <h3 className="font-semibold text-blue-800 dark:text-blue-300">Khách hàng</h3>
                                            </div>
                                            <span className="bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 text-xs px-2 py-1 rounded font-medium">Khách quen</span>
                                        </div>
                                        <p className="font-medium text-lg text-slate-900 dark:text-white">{searchResult.customer.HoTen}</p>
                                        <p className="text-slate-600 dark:text-slate-400">{searchResult.customer.SoDienThoai}</p>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl transition-colors">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Car className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Thông tin xe</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="text-slate-500 dark:text-slate-400">Hiệu xe:</div>
                                            <div className="font-medium text-slate-900 dark:text-white">{searchResult.vehicle.NhanHieu}</div>
                                            <div className="text-slate-500 dark:text-slate-400">Model:</div>
                                            <div className="font-medium text-slate-900 dark:text-white">{searchResult.vehicle.Model}</div>
                                            <div className="text-slate-500 dark:text-slate-400">ODO cũ:</div>
                                            <div className="font-medium text-slate-900 dark:text-white">{searchResult.vehicle.ODO_HienTai} km</div>
                                        </div>
                                    </div>

                                    {/* Lịch sử sửa chữa */}
                                    {searchResult.history && searchResult.history.length > 0 && (
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl transition-colors">
                                            <div className="flex items-center gap-2 mb-3">
                                                <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Lịch sử gần đây</h3>
                                            </div>
                                            <div className="space-y-3">
                                                {searchResult.history.map((h: any) => (
                                                    <div key={h.ID} className="text-sm border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                                                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                                            <span>{new Date(h.NgayTao).toLocaleDateString('vi-VN')}</span>
                                                            <span className={h.TrangThai === 'HOAN_THANH' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>
                                                                {h.TrangThai}
                                                            </span>
                                                        </div>
                                                        <p className="font-medium truncate mt-0.5 text-slate-900 dark:text-white">
                                                            {h.ChiTietDonHang.map((ct: any) => ct.HangHoa.TenHang).join(', ')}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Cảnh báo bảo hành */}
                            {searchResult?.exists && searchResult.activeWarrantyCount > 0 && (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-green-800 dark:text-green-300 text-lg">
                                                Phát hiện {searchResult.activeWarrantyCount} mục còn bảo hành
                                            </h3>
                                            <p className="text-green-700 dark:text-green-400 text-sm mt-1 mb-2">
                                                Xe này có phụ tùng/dịch vụ vẫn còn trong thời hạn bảo hành từ các đơn hàng trước.
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        // Logic to view warranty details or auto-navigate
                                                        // For now just scroll to history
                                                        const historyEl = document.getElementById('history-section');
                                                        if (historyEl) historyEl.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    className="text-sm font-semibold text-green-700 dark:text-green-300 underline hover:text-green-800"
                                                >
                                                    Xem lịch sử bên dưới
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form đăng ký khách mới nếu KHÔNG tìm thấy */}
                            {debouncedPlate.length >= 3 && !isPending && !searchResult?.exists && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl transition-colors">
                                        <div className="flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-400">
                                            <AlertTriangle className="w-5 h-5" />
                                            <h3 className="font-semibold">Xe mới - Đăng ký</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <input
                                                    placeholder="Tên khách hàng *"
                                                    className={`w-full p-2 border rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.name ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500'}`}
                                                    value={newCustomerInfo.name}
                                                    onChange={e => setNewCustomerInfo({ ...newCustomerInfo, name: e.target.value })}
                                                />
                                                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                                            </div>
                                            <div>
                                                <input
                                                    placeholder="Số điện thoại *"
                                                    className={`w-full p-2 border rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.phone ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500'}`}
                                                    value={newCustomerInfo.phone}
                                                    onChange={e => setNewCustomerInfo({ ...newCustomerInfo, phone: e.target.value })}
                                                />
                                                {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                                            </div>
                                            <div>
                                                <input
                                                    placeholder="Nhãn hiệu (VD: Toyota) *"
                                                    className={`w-full p-2 border rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.brand ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500'}`}
                                                    value={newCarInfo.brand}
                                                    onChange={e => setNewCarInfo({ ...newCarInfo, brand: e.target.value })}
                                                />
                                                {formErrors.brand && <p className="text-xs text-red-500 mt-1">{formErrors.brand}</p>}
                                            </div>
                                            <div>
                                                <input
                                                    placeholder="Model (VD: Vios) *"
                                                    className={`w-full p-2 border rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.model ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500'}`}
                                                    value={newCarInfo.model}
                                                    onChange={e => setNewCarInfo({ ...newCarInfo, model: e.target.value })}
                                                />
                                                {formErrors.model && <p className="text-xs text-red-500 mt-1">{formErrors.model}</p>}
                                            </div>
                                            <input
                                                placeholder="Email (để gửi hóa đơn)"
                                                type="email"
                                                className="w-full p-2 border rounded bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                value={newCustomerInfo.email}
                                                onChange={e => setNewCustomerInfo({ ...newCustomerInfo, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cột phải: Form Tiếp Nhận */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Thông tin tiếp nhận</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Số ODO hiện tại (km)</label>
                                    <input
                                        type="number"
                                        value={odo}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setOdo(val === '' ? '' : Number(val));
                                        }}
                                        placeholder="0"
                                        className={`w-full p-3 bg-slate-50 dark:bg-slate-950 border rounded-lg font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.odo ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'}`}
                                    />
                                    {formErrors.odo && <p className="text-xs text-red-500 mt-1">{formErrors.odo}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex justify-between">
                                        <span>Mức xăng</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{fuel}%</span>
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <Fuel className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                                        <input
                                            type="range"
                                            min="0" max="100"
                                            value={fuel}
                                            onChange={(e) => setFuel(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <ImageCapture onImagesChange={setSelectedFiles} isUploading={isSubmitting} />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tình trạng vỏ xe</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {['Trầy xước cản trước', 'Trầy xước cản sau', 'Móp cửa trái', 'Móp cửa phải', 'Vỡ đèn'].map(status => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => handleBodyStatusToggle(status)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${bodyStatus.includes(status)
                                                ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                                    placeholder="Ghi chú thêm về trầy xước..."
                                    value={bodyStatusNote}
                                    onChange={(e) => setBodyStatusNote(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Yêu cầu từ khách hàng</label>
                                <textarea
                                    className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                                    placeholder="Ví dụ: Xe có tiếng kêu lạ khi đạp phanh, thay nhớt..."
                                    value={request}
                                    onChange={(e) => setRequest(e.target.value)}
                                ></textarea>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2 animate-in fade-in">
                                    <AlertTriangle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !plate}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${isSubmitting || !plate
                                        ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                                        : 'bg-slate-900 hover:bg-slate-800 hover:scale-[1.02]'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    Tạo phiếu tiếp nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
