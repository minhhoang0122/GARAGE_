'use client';

import { useState } from 'react';
import { UserMinus, Loader2, AlertTriangle } from 'lucide-react';
import { useUnclaimJob } from '@/modules/mechanic/hooks/useMechanic';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

interface UnclaimJobButtonProps {
    orderId: number;
    completedItems: number;
}

export default function UnclaimJobButton({ orderId, completedItems }: UnclaimJobButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();
    const { mutate: unclaimMatch, isPending: isLoading } = useUnclaimJob();

    const handleUnclaim = () => {
        unclaimMatch(orderId, {
            onSuccess: () => {
                showToast('success', 'Đã hủy nhận việc thành công!');
                setShowConfirm(false);
            },
            onError: (error: any) => {
                showToast('error', error.message || 'Thao tác thất bại');
            }
        });
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                title="Hủy nhận việc này"
            >
                <UserMinus className="w-4 h-4" /> Hủy nhận
            </button>

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Hủy nhận việc này?</h3>
                        </div>

                        <div className="text-slate-600 mb-6 text-sm">
                            <p className="mb-2">Bạn sẽ không còn phụ trách đơn hàng này nữa.</p>
                            {completedItems > 0 && (
                                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-left">
                                    <p className="font-semibold text-amber-800 text-xs uppercase mb-1">Lưu ý quan trọng</p>
                                    <p className="text-amber-700">
                                        Bạn đã hoàn thành <span className="font-bold">{completedItems}</span> hạng mục.
                                        Việc hủy nhận sẽ chuyển đơn hàng cho thợ khác tiếp tục làm.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isLoading}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleUnclaim}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Đang hủy...
                                    </>
                                ) : (
                                    <>
                                        Xác nhận hủy
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
