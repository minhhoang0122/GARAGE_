'use client';

import { formatCurrency } from '@/lib/utils';
import { useRef } from 'react';
import { 
    Printer, 
    CheckCircle2, 
    CreditCard, 
    Banknote, 
    Share2, 
    Wrench, 
    Package, 
    Calendar,
    User,
    Phone,
    Gauge,
    QrCode,
    FileText,
    ArrowRight,
    Loader2,
    Info,
    ShieldCheck
} from 'lucide-react';
import { Badge } from '@/modules/shared/components/ui/badge';
import { Button } from '@/modules/shared/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LiveInvoiceProps {
    order: {
        id: number;
        plate: string;
        customerName: string;
        phone: string;
        odo: number;
        items: {
            productName: string;
            productCode: string;
            quantity: number;
            unitPrice: number;
            discountAmount: number;
            total: number;
            isService: boolean;
            warrantyMonths?: number;
        }[];
        totalParts: number;
        totalLabor: number;
        totalDiscount: number;
        vat: number;
        grandTotal: number;
        amountPaid: number;
        status: string;
        createdAt?: string;
    };
    onConfirmPayment: () => void;
    isProcessing: boolean;
}

export default function LiveInvoice({ order, onConfirmPayment, isProcessing }: LiveInvoiceProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const parts = order.items.filter(item => !item.isService);
    const services = order.items.filter(item => item.isService);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '', 'width=800,height=1000');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice #${order.id}</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; padding: 40px; color: #000; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #000; padding: 10px; text-align: left; font-size: 12px; }
                        th { background: #f0f0f0; text-transform: uppercase; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; }
                        .plate { border: 2px solid #000; padding: 5px 15px; font-weight: 900; font-size: 24px; }
                        .totals { margin-top: 30px; float: right; width: 300px; }
                        .total-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #ccc; }
                        .grand-total { font-size: 20px; font-weight: 900; border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <script>window.onload = () => { window.print(); window.close(); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleShareZalo = () => {
        toast.info('Tính năng chia sẻ Zalo đang được phát triển');
    };

    return (
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950/50">
            {/* Invoice Paper Wrapper - Industrial Aesthetic */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
                <div 
                    ref={printRef}
                    className="max-w-[700px] mx-auto bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-700 rounded-none relative overflow-hidden ring-1 ring-slate-950/5"
                >
                    
                    {/* Industrial Header Pattern */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>
                    
                    {/* Header: Brand & Meta */}
                    <div className="p-8 border-b-2 border-slate-950 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-6 bg-slate-50 dark:bg-slate-900/50">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white border-2 border-slate-950 dark:border-slate-700 px-2 py-0.5">Gara Master</span>
                                <div className="h-4 w-[2px] bg-slate-400 mx-2"></div>
                                <span className="text-[10px] font-bold text-slate-500 tracking-tight">Dịch vụ sửa chữa chuyên nghiệp</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Hóa đơn dịch vụ</h1>
                            <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-2 tracking-tight">Mã số: DH-{order.id.toString().padStart(6, '0')}</p>
                        </div>

                        {/* License Plate Graphic - Industrial Style */}
                        <div className="flex flex-col items-end">
                            <div className="bg-white dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-600 px-4 py-2 flex flex-col items-center min-w-[170px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-100 w-full text-center pb-0.5">VIETNAM • REG</span>
                                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-widest font-mono uppercase leading-none">{order.plate}</span>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <div className={cn(
                                    "px-2 py-0.5 text-[9px] font-bold tracking-tight border-2",
                                    order.status === 'COMPLETED' 
                                        ? "bg-green-500 text-white border-green-600" 
                                        : "bg-amber-400 text-slate-900 border-amber-500"
                                )}>
                                    {order.status === 'COMPLETED' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </div>
                                <div className="px-2 py-0.5 text-[9px] font-mono font-black border-2 border-slate-200 dark:border-slate-700 text-slate-500">
                                    {new Date(order.createdAt || '').toLocaleDateString('en-GB')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Vehicle Info Grid - High Density */}
                    <div className="grid grid-cols-1 md:grid-cols-3 border-b-2 border-slate-950 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="p-4 border-r-2 border-slate-950 dark:border-slate-800 flex items-center gap-3">
                            <User className="w-4 h-4 text-slate-900 dark:text-slate-400" />
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 tracking-tight">Khách hàng</p>
                                <p className="text-xs font-black text-slate-900 dark:text-slate-200 truncate">{order.customerName}</p>
                            </div>
                        </div>
                        <div className="p-4 border-r-2 border-slate-950 dark:border-slate-800 flex items-center gap-3">
                            <Phone className="w-4 h-4 text-slate-900 dark:text-slate-400" />
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 tracking-tight">Số điện thoại</p>
                                <p className="text-xs font-black text-slate-900 dark:text-slate-200 font-mono tracking-wider">{order.phone}</p>
                            </div>
                        </div>
                        <div className="p-4 flex items-center gap-3">
                            <Gauge className="w-4 h-4 text-slate-900 dark:text-slate-400" />
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 tracking-tight">Số KM (Odo)</p>
                                <p className="text-xs font-black text-slate-900 dark:text-slate-200 font-mono tracking-tight">{order.odo.toLocaleString()} KM</p>
                            </div>
                        </div>
                    </div>

                    {/* Table Section: Items - Industrial Grid */}
                    <div className="p-0 border-b-2 border-slate-950 dark:border-slate-800">
                        <table className="w-full text-left border-collapse text-[11px]">
                            <thead>
                                <tr className="bg-slate-950 text-white tracking-tight font-bold">
                                    <th className="px-6 py-3 border-r border-slate-800">Nội dung công việc / Vật tư</th>
                                    <th className="px-4 py-3 border-r border-slate-800 text-center w-16">SL</th>
                                    <th className="px-4 py-3 border-r border-slate-800 text-right w-32">Đơn giá</th>
                                    <th className="px-6 py-3 text-right w-36">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                                {/* Services Section */}
                                {services.length > 0 && (
                                    <>
                                        <tr className="bg-blue-50/50 dark:bg-blue-900/10">
                                            <td colSpan={4} className="px-6 py-2 text-[9px] font-bold text-blue-800 dark:text-blue-400 tracking-widest border-b border-slate-200 dark:border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <Wrench className="w-3 h-3" />
                                                    DANH MỤC DỊCH VỤ & TIỀN CÔNG
                                                </div>
                                            </td>
                                        </tr>
                                        {services.map((item, idx) => (
                                            <tr key={`svc-${idx}`} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-3 border-r border-slate-200 dark:border-slate-800">
                                                    <p className="font-bold text-slate-900 dark:text-slate-200">{item.productName}</p>
                                                    <p className="text-[9px] text-slate-500 mt-0.5 tracking-tighter">REF: {item.productCode}</p>
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-800 text-center font-black">{item.quantity}</td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-800 text-right tabular-nums text-slate-600 dark:text-slate-400">{formatCurrency(item.unitPrice)}</td>
                                                <td className="px-6 py-3 text-right font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(item.total)}</td>
                                            </tr>
                                        ))}
                                    </>
                                )}

                                {/* Parts Section */}
                                {parts.length > 0 && (
                                    <>
                                        <tr className="bg-slate-50 dark:bg-slate-800/30">
                                            <td colSpan={4} className="px-6 py-2 text-[9px] font-bold text-slate-500 tracking-widest border-b border-slate-200 dark:border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-3 h-3" />
                                                    DANH MỤC PHỤ TÙNG & VẬT TƯ
                                                </div>
                                            </td>
                                        </tr>
                                        {parts.map((item, idx) => (
                                            <tr key={`part-${idx}`} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-3 border-r border-slate-200 dark:border-slate-800">
                                                    <p className="font-bold text-slate-900 dark:text-slate-200">{item.productName}</p>
                                                    <div className="flex gap-2 mt-0.5">
                                                        <span className="text-[9px] text-slate-500">PN: {item.productCode}</span>
                                                        {item.warrantyMonths && (
                                                            <div className="flex items-center gap-1 text-[8px] font-black text-amber-600 px-1 border border-amber-200 bg-amber-50">
                                                                <ShieldCheck className="w-2 h-2" />
                                                                BAO HÀNH {item.warrantyMonths} THÁNG
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-800 text-center font-black">{item.quantity}</td>
                                                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-800 text-right tabular-nums text-slate-600 dark:text-slate-400">{formatCurrency(item.unitPrice)}</td>
                                                <td className="px-6 py-3 text-right font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(item.total)}</td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                        {/* Financial Summary & QR - Stark Contrast */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 bg-white dark:bg-slate-900">
                            {/* QR Payment Block */}
                            <div className="flex flex-col items-center justify-center p-4 border-2 border-slate-950 dark:border-slate-700 relative bg-slate-50 dark:bg-slate-800/50">
                                <div className="absolute top-0 transform -translate-y-1/2 bg-slate-950 text-white px-3 py-1 flex items-center gap-2">
                                    <QrCode className="w-3 h-3" />
                                    <span className="text-[9px] font-bold">Thanh toán quét mã</span>
                                </div>
                                
                                <div className="bg-white p-2 border border-slate-200">
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=STB_Invoice_${order.id}_Amount_${order.grandTotal}`} 
                                        alt="VietQR"
                                        className="w-32 h-32 object-contain grayscale contrast-125"
                                    />
                                </div>
                                
                                <div className="mt-3 text-center">
                                    <p className="text-[8px] font-bold text-slate-400 leading-tight">VietQR / Chuyển khoản nhanh MB Bank</p>
                                    <p className="text-[10px] font-bold text-slate-900 dark:text-white font-mono mt-1 px-2 border-x-2 border-blue-500">Mã: DH-{order.id}</p>
                                </div>
                            </div>

                            {/* Totals Breakdown */}
                            <div className="space-y-4 font-mono">
                                <div className="pt-4 border-t-2 border-slate-950 dark:border-slate-700">
                                    <div className="flex justify-between items-end bg-slate-950 dark:bg-slate-700 text-white p-4">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold opacity-60 leading-none mb-1">Số tiền cuối cùng</span>
                                            <span className="text-xl font-bold tracking-tight">Tổng thanh toán</span>
                                        </div>
                                        <span className="text-4xl font-bold tabular-nums tracking-tighter">{formatCurrency(order.grandTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Industrial Note Section */}
                    <div className="px-8 py-4 border-t-2 border-slate-950 dark:border-slate-800 text-[9px] text-slate-400 italic bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2 mb-1">
                            <Info className="w-3 h-3 text-slate-900 dark:text-slate-400" />
                            <span className="font-bold tracking-tight text-slate-900 dark:text-slate-300">Điều khoản & Quy định bảo hành</span>
                        </div>
                        <p>Đây là chứng từ điện tử được hệ thống tự động khởi tạo và không cần chữ ký. Bảo hành chỉ có giá trị kèm theo tem và dữ liệu đối soát trên hệ thống. Mọi thắc mắc vui lòng phản hồi trong vòng 24h kể từ khi nhận xe.</p>
                    </div>
                </div>
            </div>

            {/* Fixed Action Bar - The POS Interface */}
            <div className="bg-white dark:bg-slate-900 border-t-2 border-slate-950 dark:border-slate-800 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-10">
                <div className="max-w-[700px] mx-auto flex flex-col sm:flex-row gap-4">
                    
                    <div className="flex-1 flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={handlePrint}
                            className="flex-1 font-bold rounded-none border-2 border-slate-950 dark:border-slate-700 h-14 gap-2 hover:bg-slate-950 hover:text-white transition-all text-sm"
                        >
                            <Printer className="w-4 h-4" />
                            In hóa đơn
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleShareZalo}
                            className="flex-1 font-bold rounded-none border-2 border-slate-950 dark:border-slate-700 h-14 gap-2 hover:bg-slate-950 hover:text-white transition-all text-sm"
                        >
                            <Share2 className="w-4 h-4" />
                            Gửi khách hàng
                        </Button>
                    </div>

                    <Button 
                        disabled={isProcessing || order.status === 'COMPLETED'}
                        onClick={onConfirmPayment}
                        className={cn(
                            "flex-[1.5] h-14 font-bold rounded-none text-lg gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] transition-all tracking-tight",
                            order.status === 'COMPLETED' 
                                ? "bg-green-600 hover:bg-green-700 text-white cursor-default border-2 border-green-800" 
                                : "bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-800"
                        )}
                    >
                        {order.status === 'COMPLETED' ? (
                            <>
                                <CheckCircle2 className="w-6 h-6" />
                                XÁC NHẬN ĐÃ THANH TOÁN
                            </>
                        ) : (
                            <>
                                {isProcessing ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <Banknote className="w-6 h-6" />
                                        Xác nhận thanh toán
                                        <ArrowRight className="w-5 h-5 ml-auto" />
                                    </>
                                )}
                            </>
                        )}
                    </Button>
                </div>
                
                {/* Secondary Indicators */}
                <div className="max-w-[800px] mx-auto mt-3 flex justify-center gap-6">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <CreditCard className="w-3 h-3" />
                        Chấp nhận nhiều loại thẻ
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <Banknote className="w-3 h-3" />
                        Tiền mặt tại quầy
                    </div>
                </div>
            </div>
        </div>
    );
}
