'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useCreateReception, useSearchVehicle } from '@/modules/reception/hooks/useReception';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Car, User, History, Save, ArrowLeft, Fuel, AlertTriangle, CheckCircle2, Phone, MapPin, Mail, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import ImageCapture from '@/modules/shared/components/common/ImageCapture';
import { useToast } from '@/contexts/ToastContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { receptionSchema, ReceptionSchema } from '@/lib/schemas';
import { LicensePlateInput } from '@/modules/reception/components/LicensePlateInput';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

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
    const fuel = watch('fuel');
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
            return next;
        });
    };

    useEffect(() => {
        let text = bodyStatus.join(', ');
        if (bodyStatusNote) {
            text = text ? `${text}. Ghi chú: ${bodyStatusNote}` : bodyStatusNote;
        }
        setValue('bodyStatus', text || 'Nguyên vẹn');
    }, [bodyStatusNote, bodyStatus, setValue]);

    const { data: searchResult = null, isFetching: isSearching } = useSearchVehicle(debouncedPlate);

    useEffect(() => {
        if (searchResult?.exists) {
            if (searchResult.odo !== undefined) setValue('odo', searchResult.odo);
            if (searchResult.brand) setValue('nhanHieu', searchResult.brand);
            if (searchResult.model) setValue('model', searchResult.model);
            if (searchResult.customerName) setValue('tenKhach', searchResult.customerName);
            if (searchResult.customerPhone) setValue('sdtKhach', searchResult.customerPhone);
            if (searchResult.customerAddress) setValue('diaChiKhach', searchResult.customerAddress);
            if (searchResult.customerEmail) setValue('emailKhach', searchResult.customerEmail);
            if (searchResult.soKhung) setValue('soKhung', searchResult.soKhung);
            if (searchResult.soMay) setValue('soMay', searchResult.soMay);
        }
    }, [searchResult, setValue]);

    const createMutation = useCreateReception();

    const onSubmit = async (data: ReceptionSchema) => {
        if (createMutation.isPending) return;
        
        if (searchResult?.exists && data.odo < (searchResult.odo || 0)) {
            setError(`ODO mới (${data.odo}) không thể nhỏ hơn ODO cũ (${searchResult.odo || 0})`);
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
            if (selectedFiles.length > 0) {
                const uploadPromises = selectedFiles.map(file => {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('folder', 'receptions');
                    return api.upload('/images/upload', formData);
                });
                const uploadResults = await Promise.all(uploadPromises);
                finalImageUrl = uploadResults.map((res: any) => res.url).join(',');
            }

            const payload = {
                bienSo: data.bienSo,
                odo: Number(data.odo),
                nhanHieu: data.nhanHieu || searchResult?.brand || '',
                model: data.model || searchResult?.model || '',
                soKhung: data.soKhung || searchResult?.soKhung || '',
                soMay: data.soMay || searchResult?.soMay || '',
                tenKhach: data.tenKhach || searchResult?.customerName || '',
                sdtKhach: (data.sdtKhach || searchResult?.customerPhone || '').replace(/[\s.-]/g, ''),
                diaChiKhach: data.diaChiKhach || searchResult?.customerAddress || '',
                emailKhach: data.emailKhach || searchResult?.customerEmail || '',
                mucXang: (fuel || 0) / 100,
                tinhTrangVo: bodyStatusText || 'Nguyên vẹn',
                yeuCauKhach: data.request || '',
                hinhAnh: finalImageUrl || null
            };

            createMutation.mutate(payload, {
                onSuccess: () => {
                    showToast('success', 'Tạo phiếu tiếp nhận thành công');
                    router.push('/sale/reception');
                },
                onError: (err: any) => {
                    const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Lỗi không xác định từ máy chủ';
                    setError(`Lỗi: ${errorMsg}`);
                    showToast('error', `Không thể tạo phiếu: ${errorMsg}`);
                }
            });
        } catch (e) {
            setError('Lỗi kết nối hoặc xử lý ảnh');
            showToast('error', 'Lỗi xử lý yêu cầu');
        }
    };

    const isSearchingActive = isSearching;
    const isSubmitting = createMutation.isPending;

    return (
        <DashboardLayout title="Tiếp nhận phương tiện" subtitle="Ghi nhận thông tin xe và tình trạng thực tế">
            <div className="max-w-7xl mx-auto px-6 py-6 font-sans">
                {/* 1. Header Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/sale/reception" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Quay lại danh sách</span>
                    </Link>
                </div>

                <form onSubmit={handleFormSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: Main Form Body */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* A. Identity Section */}
                        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wider">Thông tin Phương tiện & Khách hàng</h2>
                            </div>
                            
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Vehicle ID */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-3 tracking-tight">Loại phương tiện</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => { setValue('vehicleType', 'CAR'); setValue('bienSo', ''); }}
                                                    className={cn(
                                                        "flex items-center justify-center gap-2 py-2.5 rounded-lg border font-bold text-xs transition-all",
                                                        vehicleType === 'CAR'
                                                            ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-50 dark:text-slate-900"
                                                            : "bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700"
                                                    )}
                                                >
                                                    <Car className="w-4 h-4" />
                                                    <span>Ô TÔ</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setValue('vehicleType', 'MOTO'); setValue('bienSo', ''); }}
                                                    className={cn(
                                                        "flex items-center justify-center gap-2 py-2.5 rounded-lg border font-bold text-xs transition-all",
                                                        vehicleType === 'MOTO'
                                                            ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-50 dark:text-slate-900"
                                                            : "bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700"
                                                    )}
                                                >
                                                    <div className="w-4 h-4 flex items-center justify-center font-bold">M</div>
                                                    <span>XE MÁY</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-3 tracking-tight">Biển số (Số hiệu định danh)</label>
                                            <div className="relative">
                                                <LicensePlateInput
                                                    type={vehicleType}
                                                    value={plate}
                                                    onChange={(val) => setValue('bienSo', val)}
                                                    error={zodErrors.bienSo?.message}
                                                />
                                                {isSearchingActive && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Customer View / Alert */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 border border-slate-100 dark:border-slate-700/50 flex flex-col justify-center">
                                        {searchResult?.exists ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Khách hàng cũ</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 mb-1">Chủ xe</p>
                                                    <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{searchResult.customerName}</p>
                                                    <p className="text-sm font-mono font-bold text-slate-600 dark:text-slate-400">{searchResult.customerPhone}</p>
                                                </div>
                                                <Link 
                                                    href={`/sale/reception?search=${plate}`}
                                                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                                                >
                                                    <History className="w-3.5 h-3.5" />
                                                    Lịch sử dịch vụ
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <User className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                                <p className="text-xs text-slate-400 px-4">Thông tin khách hàng sẽ tự động tải sau khi nhập biển số hợp lệ</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Detailed Fields */}
                                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-4 tracking-wider">Thông tin Chủ xe</h3>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                                <User className="w-3 h-3" /> Họ tên khách hàng
                                            </label>
                                            <input {...register('tenKhach')} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white" placeholder="Nguyễn Văn A" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> Số điện thoại
                                            </label>
                                            <input {...register('sdtKhach')} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono font-bold text-slate-900 dark:text-white" placeholder="090..." />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> Địa chỉ
                                            </label>
                                            <input {...register('diaChiKhach')} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white" placeholder="Phố..., Quận..." />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-4 tracking-wider">Thông tin Kỹ thuật xe</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-500">Hãng / Hiệu</label>
                                                <input {...register('nhanHieu')} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white" placeholder="VD: Toyota" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-500">Dòng xe (Model)</label>
                                                <input {...register('model')} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white" placeholder="VD: Vios" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 italic">Số Khung (VIN)</label>
                                            <input {...register('soKhung')} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono font-bold text-slate-900 dark:text-white" placeholder="..." />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 italic">Số Máy</label>
                                            <input {...register('soMay')} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono font-bold text-slate-900 dark:text-white" placeholder="..." />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* B. Inspection Section */}
                        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wider">Khảo sát tình trạng & Yêu cầu</h2>
                            </div>
                            
                            <div className="p-6 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* ODO & Fuel */}
                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-3">Chỉ số ODO hiện tại (km)</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    {...register('odo', { valueAsNumber: true })} 
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-3xl font-mono font-bold text-slate-900 dark:text-white"
                                                />
                                                <History className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            </div>
                                            {searchResult?.exists && (
                                                <p className="mt-2 text-[10px] font-bold text-slate-500 uppercase">Mốc gần nhất: <span className="text-slate-900 dark:text-slate-200 font-mono">{searchResult.odo?.toLocaleString()} km</span></p>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-xs font-bold text-slate-500">Mức nhiên liệu hiện tại</label>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{fuel}%</span>
                                            </div>
                                            <div className="px-2 py-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <input 
                                                    type="range" 
                                                    min="0" max="100" step="5"
                                                    {...register('fuel', { valueAsNumber: true })}
                                                    value={fuel}
                                                    onChange={(e) => setValue('fuel', Number(e.target.value))}
                                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-slate-100"
                                                />
                                                <div className="flex justify-between mt-2 px-1">
                                                    <span className="text-[10px] font-bold text-slate-400">E</span>
                                                    <span className="text-[10px] font-bold text-slate-400">1/2</span>
                                                    <span className="text-[10px] font-bold text-slate-400">F</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body Status */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-4 tracking-tight">Kiểm tra ngoại quan (Vỏ / Thân xe)</label>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {['Trầy xước', 'Móp méo', 'Bể vỡ', 'Nứt kính', 'Thiếu chi tiết', 'Dơ / Bẩn'].map(status => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => handleBodyStatusToggle(status)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-md border text-[11px] font-bold transition-all",
                                                        bodyStatus.includes(status)
                                                            ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900"
                                                            : "bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700"
                                                    )}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea 
                                            value={bodyStatusNote}
                                            onChange={(e) => setBodyStatusNote(e.target.value)}
                                            placeholder="Ghi chú thêm về ngoại quan..."
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white min-h-[100px]"
                                        />
                                    </div>
                                </div>

                                {/* Customer Request */}
                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-3">Yêu cầu cụ thể của khách hàng</label>
                                    <textarea 
                                        {...register('request')}
                                        placeholder="Nhập chi tiết yêu cầu sửa chữa, bảo dưỡng hoặc các vấn đề xe đang gặp phải..."
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white min-h-[120px] focus:ring-2 ring-slate-900/5 transition-all"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* C. Images Capture */}
                        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Hình ảnh hiện trạng</h2>
                                <span className="text-[10px] font-bold text-slate-400">Tối đa 4 ảnh</span>
                            </div>
                            <div className="p-6">
                                <ImageCapture 
                                    onImagesChange={setSelectedFiles} 
                                    maxImages={4}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: Summary & Actions (4/12) */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
                        
                        {/* Status Bar */}
                        <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-5 text-white">
                            <h3 className="text-[10px] font-bold text-slate-400 tracking-widest mb-4">Trạng thái định danh</h3>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500",
                                    plate.length > 5 ? "bg-emerald-500" : "bg-slate-700"
                                )}>
                                    <Car className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-mono font-bold">{plate || 'CHỜ BIỂN SỐ'}</p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase">{searchResult?.exists ? 'Phương tiện đã đăng ký' : 'Phương tiện mới'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Validations & Error */}
                        {(error || Object.keys(zodErrors).length > 0) && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-red-600 uppercase mb-2">Cảnh báo dữ liệu</p>
                                        <ul className="space-y-1 list-disc list-inside">
                                            {error && <li className="text-xs font-medium text-red-700 dark:text-red-400">{error}</li>}
                                            {Object.entries(zodErrors).map(([key, err]) => (
                                                <li key={key} className="text-xs font-medium text-red-700 dark:text-red-400">
                                                    {err?.message as string}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="space-y-3 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || plate.length < 3}
                                className={cn(
                                    "w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm tracking-wider transition-all shadow-lg active:scale-95",
                                    isSubmitting || plate.length < 3
                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                <span>Xác nhận Tiếp nhận</span>
                            </button>
                            <p className="text-[10px] text-center text-slate-400 font-medium px-6 tracking-tight">Nhân viên xác nhận thông tin thực tế khớp với dữ liệu phiếu</p>
                        </div>

                        {/* Helper Info */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-4 tracking-wider">Hỗ trợ nghiệp vụ</h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded">
                                        <History className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Báo giá và Lệnh sửa chữa sẽ được tự động kích hoạt sau bước này.</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded">
                                        <Camera className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Khuyến khích chụp ảnh ODO và 4 góc xe để làm bằng chứng pháp lý khi bàn giao.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
