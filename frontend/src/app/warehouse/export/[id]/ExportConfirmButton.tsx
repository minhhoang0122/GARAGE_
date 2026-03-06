'use client';

import { useState } from 'react';
import { PackageCheck, Loader2 } from 'lucide-react';
import { confirmExport } from '@/modules/inventory/warehouse';
import { useRouter } from 'next/navigation';

interface ExportConfirmButtonProps {
    orderId: number;
    disabled?: boolean;
}

export default function ExportConfirmButton({ orderId, disabled = false }: ExportConfirmButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            const result = await confirmExport(orderId);
            if (result.success) {
                setShowConfirm(false);
                router.refresh();
            } else {
                alert('Lỗi: ' + result.error);
            }
        } catch (error) {
            alert('Lỗi hệ thống');
        } finally {
            setIsLoading(false);
        }
    };

    if (disabled) {
        return (
            <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-500 rounded-lg font-medium cursor-not-allowed"
            >
                <PackageCheck className="w-4 h-4" /> Đã xuất kho
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium shadow-sm"
            >
                <PackageCheck className="w-4 h-4" /> Xác nhận xuất kho
            </button>

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Xác nhận xuất kho?</h3>
                        <p className="text-slate-600 mb-6">
                            Sau khi xác nhận:
                            <br />• Hệ thống sẽ <strong>trừ tồn kho</strong> cho các vật tư trong danh sách
                            <br />• Đơn hàng sẽ chuyển sang trạng thái <span className="text-indigo-600 font-medium">"Đang sửa"</span>
                            <br />• Thợ sẽ nhận được thông báo để tiến hành sửa chữa
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isLoading}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <PackageCheck className="w-4 h-4" /> Xác nhận
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
