'use client';

import { use, useMemo, Suspense } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, Car, User, Clock, Lock, CheckCircle, 
    ShieldCheck, PlusCircle, Loader2, UserCheck, Wrench
} from 'lucide-react';

import { formatCurrency } from '@/lib/utils';
import { getStatusBadge, isPostApproval, isCompleted, isClosed, isWaitingPayment } from '@/lib/status';
import { DashboardLayout } from '@/modules/common/components/layout';
import ProductSearch from '@/modules/shared/components/ProductSearch';
import OrderItemsTable from '@/modules/sale/components/OrderItemsTable';
import OrderActions from '@/modules/sale/components/OrderActions';
import OrderSummary from '@/modules/sale/components/OrderSummary';
import OrderPaymentSection from '@/modules/sale/components/OrderPaymentSection';
import { OrderWorkspaceProvider } from '@/modules/sale/components/OrderWorkspaceProvider';
import ImageGallery from '@/modules/shared/components/common/ImageGallery';
import Timeline from '@/modules/shared/components/common/Timeline';
import BaseAvatar from '@/modules/shared/components/common/BaseAvatar';
import InvoicePrint from '@/modules/sale/components/InvoicePrint';
import { ROLE_DISPLAY_NAMES } from '@/config/menu';
import { useOrderDetail } from '@/modules/sale/hooks/useSale';
import { usePaymentsByOrder } from '@/modules/finance/hooks/useFinance';

function OrderDetailPageContent({ id }: { id: string }) {
    const orderId = parseInt(id);
    const searchParams = useSearchParams();
    
    const { data: order, isLoading: orderLoading, error: orderError } = useOrderDetail(orderId);
    const { data: transactions = [] } = usePaymentsByOrder(orderId);

    const source = searchParams.get('source');

    const backInfo = useMemo(() => {
        if (source === 'reception') return { link: '/sale/reception', text: 'Quay lại tiếp nhận' };
        if (source === 'dashboard') return { link: '/sale', text: 'Quay lại Dashboard' };
        return { link: '/sale/orders', text: 'Quay lại danh sách' };
    }, [source]);

    if (orderLoading) {
        return (
            <DashboardLayout title="Hồ sơ Lệnh sửa chữa" subtitle="Đang tải dữ liệu...">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    <p className="text-slate-500 font-medium">Đang tải chi tiết đơn hàng...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (orderError || !order) return notFound();

    const isLocked = isPostApproval(order.status);

    return (
        <DashboardLayout title="Hồ sơ Lệnh sửa chữa & Báo giá" subtitle={`Mã đơn hàng: #${order.id}`}>
            <div className="max-w-[2000px] mx-auto pb-20 px-4 lg:px-12">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <Link href={backInfo.link} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> {backInfo.text}
                    </Link>
                    <div className="flex gap-3">
                        {(isCompleted(order.status) || isClosed(order.status)) && (
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
                            hasProposedItems={order.items.some((i: any) => i.itemStatus === 'DE_XUAT')}
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

                <OrderWorkspaceProvider orderId={order.id} initialItems={order.items || []}>
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        
                        {/* Main Content Area (9/12) */}
                        <div className="xl:col-span-8 space-y-8 min-w-0">
                            {/* Thông tin chung */}
                            <div className="relative bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/50 transition-all">
                                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-transparent blur-3xl rounded-full -mr-32 -mt-32"></div>
                                </div>

                                <div className="flex flex-col xl:flex-row flex-wrap justify-between items-center xl:items-center gap-8 relative z-10 w-full">
                                    <div className="flex flex-col md:flex-row flex-wrap items-center gap-6 w-full xl:w-auto xl:max-w-[65%]">
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
                                                <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 opacity-70" /> Khách hàng
                                                </p>
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

                                    <div className="hidden sm:block shrink-0">
                                        <ImageGallery images={order.imageUrl} />
                                    </div>
                                    
                                    <div className="absolute top-6 right-6 md:top-8 md:right-8 flex flex-col items-end gap-1.5 z-20">
                                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                                            <Clock className="w-3.5 h-3.5 opacity-70" /> Trạng thái
                                        </p>
                                        {getStatusBadge(order.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Personnel Section (Jira-style) */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/50 flex flex-wrap gap-8">
                                {/* Cố vấn dịch vụ */}
                                <div className="flex items-center gap-4">
                                    <BaseAvatar 
                                        id={order.nguoiPhuTrachId}
                                        src={order.saleAvatar}
                                        name={order.saleName}
                                        size="lg"
                                        showStatus={false}
                                        showBorder={false}
                                    />
                                    <div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1.5 mb-1">
                                            <UserCheck className="w-3 h-3" /> {ROLE_DISPLAY_NAMES.SALE}
                                        </div>
                                        <div className="font-bold text-slate-800 dark:text-white">
                                            {order.saleName}
                                        </div>
                                    </div>
                                </div>

                                {/* Quản đốc / Thợ chẩn đoán */}
                                <div className="flex items-center gap-4 sm:border-l sm:pl-8 border-slate-100 dark:border-slate-800">
                                    <BaseAvatar 
                                        id={order.thoChanDoanId}
                                        src={order.foremanAvatar}
                                        name={order.thoChanDoanName || 'Chưa chỉ định'}
                                        isUnassigned={!order.thoChanDoanId}
                                        size="lg"
                                        showStatus={false}
                                        showBorder={false}
                                    />
                                    <div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1.5 mb-1">
                                            <Wrench className="w-3 h-3" /> {ROLE_DISPLAY_NAMES.QUAN_LY_XUONG}
                                        </div>
                                        <div className={`font-bold ${order.thoChanDoanId ? 'text-slate-800 dark:text-white' : 'text-slate-400 italic'}`}>
                                            {order.thoChanDoanName || 'Chưa chỉ định'}
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
                            
                            <div className="transition-all">
                                <OrderItemsTable items={order.items} orderId={order.id} readOnly={isLocked} />
                            </div>
                        </div>

                        {/* Summary Sidebar (4/12) */}
                        <div className="xl:col-span-4 space-y-8 xl:sticky xl:top-8 self-start">
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

                            {order.receptionId && (
                                <div className="no-print">
                                    <Timeline receptionId={order.receptionId} />
                                </div>
                            )}

                            {/* Payment History In Brief */}
                            {transactions.length > 0 && (
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/50">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 px-1">Lịch sử thanh toán</h3>
                                    <div className="space-y-3">
                                        {transactions.map((t: any) => (
                                            <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{t.method}</p>
                                                    <p className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                                <p className="font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(t.amount)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Completed info */}
                            {isCompleted(order.status) && (
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
                                    <InvoicePrint order={{
                                        ...order,
                                        phone: order.customerPhone,
                                        paymentMethod: order.paymentStatus === 'PAID' ? 'DA_THANH_TOAN' : null,
                                        paymentDate: order.createdAt,
                                        items: order.items.map((i: any) => ({
                                            ...i,
                                            discountAmount: (i.unitPrice * i.quantity * i.discountPercent) / 100
                                        }))
                                    }} />
                                </div>
                            )}
                        </div>
                    </div>
                </OrderWorkspaceProvider>
            </div>
        </DashboardLayout>
    );
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <Suspense fallback={
            <DashboardLayout title="Hồ sơ Lệnh sửa chữa" subtitle="Đang tải dữ liệu...">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    <p className="text-slate-500 font-medium">Đang chuẩn bị hồ sơ đơn hàng...</p>
                </div>
            </DashboardLayout>
        }>
            <OrderDetailPageContent id={id} />
        </Suspense>
    );
}
