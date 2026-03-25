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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { receptionSchema, ReceptionSchema } from '@/lib/schemas';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ReceptionPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const { register, handleSubmit: handleFormSubmit, setValue, watch, formState: { errors: zodErrors } } = useForm<ReceptionSchema>({
        resolver: zodResolver(receptionSchema),
        defaultValues: {
            vehicleType: 'CAR',
            odo: 0,
            fuel: 50,
            bodyStatus: 'Nguyên vẹn',
            bienSo: ''
        }
    });

    const vehicleType = watch('vehicleType');
    const plate = watch('bienSo');
    const odo = watch('odo');
    const fuel = watch('fuel');

    const [segments, setSegments] = useState({ s1: '', s2: '', s3: '' });
    const debouncedPlate = useDebounce(plate, 500);

    const [bodyStatus, setBodyStatus] = useState<string[]>([]);
    const [bodyStatusNote, setBodyStatusNote] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState('');

    const handleBodyStatusToggle = (status: string) => {
        setBodyStatus(prev => {
            const next = prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status];
            
            // Sync to form bodyStatus string
            let text = next.join(', ');
            if (bodyStatusNote) {
                text = text ? `${text}. Ghi chú: ${bodyStatusNote}` : bodyStatusNote;
            }
            setValue('bodyStatus', text || 'Nguyên vẹn');
            return next;
        });
    };

    // Update form when note changes
    useEffect(() => {
        let text = bodyStatus.join(', ');
        if (bodyStatusNote) {
            text = text ? `${text}. Ghi chú: ${bodyStatusNote}` : bodyStatusNote;
        }
        setValue('bodyStatus', text || 'Nguyên vẹn');
    }, [bodyStatusNote, bodyStatus, setValue]);

    const { data: session } = useSession();
    // @ts-ignore
    const token = session?.user?.accessToken;

    // Sync segments to plate string
    useEffect(() => {
        let formatted = '';
        if (vehicleType === 'CAR') {
            if (segments.s1 && segments.s2) {
                const s2Formatted = segments.s2.length === 5
                    ? `${segments.s2.slice(0, 3)}.${segments.s2.slice(3)}`
                    : segments.s2;
                formatted = `${segments.s1}-${s2Formatted}`;
            } else {
                formatted = segments.s1 + (segments.s2 ? '-' + segments.s2 : '');
            }
        } else {
            if (segments.s1 && segments.s2 && segments.s3) {
                const s3Formatted = segments.s3.length === 5
                    ? `${segments.s3.slice(0, 3)}.${segments.s3.slice(3)}`
                    : segments.s3;
                formatted = `${segments.s1}-${segments.s2} ${s3Formatted}`;
            } else {
                formatted = [segments.s1, segments.s2, segments.s3].filter(Boolean).join('-');
            }
        }
        formatted = formatted.replace(/[-.\s]*$/, '').toUpperCase();
        setValue('bienSo', formatted);
    }, [segments, vehicleType, setValue]);

    const { data: searchResult = null, isFetching: isSearching } = useQuery({
        queryKey: ['sale', 'search', debouncedPlate],
        queryFn: async () => {
            if (debouncedPlate.length < 3) return null;
            const res = await searchVehicle(debouncedPlate);
            if (res.exists && res.vehicle) {
                setValue('odo', res.vehicle.ODO_HienTai);
                setValue('nhanHieu', res.vehicle.NhanHieu);
                setValue('model', res.vehicle.Model);
                setValue('tenKhach', res.customer.HoTen);
                setValue('sdtKhach', res.customer.SoDienThoai);
            }
            return res;
        },
        enabled: debouncedPlate.length >= 3 && !!token,
        staleTime: 60000
    });

    const createMutation = useMutation({
        mutationFn: async (payload: any) => {
            const result = await createReception(payload);
            if (!result.success) throw new Error(result.error);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sale'] });
            queryClient.invalidateQueries({ queryKey: ['reception'] });
            queryClient.invalidateQueries({ queryKey: ['mechanic'] });
            queryClient.invalidateQueries({ queryKey: ['warehouse'] });
            showToast('success', 'Đã tiếp nhận xe thành công!');
            router.replace('/sale');
            router.refresh();
        },
        onError: (error: any) => {
            setError(error.message || 'Có lỗi xảy ra');
            showToast('error', error.message || 'Có lỗi xảy ra khi tạo phiếu tiếp nhận');
        }
    });

    const onSubmit = async (data: ReceptionSchema) => {
        if (createMutation.isPending) return;
        
        // Additional business logic validation
        if (searchResult?.vehicle && data.odo < searchResult.vehicle.ODO_HienTai) {
            setError(`ODO mới (${data.odo}) không thể nhỏ hơn ODO cũ (${searchResult.vehicle.ODO_HienTai})`);
            return;
        }

        setError('');
        let bodyStatusText = bodyStatus.join(', ');
        if (bodyStatusNote) {
            bodyStatusText = bodyStatusText ? `${bodyStatusText}. Ghi chú: ${bodyStatusNote}` : bodyStatusNote;
        }
        if (!bodyStatusText) bodyStatusText = 'Nguyên vẹn';

        try {
            let finalImageUrl = '';
            if (selectedFiles.length > 0 && token) {
                const uploadPromises = selectedFiles.map(file => {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('folder', 'receptions');
                    return api.upload('/images/upload', formData, token);
                });
                const uploadResults = await Promise.all(uploadPromises);
                finalImageUrl = uploadResults.map(res => res.url).join(',');
            }

            createMutation.mutate({
                ...data,
                tinhTrangVo: bodyStatusText,
                hinhAnh: finalImageUrl,
                mucXang: data.fuel / 100,
            });
        } catch (e) {
            setError('Lỗi kết nối');
            showToast('error', 'Lỗi kết nối đến máy chủ');
        }
    };

    const isSearchingActive = isSearching;
    const isSubmitting = createMutation.isPending;

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
                                        setValue('vehicleType', 'CAR');
                                        setSegments({ s1: '', s2: '', s3: '' });
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
                                        setValue('vehicleType', 'MOTO');
                                        setSegments({ s1: '', s2: '', s3: '' });
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
                                                        const chars = val.split('');
                                                        const newChars: string[] = [];
                                                        for (let i = 0; i < chars.length; i++) {
                                                            const c = chars[i];
                                                            if (i < 2) {
                                                                if (/[0-9]/.test(c)) newChars.push(c);
                                                            } else if (i === 2) {
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
                                            </div>
                                        </>
                                    )}

                                    {isSearchingActive && (
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
                                {zodErrors.bienSo && <p className="text-xs text-red-500 mt-1">{zodErrors.bienSo.message}</p>}
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
                            {debouncedPlate.length >= 3 && !isSearchingActive && !searchResult?.exists && (
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
                                                    className={`w-full p-2 border rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${zodErrors.tenKhach ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500'}`}
                                                    {...register('tenKhach')}
                                                />
                                                {zodErrors.tenKhach && <p className="text-xs text-red-500 mt-1">{zodErrors.tenKhach.message}</p>}
                                            </div>
                                            <div>
                                                <input
                                                    placeholder="Số điện thoại *"
                                                    className={`w-full p-2 border rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${zodErrors.sdtKhach ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500'}`}
                                                    {...register('sdtKhach')}
                                                />
                                                {zodErrors.sdtKhach && <p className="text-xs text-red-500 mt-1">{zodErrors.sdtKhach.message}</p>}
                                            </div>
                                            <div>
                                                <input
                                                    placeholder="Nhãn hiệu (VD: Toyota) *"
                                                    className={`w-full p-2 border rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${zodErrors.nhanHieu ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500'}`}
                                                    {...register('nhanHieu')}
                                                />
                                                {zodErrors.nhanHieu && <p className="text-xs text-red-500 mt-1">{zodErrors.nhanHieu.message}</p>}
                                            </div>
                                            <div>
                                                <input
                                                    placeholder="Model (VD: Vios) *"
                                                    className={`w-full p-2 border rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${zodErrors.model ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500'}`}
                                                    {...register('model')}
                                                />
                                                {zodErrors.model && <p className="text-xs text-red-500 mt-1">{zodErrors.model.message}</p>}
                                            </div>
                                            <input
                                                placeholder="Email (để gửi hóa đơn)"
                                                type="email"
                                                className={`w-full p-2 border rounded bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${zodErrors.emailKhach ? 'border-red-500' : ''}`}
                                                {...register('emailKhach')}
                                            />
                                            {zodErrors.emailKhach && <p className="text-xs text-red-500 mt-1">{zodErrors.emailKhach.message}</p>}
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
                                        placeholder="0"
                                        className={`w-full p-3 bg-slate-50 dark:bg-slate-950 border rounded-lg font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${zodErrors.odo ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'}`}
                                        {...register('odo', { valueAsNumber: true })}
                                    />
                                    {zodErrors.odo && <p className="text-xs text-red-500 mt-1">{zodErrors.odo.message}</p>}
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
                                            onChange={(e) => setValue('fuel', Number(e.target.value))}
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
                                    {...register('request')}
                                ></textarea>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2 animate-in fade-in">
                                    <AlertTriangle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleFormSubmit(onSubmit)(e);
                                    }}
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
