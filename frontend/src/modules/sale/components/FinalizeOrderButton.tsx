'use client';

import { useState } from 'react';
import { FileCheck, Loader2 } from 'lucide-react';
import { useFinalizeOrder } from '@/modules/sale/hooks/useSale';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

interface FinalizeOrderButtonProps {
    orderId: number;
    disabled?: boolean;
    hasItems: boolean;
}

export default function FinalizeOrderButton({ orderId, disabled = false, hasItems }: FinalizeOrderButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();
    const { mutate: finalizeMatch, isPending: isLoading } = useFinalizeOrder();

    const handleConfirm = async () => {
        finalizeMatch(orderId, {
            onSuccess: () => {
                showToast('success', 'Đã chốt báo giá thành công!');
                setShowConfirm(false);
            },
            onError: (error: any) => {
                showToast('error', error.message || 'Thao tác thất bại');
            }
        });
    };

    if (disabled) {
        return (
            <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg font-medium cursor-not-allowed"
            >
                <FileCheck className="w-4 h-4" /> Đã chốt
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => {
                    if (!hasItems) {
                        showToast('warning', 'Chưa có hạng mục nào trong báo giá. Vui lòng thêm phụ tùng/dịch vụ trước khi chốt.');
                        return;
                    }
                    setShowConfirm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium shadow-sm transition-colors"
            >
                <FileCheck className="w-4 h-4" /> Chốt báo giá
            </button>

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Xác nhận chốt báo giá?</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            Sau khi chốt, báo giá sẽ được <strong>khóa lại</strong> và chuyển sang trạng thái <span className="text-indigo-600 dark:text-indigo-400 font-medium">"Chờ sửa chữa"</span>.
                            <br /><br />
                            Hành động này <strong>không thể hoàn tác</strong>. Bạn có chắc chắn?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isLoading}
                                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium flex items-center gap-2 transition-colors"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <FileCheck className="w-4 h-4" /> Xác nhận chốt
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

