'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { completeJob, qcPass, qcFail } from '@/modules/service/mechanic';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                            {isQC ? (qcAction === 'pass' ? 'Duyệt Nghiệm Thu' : 'Từ Chối Nghiệm Thu') : 'Hoàn thành sửa chữa'}
                        </h3>

                        {getConfirmMessage()}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isLoading}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAction}
                                disabled={isLoading}
                                className={`px-4 py-2 text-white rounded-lg font-medium flex items-center gap-2 ${isQC && qcAction === 'fail'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        {getIcon()} Xác nhận
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
