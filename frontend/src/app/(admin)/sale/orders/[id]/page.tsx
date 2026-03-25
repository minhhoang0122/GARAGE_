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
import OrderSummary from '@/modules/service/components/OrderSummary';
import InvoicePrint from '@/modules/service/components/InvoicePrint';
import OrderPaymentSection from '@/modules/service/components/OrderPaymentSection';
import { OrderWorkspaceProvider } from '@/modules/service/components/OrderWorkspaceProvider';
import { getTransactions } from '@/modules/finance/transaction';
import { useToast } from '@/modules/shared/components/ui/use-toast';
import ImageGallery from '@/modules/shared/components/common/ImageGallery';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function OrderDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) return notFound();

    const session = await auth();
    const token = (session?.user as any)?.accessToken;

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
            <div className="max-w-[1600px] mx-auto pb-20 px-4 lg:px-8">
                <div className="flex items-center justify-between mb-8">
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
                            thoChanDoanId={order.thoChanDoanId}
                            nguoiPhuTrachId={order.nguoiPhuTrachId}
                        />
                    </div>
                </div>

                {/* Cảnh báo nếu đã khóa */}
                {isLocked && (
                    <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center gap-3 text-indigo-700 dark:text-indigo-300 transition-colors">
                        <Lock className="w-5 h-5" />
                        <span>Báo giá đã được chốt. Không thể chỉnh sửa.</span>
                    </div>
                )}

                        {/* Unified 12-Column Grid with intentional Gaps */}
                        <OrderWorkspaceProvider initialItems={order.items}>
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                                
                                {/* Main Content Area (8/12) - Added min-w-0 to prevent overflow */}
                                <div className="xl:col-span-8 space-y-6 min-w-0">
                                    {/* Thông tin chung - Card top aligned */}
                                    <div className="relative bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/50 transition-all">
                                        {/* Background decoration with its own clipping */}
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-transparent blur-3xl rounded-full -mr-32 -mt-32"></div>
                                        </div>

                                        <div className="flex flex-col xl:flex-row flex-wrap justify-between items-center xl:items-start gap-8 relative z-10 w-full">
                                            <div className="flex flex-col md:flex-row flex-wrap items-center gap-6 w-full xl:w-auto xl:max-w-[65%]">
                                                {/* Realistic License Plate Visual */}
                                                <div className="flex flex-col items-center shrink-0">
                                                    <div className="bg-white dark:bg-slate-50 border-2 border-slate-900 dark:border-white rounded-xl px-6 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transform hover:-rotate-1 transition-all duration-300 group cursor-default">
                                                        <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-[0.15em] font-mono leading-none block">
                                                            {order.plate}
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 px-3 py-1 bg-slate-900 dark:bg-slate-800 text-white rounded text-[11px] font-bold uppercase tracking-[0.15em] max-w-[200px] truncate text-center">
                                                        {order.vehicleBrand || 'HÃNG XE'} {order.vehicleModel}
                                                    </div>
                                                </div>

                                                <div className="text-center md:text-left space-y-2 min-w-[200px] flex-1">
                                                    <div className="space-y-1">
                                                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Khách hàng</p>
                                                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center justify-center md:justify-start gap-2 break-words">
                                                            {order.customerName}
                                                        </h3>
                                                    </div>

                                                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                                        {order.receptionOdo != null && order.receptionOdo > 0 && (
                                                            <span className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-100 dark:border-blue-800 whitespace-nowrap">
                                                                <Car className="w-4 h-4" /> {order.receptionOdo.toLocaleString()} KM
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 whitespace-nowrap">
                                                            <Clock className="w-4 h-4 text-indigo-500" /> {new Date(order.subTime).toLocaleString('vi-VN')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center xl:justify-end gap-6 sm:gap-8 w-full xl:w-auto xl:max-w-[35%] shrink-0">
                                                <div className="w-40 sm:w-44 shrink-0 flex justify-center">
                                                    <ImageGallery images={order.imageUrl} />
                                                </div>
                                                <div className="flex flex-col items-center sm:items-end gap-3 shrink-0 min-w-fit">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center sm:text-right">Trạng thái</p>
                                                    <div className="flex items-center justify-center sm:justify-end w-full">
                                                        {getStatusBadge(order.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Search & Add Section */}
                                    {!isLocked && (
                                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/50 transition-all">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600">
                                                    <PlusCircle className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Thêm hạng mục sửa chữa</h3>
                                            </div>
                                            <ProductSearch orderId={order.id} readOnly={isLocked} />
                                        </div>
                                    )}
                                    
                                    {/* List Items Table Card */}
                                    <div className="transition-all">
                                        <OrderItemsTable items={order.items} orderId={order.id} readOnly={isLocked} token={token} />
                                    </div>
                                </div>

                                {/* Summary Sidebar - Proximity maintained but with clear Gap */}
                                <div className="xl:col-span-4 space-y-8 xl:sticky xl:top-8 self-start">
                                    {/* Summary Card */}
                                    <OrderSummary
                                        orderId={order.id}
                                        totalParts={order.totalParts}
                                        totalLabor={order.totalLabor}
                                        totalDiscount={order.totalDiscount}
                                        vat={order.vat}
                                        vatPercent={order.vatPercent}
                                        grandTotal={order.grandTotal}
                                        isLocked={isLocked}
                                    />

                                    {/* Payment/Transactions Card */}
                                    <OrderPaymentSection 
                                        order={order} 
                                        transactions={transactions} 
                                        isCompleted={isCompleted} 
                                    />

                                    {/* Completed info */}
                                    {isCompleted && (
                                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 transition-colors">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Hoàn thành</h3>
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Đơn hàng đã thanh toán đủ</p>
                                                </div>
                                            </div>
                                            <InvoicePrint order={order} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </OrderWorkspaceProvider>
            </div>
        </DashboardLayout>
    );
}
