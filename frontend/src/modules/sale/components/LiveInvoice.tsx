'use client';

import { formatCurrency } from '@/lib/utils';
import {
    Printer,
    CheckCircle2,
    CreditCard,
    Banknote,
    Share2,
    ChevronRight,
    User,
    Phone,
    Gauge,
    QrCode,
    FileText,
    Loader2,
    Info,
    ShieldCheck,
    CarFront,
    RotateCcw,
    Trash2,
    Warehouse
} from 'lucide-react';
import { Badge } from '@/modules/shared/components/ui/badge';
import { Button } from '@/modules/shared/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/modules/shared/components/ui/dialog';
import { Input } from '@/modules/shared/components/ui/input';
import { Label } from '@/modules/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/modules/shared/components/ui/radio-group';
import { useState, useEffect } from 'react';
import { FinancialTransaction, saleService } from '../services/sale';
import { useRealtime } from '@/modules/common/contexts/RealtimeContext';

interface LiveInvoiceProps {
    order: {
        id: number;
        plate: string;
        customerName: string;
        phone: string;
        odo: number;
        items: {
            id: number;
            productId: number;
            productName: string;
            productCode: string;
            quantity: number;
            unitPrice: number;
            discountAmount: number;
            vatPercentage: number;
            vatAmount: number;
            total: number;
            isService: boolean;
            version: number;
            oldPartAction?: string;
            warrantyMonths?: number;
        }[];
        totalParts: number;
        totalLabor: number;
        totalDiscount: number;
        vat: number;
        vatPercent: number;
        grandTotal: number;
        amountPaid: number;
        status: string;
        uuid: string;
        createdAt?: string;
        transactions?: FinancialTransaction[];
    };
    onConfirmPayment: () => void;
    onRefresh?: () => void;
    isProcessing: boolean;
}

