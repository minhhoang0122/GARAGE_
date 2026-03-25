'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { completeJob, qcPass, qcFail } from '@/modules/service/mechanic';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';

interface CompleteJobButtonProps {
    orderId: number;
    disabled?: boolean;
    label?: string;
    className?: string;
    isQC?: boolean;
    qcAction?: 'pass' | 'fail';
}

export default function CompleteJobButton({
    orderId,
    disabled = false,
    label = "Hoàn thành đơn",
    className,
    isQC = false,
    qcAction = 'pass'
}: CompleteJobButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    const handleAction = async () => {
        setIsLoading(true);
        try {
            let result;
            if (isQC) {
                if (qcAction === 'pass') {
                    result = await qcPass(orderId);
                } else {
                    result = await qcFail(orderId);
                }
            } else {
                result = await completeJob(orderId);
            }

            if (result.success) {
                // Invalidate multiple modules
                api.invalidateCache('/mechanic/jobs');
                api.invalidateCache('/mechanic/stats');
                api.invalidateCache('/sale/stats');
                api.invalidateCache('/finance');

                showToast('success', isQC ? (qcAction === 'pass' ? 'Đã duyệt nghiệm thu!' : 'Đã từ chối nghiệm thu!') : 'Đã hoàn thành công việc!');
                setShowConfirm(false);
                router.replace('/mechanic/jobs');
                router.refresh();
            } else {
                showToast('error', result.error || 'Thao tác thất bại');
            }
        } catch (error) {
            showToast('error', 'Lỗi kết nối đến máy chủ');
        } finally {
            setIsLoading(false);
        }
    };

    if (disabled) {
        return (
            <button
                disabled
                className={`flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-500 rounded-lg font-medium cursor-not-allowed ${className || ''}`}
            >
                <CheckCircle className="w-4 h-4" /> {label}
            </button>
        );
    }

    const getIcon = () => {
        if (!isQC) return <CheckCircle className="w-4 h-4" />;
        return qcAction === 'pass' ? <ShieldCheck className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
    };

    const getConfirmMessage = () => {
        if (isQC) {
            if (qcAction === 'pass') {
                return (
                    <p className="text-slate-600 mb-6">
                        Xác nhận <strong>DUYỆT NGHIỆM THU</strong> xe này?
                        <br />• Trạng thái xe sẽ chuyển sang <span className="text-emerald-600 font-medium">"Chờ thanh toán"</span>.
                        <br />• Khách hàng sẽ được thông báo đến nhận xe.
                    </p>
                );
            } else {
                return (
                    <p className="text-slate-600 mb-6">
                        Xác nhận <strong>TỪ CHỐI</strong> nghiệm thu?
                        <br />• Trạng thái xe sẽ quay về <span className="text-blue-600 font-medium">"Đang sửa"</span>.
                        <br />• Thợ sửa chữa sẽ nhận được thông báo kiểm tra lại.
                    </p>
                );
            }
        }
        return (
            <p className="text-slate-600 mb-6">
                Chuyển xe sang bước <strong>NGHIỆM THU (QC)</strong>?
                <br />• Trạng thái xe sẽ chuyển sang <span className="text-amber-600 font-medium">"Chờ KCS"</span>.
                <br />• Thợ chẩn đoán sẽ kiểm tra lại chất lượng trước khi giao khách.
            </p>
        );
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className={`flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm ${className || ''}`}
            >
                {getIcon()} {label}
            </button>

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300">
                    <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] p-10 max-w-md w-full mx-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white ring-1 ring-slate-200/50">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${
                            isQC && qcAction === 'fail' 
                            ? 'bg-red-50 text-red-600 shadow-red-100' 
                            : 'bg-emerald-50 text-emerald-600 shadow-emerald-100'
                        }`}>
                            {isQC ? (qcAction === 'pass' ? <ShieldCheck size={32} /> : <XCircle size={32} />) : <CheckCircle size={32} />}
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                            {isQC ? (qcAction === 'pass' ? 'Duyệt Nghiệm Thu' : 'Từ Chối Nghiệm Thu') : 'Hoàn thành sửa chữa'}
                        </h3>

                        <div className="text-sm font-medium leading-relaxed text-slate-500 mb-8 border-l-2 border-slate-100 pl-4 py-1">
                            {getConfirmMessage()}
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleAction}
                                disabled={isLoading}
                                className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
                                    isQC && qcAction === 'fail'
                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> 
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        {getIcon()} Xác nhận thao tác
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isLoading}
                                className="w-full py-4 text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest transition-colors"
                            >
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
