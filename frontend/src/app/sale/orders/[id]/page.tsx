import { formatCurrency } from '@/lib/utils';
import { getStatusBadge } from '@/lib/status';
import { DashboardLayout } from '@/modules/common/components/layout';
export const dynamic = 'force-dynamic';
import { ArrowLeft, Car, User, Clock, Lock, CheckCircle, ShieldCheck, PlusCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { getOrder } from '@/modules/service/order';
import ProductSearch from '@/modules/service/components/ProductSearch';
import OrderItemsTable from '@/modules/service/components/OrderItemsTable';
import OrderActions from '@/modules/service/components/OrderActions';
import InvoicePrint from '@/modules/service/components/InvoicePrint';
import PaymentButton from '@/modules/service/components/PaymentButton';
import TransactionHistory from '@/modules/service/components/TransactionHistory';
import { getTransactions } from '@/modules/finance/transaction';
import { useToast } from '@/modules/shared/components/ui/use-toast';
import ImageGallery from '@/modules/shared/components/common/ImageGallery';
import { notFound } from 'next/navigation';

export default async function OrderDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) return notFound();

    const order = await getOrder(orderId);
    if (!order) return notFound();

    const transactions = await getTransactions(orderId);

    const isLocked = !['TIEP_NHAN', 'CHO_CHAN_DOAN', 'CHO_KH_DUYET', 'BAO_GIA_LAI', 'BAO_GIA'].includes(order.status);
    const isWaitingPayment = order.status === 'CHO_THANH_TOAN';
    const isCompleted = order.status === 'HOAN_THANH';

    const resolvedSearchParams = await searchParams;
    const source = resolvedSearchParams?.source;
    let backLink = '/sale/orders';
    let backText = 'Quay lại danh sách';

    if (source === 'reception') {
        backLink = '/sale/reception';
        backText = 'Quay lại tiếp nhận';
    } else if (source === 'dashboard') {
        backLink = '/sale';
        backText = 'Quay lại Dashboard';
    }

    return (
        <DashboardLayout title="Chi tiết báo giá" subtitle={`Đơn hàng #${order.id}`}>
            <div className="max-w-6xl mx-auto pb-20">
                <div className="flex items-center justify-between mb-6">
                    <Link href={backLink} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> {backText}
                    </Link>
                    <div className="flex gap-3">
                        {(order.status === 'HOAN_THANH' || order.status === 'DONG') && (
                            <Link
                                href={`/sale/orders/${order.id}/warranty`}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                            >
                                <ShieldCheck className="w-4 h-4" /> Bảo hành
                            </Link>
                        )}
                        <OrderActions
                            orderId={order.id}
                            status={order.status}
                            hasProposedItems={order.items.some(i => i.itemStatus === 'DE_XUAT')}
                            amountPaid={order.amountPaid ?? 0}
                            depositAmount={order.amountPaid ?? 0}
                        />
                    </div>
                </div>

                {/* Cảnh báo nếu đã khóa */}
                {isLocked && (
                    <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center gap-3 text-indigo-700 dark:text-indigo-300 transition-colors">
                        <Lock className="w-5 h-5" />
                        <span>Báo giá đã được chốt. Không thể chỉnh sửa.</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Thông tin chung */}
                    <div className="lg:col-span-3 relative overflow-hidden bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-800/50 transition-all">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-transparent blur-3xl rounded-full -mr-32 -mt-32"></div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
                            <div className="flex flex-col md:flex-row items-center gap-10 w-full md:w-auto">
                                {/* Realistic License Plate Visual */}
                                <div className="flex flex-col items-center">
                                    <div className="bg-white dark:bg-slate-50 border-2 border-slate-900 dark:border-white rounded-lg px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transform hover:-rotate-1 transition-transform max-w-full overflow-hidden">
                                        <span className="text-3xl font-black text-slate-900 tracking-[0.15em] font-mono leading-none block truncate">
                                            {order.plate}
                                        </span>
                                    </div>
                                    <div className="mt-3 px-3 py-1 bg-slate-900 dark:bg-slate-800 text-white rounded text-[11px] font-bold uppercase tracking-[0.15em] max-w-[200px] truncate text-center">
                                        {order.vehicleBrand || 'HÃNG XE'} {order.vehicleModel}
                                    </div>
                                </div>

                                <div className="text-center md:text-left space-y-4">
                                    <div className="space-y-1 min-w-0">
                                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Khách hàng</p>
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center justify-center md:justify-start gap-2 truncate">
                                            {order.customerName}
                                        </h3>
                                    </div>

                                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                        {order.receptionOdo != null && order.receptionOdo > 0 && (
                                            <span className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-100 dark:border-blue-800">
                                                <Car className="w-4 h-4" /> {order.receptionOdo.toLocaleString()} KM
                                            </span>
                                        )}
                                        <span className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                                            <Clock className="w-4 h-4 text-indigo-500" /> {new Date(order.subTime).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row items-center gap-10">
                                <div className="w-48">
                                    <ImageGallery images={order.imageUrl} />
                                </div>
                                <div className="flex flex-col items-center md:items-end gap-3 min-w-[200px]">
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Trạng thái hiện tại</p>
                                    <div className="flex justify-end min-h-[40px]">
                                        {getStatusBadge(order.status)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bảng báo giá */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Search & Add - only show if not locked */}
                        {!isLocked && (
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-800/50 transition-all">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600">
                                        <PlusCircle className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Thêm hạng mục sửa chữa</h3>
                                </div>
                                <ProductSearch orderId={order.id} readOnly={isLocked} />
                            </div>
                        )}

                        {/* List Items */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-800/50 overflow-hidden transition-all">
                            <OrderItemsTable items={order.items} readOnly={isLocked} />
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24 self-start">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-800/50 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-2xl rounded-full -mr-16 -mt-16"></div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800 uppercase tracking-tight flex items-center justify-between">
                                Tổng cộng
                                <FileText className="w-5 h-5 text-slate-400" />
                            </h3>

                            <div className="space-y-4 text-sm font-medium">
                                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                    <span>Tiền hàng:</span>
                                    <span className="text-slate-900 dark:text-slate-200">{formatCurrency(order.totalParts)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                    <span>Tiền công:</span>
                                    <span className="text-slate-900 dark:text-slate-200">{formatCurrency(order.totalLabor)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                    <span>Chiết khấu:</span>
                                    <span className="text-rose-500 px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg">-{formatCurrency(order.totalDiscount)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-50 dark:border-slate-800">
                                    <span>Thuế VAT:</span>
                                    <span className="text-slate-900 dark:text-slate-200">{formatCurrency(order.vat)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xl font-black text-slate-900 dark:text-white pt-4 border-t-2 border-blue-50 dark:border-blue-900/30">
                                    <span>Thành tiền:</span>
                                    <span className="text-slate-900 dark:text-white text-2xl tracking-tighter">{formatCurrency(order.grandTotal)}</span>
                                </div>
                            </div>

                            {!isWaitingPayment && !isCompleted && (
                                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 text-center uppercase tracking-widest font-bold">
                                    Báo giá có hiệu lực trong 7 ngày
                                </div>
                            )}
                        </div>

                        {/* Transaction History & Payment */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-800/50 transition-all">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800 uppercase tracking-tight">Thanh toán</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800/50">
                                    <span className="text-red-700 dark:text-red-400 font-medium">Còn nợ:</span>
                                    <span className="font-bold text-red-700 dark:text-red-400 text-lg">
                                        {formatCurrency(order.debt ?? (order.grandTotal - order.amountPaid))}
                                    </span>
                                </div>

                                {!isCompleted && (
                                    <PaymentButton
                                        orderId={order.id}
                                        grandTotal={order.grandTotal}
                                        remainAmount={order.debt ?? (order.grandTotal - order.amountPaid)}
                                        amountPaid={order.amountPaid ?? 0}
                                        orderStatus={order.status}
                                        disabled={['BAO_GIA', 'CHO_KH_DUYET', 'HUY', 'DONG'].includes(order.status)}
                                        items={order.items}
                                    />
                                )}
                            </div>

                            {/* History List */}
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Lịch sử giao dịch</h4>
                            <TransactionHistory transactions={transactions} />
                        </div>

                        {/* Completed State */}
                        {isCompleted && (
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Hoàn thành</h3>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Đơn hàng đã thanh toán đủ</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-300">Đã thanh toán:</span>
                                        <span className="font-medium text-emerald-700 dark:text-emerald-400">{formatCurrency(order.amountPaid)}</span>
                                    </div>
                                    {order.paymentMethod && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-300">Phương thức:</span>
                                            <span className="font-medium text-slate-800 dark:text-slate-200">
                                                {order.paymentMethod === 'TIEN_MAT' ? 'Tiền mặt' :
                                                    order.paymentMethod === 'CHUYEN_KHOAN' ? 'Chuyển khoản' : 'Hỗn hợp'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <InvoicePrint order={order} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