export default function LiveInvoice({ order, onConfirmPayment, onRefresh, isProcessing }: LiveInvoiceProps) {
    const [isTxDialogOpen, setIsTxDialogOpen] = useState(false);
    const [txAmount, setTxAmount] = useState<string>('');
    const [txMethod, setTxMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
    const [txNote, setTxNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPaidSuccess, setIsPaidSuccess] = useState(false);
    const [isQrZoomOpen, setIsQrZoomOpen] = useState(false);
    const [isTrackingQrOpen, setIsTrackingQrOpen] = useState(false);
    const [zoomAmount, setZoomAmount] = useState<number>(0);

    // Bank info for VietQR (Đã ghim cấu hình mới cứng)
    const BANK_ID = 'MB';
    const ACCOUNT_NO = '0945197256';
    const ACCOUNT_NAME = 'NGUYEN MINH HOANG';

    const { addListener, removeListener, subscribeToTopic, unsubscribeFromTopic } = useRealtime();

    // Subscribe to payment updates
    useEffect(() => {
        subscribeToTopic('pos/payment');

        const handlePaymentSync = (data: any) => {
            if (data.orderId === order.id) {
                // Trình diễn hiệu ứng thành công 2 giây rồi mới đóng
                setIsPaidSuccess(true);

                // Play success sound
                try {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
                    audio.play().catch(() => { });
                } catch (e) { }

                setTimeout(() => {
                    setIsPaidSuccess(false);
                    setIsTxDialogOpen(false);
                    if (onRefresh) onRefresh();
                }, 2500);
            }
        };

        addListener('PAYMENT_SYNC', handlePaymentSync);

        return () => {
            removeListener('PAYMENT_SYNC', handlePaymentSync);
            unsubscribeFromTopic('pos/payment');
        };
    }, [order.id, addListener, removeListener, subscribeToTopic, unsubscribeFromTopic, onRefresh]);

    const handleUpdateOldPartAction = async (itemId: number, version: number, action: string) => {
        try {
            await saleService.updateItem(itemId, { 
                version, 
                oldPartAction: action 
            });
            toast.success('Cập nhật trạng thái xử lý phụ tùng thành công');
            if (onRefresh) onRefresh();
        } catch (error: any) {
            toast.error(error.message || 'Không thể cập nhật trạng thái');
        }
    };

    const parts = order.items.filter(item => !item.isService);
    const services = order.items.filter(item => item.isService);

    const remainingAmount = Math.max(0, order.grandTotal - (order.amountPaid || 0));

    const openPaymentDialog = () => {
        setTxAmount(remainingAmount.toString());
        setZoomAmount(remainingAmount);
        setTxMethod('CASH');
        setTxNote('');
        setIsTxDialogOpen(true);
    };

    const handleAddTransaction = async () => {
        const amount = Number(txAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Số tiền không hợp lệ');
            return;
        }

        setIsSubmitting(true);
        try {
            await saleService.recordTransaction(order.id, {
                amount,
                method: txMethod,
                type: amount >= remainingAmount ? 'PAYMENT' : 'DEPOSIT',
                note: txNote
            });
            toast.success('Ghi nhận giao dịch thành công');
            setIsTxDialogOpen(false);
            if (onRefresh) onRefresh();
        } catch (error: any) {
            const msg = error.message || 'Không thể ghi nhận giao dịch';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrint = () => {
        toast.info('Đang chuẩn bị bản in hóa đơn...');
        // Print logic kept simple for now
        window.print();
    };

    const handleShareZalo = () => {
        toast.info('Tính năng chia sẻ Zalo đang được phát triển');
    };

    return (
        <div className="flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">

            {/* MAIN CONTENT Area (Items & Info) - 70% width */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                {/* 1. Header: Primary Identity */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <CarFront className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase leading-none mb-2">
                                {order.plate}
                            </h2>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="px-2 py-0 h-5 font-bold uppercase tracking-tight text-[10px]">
                                    #{order.id}
                                </Badge>
                                <span className="text-xs text-slate-400 dark:text-white/60 font-medium">
                                    Tiếp nhận: {new Date(order.createdAt || '').toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-white/60 uppercase tracking-widest leading-none mb-1">Khách hàng</span>
                            <span className="text-base font-bold text-slate-800 dark:text-slate-200">{order.customerName}</span>
                        </div>
                        <div className="h-10 w-[1px] bg-slate-100 dark:bg-slate-800 mx-2"></div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-cyan-300 uppercase tracking-widest leading-none mb-1">Điện thoại</span>
                            <span className="text-base font-bold text-slate-800 dark:text-white tabular-nums tracking-tight">{order.phone}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Items Table - Minimalist List */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <h3 className="text-sm font-bold uppercase tracking-tight italic text-slate-600 dark:text-white/80">Danh sách hạng mục</h3>
                    </div>

                    <div className="min-w-full">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-50 dark:border-slate-800">
                                    <th className="px-6 py-3">Tên sản phẩm / Dịch vụ</th>
                                    <th className="px-4 py-3 text-center w-16">SL</th>
                                    <th className="px-4 py-3 text-right w-28">Đơn giá</th>
                                    <th className="px-4 py-3 text-center w-20">VAT</th>
                                    <th className="px-4 py-3 text-center w-36">Xử lý đồ cũ</th>
                                    <th className="px-6 py-3 text-right w-36">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {order.items.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className={cn(
                                                    "w-7 h-7 rounded-sm flex items-center justify-center shrink-0 mt-0.5",
                                                    item.isService ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                                                )}>
                                                    {item.isService ? <Info className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight mb-0.5">{item.productName}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-white/50 font-medium tracking-tight uppercase">{item.productCode}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center font-bold text-slate-600 dark:text-slate-400">{item.quantity}</td>
                                        <td className="px-4 py-4 text-right tabular-nums text-slate-500 font-medium">{formatCurrency(item.unitPrice)}</td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <Badge variant="outline" className="text-[9px] px-1 py-0 border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                                                    {item.vatPercentage}%
                                                </Badge>
                                                <span className="text-[9px] text-slate-400 font-medium">{formatCurrency(item.vatAmount)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {!item.isService ? (
                                                <select
                                                    value={item.oldPartAction || 'RETURN_TO_CUSTOMER'}
                                                    onChange={(e) => handleUpdateOldPartAction(item.id, item.version, e.target.value)}
                                                    className={cn(
                                                        "text-[10px] font-bold py-1 px-2 rounded-md border appearance-none cursor-pointer transition-colors w-full text-center outline-none",
                                                        item.oldPartAction === 'RETURN_TO_CUSTOMER' || !item.oldPartAction
                                                            ? "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                                                            : item.oldPartAction === 'KEEP_IN_GARAGE'
                                                            ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                                                            : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                                                    )}
                                                >
                                                    <option value="RETURN_TO_CUSTOMER">Trả khách</option>
                                                    <option value="KEEP_IN_GARAGE">Lưu kho</option>
                                                    <option value="DISCARD">Bỏ đi</option>
                                                </select>
                                            ) : (
                                                <div className="flex justify-center italic text-[10px] text-slate-300">Không có</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white tabular-nums">{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {order.items.length === 0 && (
                            <div className="p-12 text-center">
                                <p className="text-sm text-slate-400 italic">Không có hạng mục nào.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Transaction History */}
                {order.transactions && order.transactions.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/30 dark:bg-emerald-400/10">
                            <div className="flex items-center gap-2">
                                <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="text-sm font-bold uppercase tracking-tight italic text-emerald-700 dark:text-emerald-300">Lịch sử thu tiền / Đặt cọc</h3>
                            </div>
                            <Badge variant="outline" className="bg-white dark:bg-slate-950 border-emerald-200 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-300">
                                Đã thu: {formatCurrency(order.amountPaid || 0)}
                            </Badge>
                        </div>
                        <div className="min-w-full">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-50 dark:border-slate-800">
                                        <th className="px-6 py-3">Ngày giờ</th>
                                        <th className="px-4 py-3">Hình thức</th>
                                        <th className="px-4 py-3">Nội dung</th>
                                        <th className="px-6 py-3 text-right">Số tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {order.transactions.map((tx) => (
                                        <tr key={tx.id} className="text-sm">
                                            <td className="px-6 py-3 text-slate-500">
                                                {new Date(tx.createdAt).toLocaleString('vi-VN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="secondary" className={cn(
                                                    "font-bold text-[10px]",
                                                    tx.method === 'CASH' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                                )}>
                                                    {tx.method === 'CASH' ? 'TIỀN MẶT' : 'CHUYỂN KHOẢN'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 italic text-xs">{tx.note || (tx.type === 'DEPOSIT' ? 'Đặt cọc' : 'Thanh toán')}</td>
                                            <td className="px-6 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(tx.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Industrial Notes - Very Subtle */}
                <div className="flex items-center gap-2 px-2 text-[10px] text-slate-400">
                    <Info className="w-3 h-3" />
                    <span>Dữ liệu được cập nhật thời gian thực từ quy trình sửa chữa tại xưởng.</span>
                </div>
            </div>

            {/* SIDE SUMMARY (The Action Card) - Fixed width 380px */}
            <div className="w-[380px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">

                <h3 className="text-sm font-bold uppercase tracking-tight text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Tổng kết thanh toán
                </h3>

                <div className="space-y-4 flex-1">

                    {/* Totals Breakdown */}
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-5 space-y-3 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-white/60">
                            <span>Tiền phụ tùng</span>
                            <span className="font-bold tabular-nums text-slate-700 dark:text-white">{formatCurrency(order.totalParts)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-white/60">
                            <span>Tiền công thợ</span>
                            <span className="font-bold tabular-nums text-slate-700 dark:text-white">{formatCurrency(order.totalLabor)}</span>
                        </div>

                        {/* VAT Groups */}
                        {(() => {
                            const vatGroups = (order.items || []).reduce((acc: any, item) => {
                                if (item.vatPercentage > 0) {
                                    acc[item.vatPercentage] = (acc[item.vatPercentage] || 0) + (item.vatAmount || 0);
                                }
                                return acc;
                            }, {});

                            const rates = Object.keys(vatGroups).sort((a, b) => Number(a) - Number(b));

                            if (rates.length === 0) {
                                return (
                                    <div className="flex justify-between items-center text-xs text-slate-500 dark:text-white/60">
                                        <span>Thuế VAT (0%)</span>
                                        <span className="font-bold tabular-nums text-slate-700 dark:text-white">{formatCurrency(0)}</span>
                                    </div>
                                );
                            }

                            return rates.map(rate => (
                                <div key={rate} className="flex justify-between items-center text-xs text-slate-500 dark:text-white/60">
                                    <span>Thuế VAT ({rate}%)</span>
                                    <span className="font-bold tabular-nums text-slate-700 dark:text-white">{formatCurrency(vatGroups[rate])}</span>
                                </div>
                            ));
                        })()}

                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-white/60">
                            <span>Chiết khấu</span>
                            <span className="font-bold tabular-nums text-rose-500">-{formatCurrency(order.totalDiscount)}</span>
                        </div>
                        <div className="h-px bg-slate-200 dark:bg-slate-800 my-2 opacity-50" />
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Tổng cộng hóa đơn</span>
                            <span className="tabular-nums text-slate-900 dark:text-slate-100">{formatCurrency(order.grandTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-bold italic">
                            <span>Đã thu / Đặt cọc</span>
                            <span className="tabular-nums">-{formatCurrency(order.amountPaid || 0)}</span>
                        </div>
                    </div>

                    <div className="p-1"></div>

                    {/* FINAL AMOUNT - BIG & CLEAR */}
                    <div className="bg-blue-600 dark:bg-blue-700 rounded-xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-extrabold uppercase opacity-70 tracking-widest mb-1">Cần thu</p>
                            <p className="text-4xl font-extrabold tracking-tighter leading-none tabular-nums">
                                {formatCurrency(order.grandTotal - order.amountPaid)}
                            </p>
                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center opacity-80">
                                <span className="text-[10px] font-bold uppercase tracking-tight">Trạng thái</span>
                                <span className="text-xs font-bold uppercase">{order.status === 'COMPLETED' ? 'Đã thu xong' : 'Chờ thanh toán'}</span>
                            </div>
                        </div>
                        <Banknote className="absolute right-[-10px] bottom-[-10px] w-24 h-24 opacity-10 -rotate-12 transition-transform group-hover:scale-110" />
                    </div>

                    {/* Additional Payment Option (QR) */}
                    <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center gap-3 bg-white dark:bg-slate-900/50">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <QrCode className="w-3.5 h-3.5" />
                            QUÉT QR CHUYỂN KHOẢN
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm relative group/qr">
                            <img
                                src={`https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${remainingAmount}&addInfo=${encodeURIComponent(`DH${order.id}`)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`}
                                alt="VietQR Payment"
                                className="w-28 h-28 object-contain"
                            />
                            <div
                                className="absolute inset-0 bg-white/60 opacity-0 group-hover/qr:opacity-100 flex items-center justify-center transition-all cursor-zoom-in"
                                onClick={() => {
                                    setZoomAmount(remainingAmount);
                                    setIsQrZoomOpen(true);
                                }}
                            >
                                <QrCode className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <Button
                            variant="link"
                            size="sm"
                            className="text-[10px] font-bold text-blue-600 h-auto p-0 hover:no-underline"
                            onClick={() => {
                                setZoomAmount(remainingAmount);
                                setIsQrZoomOpen(true);
                            }}
                        >
                            Phóng to mã QR
                        </Button>
                    </div>
                </div>

                {/* ACTIONS - Bottom Locked */}
                <div className="mt-8 space-y-3">
                    <Button
                        disabled={isProcessing || order.status === 'COMPLETED' || isSubmitting}
                        onClick={openPaymentDialog}
                        className={cn(
                            "w-full h-16 rounded-xl font-bold text-lg gap-3 shadow-lg transition-all",
                            order.status === 'COMPLETED'
                                ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20"
                                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02] shadow-blue-500/20"
                        )}
                    >
                        {isProcessing || isSubmitting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : order.status === 'COMPLETED' ? (
                            <>
                                <CheckCircle2 className="w-6 h-6 shrink-0" />
                                ĐÃ THANH TOÁN XONG
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-6 h-6 shrink-0" />
                                THU TIỀN / ĐẶT CỌC
                                <ChevronRight className="w-5 h-5 ml-auto opacity-50" />
                            </>
                        )}
                    </Button>

                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 rounded-xl h-12 text-[11px] font-bold gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 transition-all" onClick={() => setIsTrackingQrOpen(true)}>
                            <QrCode className="w-3.5 h-3.5" />
                            Theo dõi đơn
                        </Button>
                        <Button variant="outline" className="flex-1 rounded-xl h-12 text-[11px] font-bold gap-2" onClick={handlePrint}>
                            <Printer className="w-3.5 h-3.5" />
                            In hóa đơn
                        </Button>
                        <Button variant="outline" className="flex-1 rounded-xl h-12 text-[11px] font-bold gap-2" onClick={handleShareZalo}>
                            <Share2 className="w-3.5 h-3.5" />
                            Gửi Zalo
                        </Button>
                    </div>
                </div>
            </div>

            {/* TRACKING QR ZOOM DIALOG */}
            <Dialog open={isTrackingQrOpen} onOpenChange={setIsTrackingQrOpen}>
                <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-6 bg-orange-600 text-white">
                        <DialogTitle className="text-xl font-bold uppercase flex items-center gap-3 !text-white">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <QrCode className="w-6 h-6 text-white" />
                            </div>
                            Theo dõi tiến độ sửa chữa
                        </DialogTitle>
                        <DialogDescription className="text-orange-100 mt-2 font-medium">
                            Khách hàng quét mã này để cập nhật trạng thái xe theo thời gian thực mà không cần đăng nhập.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 bg-white dark:bg-slate-900 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-2xl shadow-inner border-4 border-orange-50 mb-6">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/tra-cuu?uuid=${order.uuid}`)}`}
                                alt="Tracking QR Code"
                                className="w-56 h-56"
                            />
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Biển số: {order.plate}</p>
                            <p className="text-xs text-slate-500 font-medium max-w-[280px]">
                                Mã tra cứu duy nhất: <span className="font-mono text-orange-600 font-bold">{order.uuid?.slice(0, 8)}...</span>
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
                        <Button className="w-full font-bold h-12 rounded-xl" onClick={() => setIsTrackingQrOpen(false)}>
                            ĐÓNG
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* TRANSACTION DIALOG */}
            <Dialog open={isTxDialogOpen} onOpenChange={setIsTxDialogOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-6 bg-slate-900 border-b border-white/10 text-white">
                        <DialogTitle className="text-xl font-bold uppercase flex items-center gap-3 !text-white" style={{ color: 'white' }}>
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Banknote className="w-6 h-6 text-emerald-400" />
                            </div>
                            <span className="!text-white" style={{ color: 'white' }}>Ghi nhận giao dịch</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-6 bg-white dark:bg-slate-900">
                        {isPaidSuccess ? (
                            <div className="py-12 flex flex-col items-center justify-center animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 relative">
                                    <CheckCircle2 className="w-16 h-16 relative z-10" />
                                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Thanh toán thành công!</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center font-medium">Hệ thống đã xác nhận giao dịch qua Ngân hàng.<br />Đơn hàng đã được ghi nhận tự động.</p>
                            </div>
                        ) : (
                            <>
                                {/* Amount Section */}
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Số tiền thu (VND)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={txAmount}
                                            onChange={(e) => setTxAmount(e.target.value)}
                                            placeholder="0"
                                            className="h-14 text-2xl font-bold tracking-tight pl-4 pr-12 focus-visible:ring-blue-500 border-2"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">VND</div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            className="text-xs h-10 px-4 font-bold bg-blue-50/50 border-blue-100 text-blue-700 hover:bg-blue-100"
                                            onClick={() => {
                                                const val = remainingAmount;
                                                setTxAmount(val.toString());
                                                setZoomAmount(val);
                                            }}
                                        >
                                            100% (Toàn bộ)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="text-xs h-10 px-4 font-bold border-slate-200"
                                            onClick={() => {
                                                const val = remainingAmount * 0.5;
                                                setTxAmount(val.toString());
                                                setZoomAmount(val);
                                            }}
                                        >
                                            50%
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="text-xs h-10 px-4 font-bold border-slate-200"
                                            onClick={() => {
                                                const val = remainingAmount * 0.2;
                                                setTxAmount(val.toString());
                                                setZoomAmount(val);
                                            }}
                                        >
                                            20%
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="text-xs h-10 px-4 font-bold border-slate-200"
                                            onClick={() => {
                                                const val = remainingAmount * 0.15;
                                                setTxAmount(val.toString());
                                                setZoomAmount(val);
                                            }}
                                        >
                                            15%
                                        </Button>
                                    </div>
                                </div>

                                {/* Method Section */}
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Phương thức thanh toán</Label>
                                    <RadioGroup
                                        value={txMethod}
                                        onValueChange={(v: any) => setTxMethod(v)}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <Label
                                            className={cn(
                                                "flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-slate-50 cursor-pointer transition-all",
                                                txMethod === 'CASH' && "border-blue-600 bg-blue-50/50"
                                            )}
                                        >
                                            <RadioGroupItem value="CASH" className="sr-only" />
                                            <Banknote className="mb-2 h-6 w-6 text-slate-900" />
                                            <span className="text-xs font-bold uppercase">Tiền mặt</span>
                                        </Label>
                                        <Label
                                            className={cn(
                                                "flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-slate-50 cursor-pointer transition-all",
                                                txMethod === 'TRANSFER' && "border-blue-600 bg-blue-50/50"
                                            )}
                                        >
                                            <RadioGroupItem value="TRANSFER" className="sr-only" />
                                            <QrCode className="mb-2 h-6 w-6 text-slate-900" />
                                            <span className="text-xs font-bold uppercase">Chuyển khoản</span>
                                        </Label>
                                    </RadioGroup>
                                </div>

                                {/* Note Section */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Ghi chú giao dịch</Label>
                                    <Input
                                        value={txNote}
                                        onChange={(e) => setTxNote(e.target.value)}
                                        placeholder="VD: Khách đặt cọc trước, Chuyển khoản qua Techcombank..."
                                        className="bg-slate-50 dark:bg-slate-950 font-medium text-sm"
                                    />
                                </div>

                                {/* VietQR Integration in Dialog */}
                                {txMethod === 'TRANSFER' && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div
                                            className="bg-white p-2 rounded-lg border border-blue-100 relative group/qr cursor-zoom-in"
                                            onClick={() => {
                                                setZoomAmount(Number(txAmount));
                                                setIsQrZoomOpen(true);
                                            }}
                                        >
                                            <img
                                                src={`https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${txAmount}&addInfo=${encodeURIComponent(`DH${order.id}`)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`}
                                                alt="VietQR"
                                                className="w-32 h-32"
                                            />
                                            <div className="absolute inset-0 bg-white/60 opacity-0 group-hover/qr:opacity-100 flex items-center justify-center transition-all">
                                                <QrCode className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <p className="text-[10px] font-extrabold uppercase text-blue-600 tracking-widest mb-1">Quét để trả nhanh</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                                                Khách hàng quét mã này để tự động điền số tiền <span className="font-bold">{formatCurrency(Number(txAmount))}</span> và nội dung <span className="font-bold text-blue-600">DH{order.id}</span>.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {!isPaidSuccess && (
                        <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t flex items-center justify-between gap-3">
                            <Button variant="ghost" onClick={() => setIsTxDialogOpen(false)} disabled={isSubmitting} className="font-bold h-10 px-6 text-slate-500 hover:text-slate-900 ml-auto">
                                Hủy bỏ / Quay lại
                            </Button>

                            {txMethod === 'CASH' && (
                                <Button
                                    onClick={handleAddTransaction}
                                    disabled={isSubmitting || !txAmount}
                                    className="px-8 font-extrabold uppercase tracking-tight transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 h-14"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                    )}
                                    Xác nhận thu tiền
                                </Button>
                            )}
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            {/* QR ZOOM DIALOG */}
            <Dialog open={isQrZoomOpen} onOpenChange={setIsQrZoomOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
                    <DialogHeader className="p-6 bg-blue-600 border-b border-white/10 text-white">
                        <DialogTitle className="text-xl font-bold uppercase flex items-center gap-3 !text-white" style={{ color: 'white' }}>
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <QrCode className="w-6 h-6 text-blue-200" />
                            </div>
                            <span className="!text-white" style={{ color: 'white' }}>Quét mã chuyển khoản</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-8 flex flex-col items-center justify-center space-y-6">
                        <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-blue-50">
                            <img
                                src={`https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${zoomAmount}&addInfo=${encodeURIComponent(`DH${order.id}`)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`}
                                alt="VietQR Payment Large"
                                className="w-80 h-80 object-contain"
                            />
                        </div>

                        <div className="w-full space-y-4 text-center">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số tiền</p>
                                    <p className="text-lg font-bold text-blue-600 tabular-nums italic">{formatCurrency(zoomAmount)}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nội dung</p>
                                    <p className="text-lg font-bold text-blue-600 tabular-nums italic">DH{order.id}</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-left flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                                    Quý khách vui lòng kiểm tra kỹ **Số tiền** và **Nội dung chuyển khoản** trùng khớp với thông tin trên để hệ thống tự động xác nhận nhanh nhất.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t">
                        <Button
                            onClick={() => setIsQrZoomOpen(false)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-tight h-12 shadow-lg shadow-blue-500/20"
                        >
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
