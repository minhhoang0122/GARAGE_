import { notFound, redirect } from 'next/navigation';
import PrintButton from './PrintButton';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import PrintLayout from '@/modules/shared/components/common/PrintLayout';
import { 
    isQuoting, 
    isWaitingForCustomer, 
    isApproved, 
    isInProgress, 
    isWaitingPayment, 
    isCompleted, 
    isClosed, 
    isCancelled 
} from '@/lib/status';

export default async function PrintQuotePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ type?: string }> }) {
    const { id } = await params;
    const resolvedSearchParams = await searchParams;
    const orderId = parseInt(id);
    if (isNaN(orderId)) return notFound();

    const session = await auth();
    if (!session?.user) return redirect('/login');
    const token = (session.user as any).accessToken;

    let order = null;
    try {
        order = await api.get(`/sale/orders/${orderId}`, token);
    } catch (e: any) {
        console.error('Print page fetch error:', e);
        return (
            <div className="p-10 text-center">
                <h1 className="text-xl font-bold text-red-600 mb-2">Lỗi tải dữ liệu</h1>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg inline-block text-left max-w-md">
                    <p className="text-sm font-mono text-slate-600 break-all">
                        <strong>Path:</strong> /api/sale/orders/{orderId}<br />
                        <strong>Error:</strong> {e.message || 'Không có thông báo lỗi chi tiết'}<br />
                        <strong>Stack:</strong> {e.stack ? 'Chi tiết được log ở terminal' : 'N/A'}
                    </p>
                </div>
                <div className="mt-6">
                    <a
                        href=""
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-sm"
                    >
                        Thử lại
                    </a>
                </div>
            </div>
        );
    }

    if (!order) return notFound();

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const formatDate = (date: string | Date) =>
        new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));

    // Chỉ lấy items được duyệt
    const approvedItems = order.items.filter((item: any) => item.itemStatus !== 'KHACH_TU_CHOI');

    // Fix field mapping: backend returns totalPrice, not total
    const getItemTotal = (item: any) => Number(item.totalPrice ?? item.total ?? 0);
    const isItemService = (item: any) => item.type === 'SERVICE' || item.isService;

    const totalParts = approvedItems
        .filter((item: any) => !isItemService(item))
        .reduce((sum: number, item: any) => sum + getItemTotal(item), 0);

    const totalLabor = approvedItems
        .filter((item: any) => isItemService(item))
        .reduce((sum: number, item: any) => sum + getItemTotal(item), 0);

    const grandTotal = order.finalAmount || (totalParts + totalLabor);

    // Fix field mappings for order-level fields
    const plate = order.plateNumber || order.plate || '';
    const vehicleBrand = order.carBrand || order.vehicleBrand || '';
    const vehicleModel = order.carModel || order.vehicleModel || '';
    const amountPaid = Number(order.paidAmount || order.amountPaid || 0);
    const depositAmount = Number(order.deposit || order.tienCoc || 0);
    const taxAmount = Number(order.tax || 0);
    const discountAmount = Number(order.discount || order.totalDiscount || 0);
    const debt = Number(order.congNo || order.debt || (grandTotal - amountPaid));

    // Determine document title based on status
    let documentTitle = 'BÁO GIÁ DỊCH VỤ';
    let prefix = 'BG';
    let label = 'Thông tin báo giá';

    // isDraft is strictly for the watermark
    const isDraft = isQuoting(order.status);

    // Check for "release_note" mode
    const isReleaseNote = resolvedSearchParams?.type === 'release_note';

    // SPECIAL LAYOUT: PHIẾU XUẤT XƯỞNG (RELEASE NOTE)
    if (isReleaseNote) {
        return (
            <PrintLayout title="PHIẾU XUẤT XƯỞNG">
                <PrintButton />

                <div className="border-2 border-slate-800 p-8 rounded-xl max-w-2xl mx-auto mt-4 bg-white">
                    {/* Header */}
                    <div className="text-center border-b-2 border-slate-100 pb-6 mb-6">
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">PHIẾU XUẤT XƯỞNG</h1>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">RELEASE NOTE</p>
                        <p className="mt-4 text-xs font-mono text-slate-400">NO: {prefix}-{order.id.toString().padStart(6, '0')}</p>
                    </div>

                    {/* Big Status Badge */}
                    <div className="flex justify-center mb-8">
                        <div className="px-6 py-2 bg-green-100 text-green-700 border border-green-200 rounded-full font-bold text-lg flex items-center gap-2">
                            <span>✓ CHO PHÉP XUẤT XƯỞNG</span>
                        </div>
                    </div>

                    {/* Vehicle Identity */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-xs uppercase font-bold text-slate-400 mb-1">BIỂN SỐ XE (LICENSE PLATE)</p>
                            <p className="text-4xl font-black text-slate-900 tracking-tight">{plate}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase font-bold text-slate-400 mb-1">DÒNG XE (MODEL)</p>
                            <p className="text-2xl font-bold text-slate-700">{vehicleBrand} {vehicleModel}</p>
                        </div>
                    </div>

                    {/* Info Table */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-8 text-sm">
                        <div className="grid grid-cols-[120px_1fr] gap-y-3">
                            <span className="text-slate-500">Khách hàng:</span>
                            <span className="font-bold uppercase">{order.customerName}</span>

                            <span className="text-slate-500">Điện thoại:</span>
                            <span className="font-mono">{order.customerPhone}</span>

                            <span className="text-slate-500">Ngày vào:</span>
                            <span>{formatDate(order.createdAt)}</span>

                            <span className="text-slate-500">Ngày ra:</span>
                            <span className="font-bold">{formatDate(new Date())}</span>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-dashed border-slate-300">
                        <div className="text-center">
                            <p className="font-bold text-xs uppercase mb-16">CỐ VẤN DỊCH VỤ</p>
                            <p className="text-xs text-slate-400">(Ký & Ghi rõ họ tên)</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-xs uppercase mb-16">BẢO VỆ / CỔNG</p>
                            <p className="text-xs text-slate-400">(Xác nhận xe ra)</p>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-[10px] text-slate-400 italic">
                        * Vui lòng xuất trình phiếu này cho bộ phận an ninh khi đưa xe ra khỏi xưởng.
                    </div>
                </div>
            </PrintLayout>
        );
    }

    if (isQuoting(order.status)) {
        documentTitle = 'BÁO GIÁ DỰ KIẾN';
        prefix = 'BG';
        label = 'Thông tin báo giá';
    } else if (isWaitingForCustomer(order.status)) {
        documentTitle = 'BÁO GIÁ SỬA CHỮA';
        prefix = 'BG';
        label = 'Thông tin báo giá';
    } else if (isApproved(order.status) || isInProgress(order.status)) {
        documentTitle = 'LỆNH SỬA CHỮA';
        prefix = 'LSC';
        label = 'Thông tin lệnh';
    } else if (isWaitingPayment(order.status) || isCompleted(order.status) || isClosed(order.status)) {
        documentTitle = 'QUYẾT TOÁN SỬA CHỮA';
        prefix = 'HD';
        label = 'Thông tin hóa đơn';
    } else if (isCancelled(order.status)) {
        documentTitle = 'PHIẾU HỦY DỊCH VỤ';
        prefix = 'HUY';
        label = 'Thông tin phiếu';
    }

    return (
        <PrintLayout title={documentTitle}>
            <PrintButton />

            {/* Watermark for draft quotes */}
            {isDraft && (
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 print:block">
                    <div className="text-[100px] font-black text-slate-200 dark:text-slate-800 rotate-[-30deg] select-none opacity-50">
                        DỰ KIẾN
                    </div>
                </div>
            )}

            <div className="mb-6 flex justify-between items-end border-b pb-2">
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</h3>
                    <p className="text-lg font-bold">
                        {prefix}-{order.id.toString().padStart(6, '0')}
                        {isDraft && <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded">(Chưa duyệt)</span>}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm">Ngày lập: <span className="font-bold">{formatDate(order.createdAt)}</span></p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="border p-4 rounded-lg bg-slate-50/50">
                    <h3 className="font-bold border-b pb-2 mb-3 uppercase text-xs tracking-widest text-slate-500">Khách hàng</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Họ tên:</span> <span className="font-bold">{order.customerName}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Điện thoại:</span> <span className="font-bold">{order.customerPhone}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Địa chỉ:</span> <span className="font-bold truncate max-w-[200px]">{order.customerAddress || '—'}</span></div>
                    </div>
                </div>
                <div className="border p-4 rounded-lg bg-slate-50/50">
                    <h3 className="font-bold border-b pb-2 mb-3 uppercase text-xs tracking-widest text-slate-500">Thông tin xe</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Biển số:</span> <span className="font-bold text-blue-700 text-lg">{plate}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Dòng xe:</span> <span className="font-bold">{vehicleBrand} {vehicleModel}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Số ODO:</span> <span className="font-bold">{order.vehicleOdo?.toLocaleString('vi-VN')} km</span></div>
                    </div>
                </div>
            </div>

            {/* Yêu cầu */}
            {order.receptionRequest && (
                <div className="mb-6 border p-4 rounded-lg bg-amber-50/30">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-1">Yêu cầu của khách:</h4>
                    <p className="text-sm italic text-slate-700">"{order.receptionRequest}"</p>
                </div>
            )}

            {/* Items Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="w-12 text-center">STT</th>
                        <th>Nội dung công việc / Vật tư phụ tùng</th>
                        <th className="w-16 text-center">SL</th>
                        <th className="w-32 text-right">Đơn giá</th>
                        <th className="w-32 text-right">Thành tiền</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {approvedItems.map((item: any, idx: number) => (
                        <tr key={item.id}>
                            <td className="text-center text-slate-500">{idx + 1}</td>
                            <td>
                                <div className="font-bold">{item.productName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                    Mã: {item.productCode}
                                    {isItemService(item) && <span className="ml-2 px-1 bg-indigo-50 text-indigo-600 rounded text-[9px] uppercase font-bold not-italic">Công dịch vụ</span>}
                                </div>
                            </td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-right">{formatCurrency(Number(item.unitPrice))}</td>
                            <td className="text-right font-bold">{formatCurrency(getItemTotal(item))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Summary List */}
            <div className="flex justify-end mb-8">
                <div className="w-80 space-y-2 border-t-2 border-slate-900 pt-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Tổng tiền phụ tùng:</span>
                        <span>{formatCurrency(totalParts)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Tổng tiền công:</span>
                        <span>{formatCurrency(totalLabor)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Chiết khấu:</span>
                        <span className="text-rose-600">{formatCurrency(discountAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Thuế VAT ({order.vatPercent}%):</span>
                        <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black border-t pt-2 mt-2">
                        <span>TỔNG CỘNG:</span>
                        <span className="text-blue-700">{formatCurrency(grandTotal)}</span>
                    </div>

                    {/* Payment Info - Only show if there are payments */}
                    {(amountPaid > 0 || depositAmount > 0) && (
                        <div className="border-t border-dashed pt-3 mt-3 space-y-1">
                            {depositAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Đã đặt cọc:</span>
                                    <span className="text-green-600 font-bold">{formatCurrency(depositAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-red-600">CÒN NỢ:</span>
                                <span className="text-red-600">{formatCurrency(debt)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Terms */}
            <div className="p-4 border rounded-lg bg-slate-50 text-[11px] leading-relaxed">
                <h4 className="font-bold mb-2 uppercase tracking-wider">Điều khoản & Bảo hành:</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Báo giá này có giá trị trong vòng 07 ngày kể từ ngày lập.</li>
                    <li>Các hạng mục phát sinh ngoài báo giá sẽ được thông báo và chỉ thực hiện khi có sự đồng ý của Quý khách.</li>
                    <li>Phụ tùng thay thế được bảo hành theo tiêu chuẩn nhà sản xuất (thường là 06 tháng hoặc 10.000km).</li>
                    <li>Quý khách vui lòng kiểm tra kỹ xe và nhận lại vật tư cũ (nếu có) trước khi rời Gara.</li>
                </ul>
            </div>
        </PrintLayout>
    );
}
