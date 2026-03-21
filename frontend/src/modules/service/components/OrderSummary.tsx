'use client';

import { formatCurrency } from '@/lib/utils';
import { FileText, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { updateOrderTotals } from '@/modules/service/order';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { usePermission } from '@/hooks/usePermission';
import { useOrderWorkspaceOptional } from './OrderWorkspaceProvider';

interface OrderSummaryProps {
    orderId: number;
    totalParts: number;
    totalLabor: number;
    totalDiscount: number; // Applied discount amount
    vat: number; // Applied VAT amount
    vatPercent: number; // VAT percentage
    grandTotal: number;
    isLocked: boolean;
}

/**
 * OrderSummary Component - Global Financial Controls
 * Manages invoice-level discount and VAT percentage.
 */
export default function OrderSummary({
    orderId,
    totalParts: serverTotalParts,
    totalLabor: serverTotalLabor,
    totalDiscount: serverTotalDiscount,
    vat: serverVat,
    vatPercent: serverVatPercent,
    grandTotal: serverGrandTotal,
    isLocked
}: OrderSummaryProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const { hasRole, isAdmin } = usePermission();
    const workspace = useOrderWorkspaceOptional();
    
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const canEditVat = isAdmin || !hasRole('SALE');

    const totalParts = serverTotalParts;
    const totalLabor = serverTotalLabor;
    const totalDiscount = serverTotalDiscount;
    const vat = serverVat;
    const vatPercent = serverVatPercent;
    const grandTotal = serverGrandTotal;

    const isCalculating = workspace?.isCalculating || false;

    // Using simple state for editing
    const [editData, setEditData] = useState({
        discount: totalDiscount,
        vatPercent: vatPercent
    });

    // Local state for formatted VND display (with dots)
    const [displayDiscount, setDisplayDiscount] = useState(totalDiscount.toLocaleString('vi-VN'));

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const apiCall = async () => {
                const res = await updateOrderTotals(orderId, {
                    discount: editData.discount,
                    vatPercent: editData.vatPercent
                });
                if (res.success) {
                    showToast('success', 'Đã cập nhật tổng hợp báo giá');
                    setIsEditing(false);
                } else {
                    showToast('error', res.error || 'Lỗi khi cập nhật');
                }
            };

            if (workspace) {
                // startCalculation đã có sẵn router.refresh
                await workspace.startCalculation(apiCall);
            } else {
                await apiCall();
                router.refresh(); // Fallback nếu không có workspace
            }
        } catch (error) {
            showToast('error', 'Lỗi hệ thống');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditData({
            discount: totalDiscount,
            vatPercent: vatPercent
        });
        setDisplayDiscount(totalDiscount.toLocaleString('vi-VN'));
        setIsEditing(false);
    };

    const handleDiscountChange = (val: string) => {
        // Remove all non-digits
        const raw = val.replace(/\D/g, '');
        const num = raw === '' ? 0 : parseInt(raw, 10);
        
        // Update raw value for saving
        setEditData(prev => ({ ...prev, discount: num }));
        
        // Update display value with dots
        setDisplayDiscount(num.toLocaleString('vi-VN'));
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/50 transition-all relative overflow-hidden text-[13px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-2xl rounded-full -mr-16 -mt-16"></div>
            
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100 dark:border-slate-800 relative z-10">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
                    Tổng cộng
                    <FileText className="w-5 h-5 text-slate-400" />
                </h3>
                {!isLocked && (
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-200 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                    Lưu
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all"
                                >
                                    Hủy
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setDisplayDiscount(totalDiscount.toLocaleString('vi-VN'));
                                }}
                                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                            >
                                Chỉnh sửa
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className={`space-y-4 font-medium relative z-10 ${isCalculating ? 'opacity-50 blur-[2px] pointer-events-none transition-all duration-300' : 'transition-all duration-300'}`}>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Tiền hàng:</span>
                    <span className="text-slate-900 dark:text-slate-200 tabular-nums font-bold">{formatCurrency(totalParts)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Tiền công:</span>
                    <span className="text-slate-900 dark:text-slate-200 tabular-nums font-bold">{formatCurrency(totalLabor)}</span>
                </div>
                {/* Chiết khấu tổng */}
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span>Chiết khấu tổng:</span>
                    {isEditing ? (
                        <div className="relative w-40">
                            <input
                                type="text"
                                value={displayDiscount}
                                onChange={(e) => handleDiscountChange(e.target.value)}
                                className="w-full h-9 pl-2 pr-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-right text-rose-600 font-black focus:border-blue-500 outline-none transition-all tabular-nums text-sm"
                                placeholder="0"
                            />
                            <span className="absolute right-2 top-2 text-[11px] font-bold text-slate-400">đ</span>
                        </div>
                    ) : (
                        <span className="text-rose-500 font-bold px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg tabular-nums">-{formatCurrency(totalDiscount)}</span>
                    )}
                </div>

                {/* Thuế VAT - Chỉ hiện nếu có phần trăm thuế hoặc đang chỉnh sửa */}
                {(isEditing || vatPercent > 0) && (
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-50 dark:border-slate-800">
                        <span className="flex items-center gap-1">Thuế VAT:</span>
                        {isEditing ? (
                            <div className="relative w-24">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    disabled={!canEditVat}
                                    value={editData.vatPercent}
                                    onChange={(e) => setEditData(prev => ({ ...prev, vatPercent: Number(e.target.value) }))}
                                    className={`w-full h-9 pl-2 pr-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-right font-bold focus:border-blue-500 outline-none transition-all tabular-nums text-sm ${!canEditVat ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'text-slate-900 dark:text-slate-100'}`}
                                />
                                <span className="absolute right-2 top-2 text-[10px] text-slate-400">%</span>
                                {!canEditVat && (
                                    <div className="absolute -top-8 right-0 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                        Chỉ Admin mới được chỉnh
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-end">
                                <span className="text-slate-900 dark:text-slate-200 tabular-nums font-bold">{formatCurrency(vat)}</span>
                                <span className="text-[10px] text-slate-400">({vatPercent}%)</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Thành tiền */}
                <div className="flex justify-between items-center text-xl font-black text-slate-900 dark:text-white pt-4 border-t-2 border-blue-50 dark:border-blue-900/30">
                    <span>Thành tiền:</span>
                    <span className="text-slate-900 dark:text-white text-2xl tracking-tighter tabular-nums">{formatCurrency(grandTotal)}</span>
                </div>
            </div>

            {isEditing && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl text-[10px] text-blue-600 dark:text-blue-400 italic">
                    * Nhập số tiền chiết khấu và % thuế suất. Hệ thống sẽ áp dụng cho toàn bộ hóa đơn.
                </div>
            )}
        </div>
    );
}
