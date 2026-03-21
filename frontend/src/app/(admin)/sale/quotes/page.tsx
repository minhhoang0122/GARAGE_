import { DashboardLayout } from '@/modules/common/components/layout';
import Link from 'next/link';
import { FileText, Search, ArrowRight } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { getStatusBadge } from '@/lib/status';

export default async function QuotesListPage() {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;

    let quotes = [];
    if (token) {
        try {
            // Fetch all active quote statuses: Received, Quoting, Re-Quoting, Waiting Approval
            quotes = await api.get('/sale/orders?status=TIEP_NHAN,BAO_GIA,BAO_GIA_LAI,CHO_KH_DUYET', token);
        } catch (e) {
            console.error('Failed to fetch quotes', e);
        }
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val));

    return (
        <DashboardLayout title="Quản lý Báo giá" subtitle="Danh sách báo giá đang thực hiện">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                {/* Filter / Search */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm theo biển số, tên khách..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                    </div>
                </div>

                {quotes.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                            <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Không có báo giá đang chờ</h3>
                        <p className="max-w-md mx-auto">Tất cả xe tiếp nhận đã được chốt báo giá hoặc chưa có phiếu tiếp nhận nào mới.</p>
                    </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="data-table w-full text-left min-w-[800px] table-fixed">
                        <thead>
                            <tr className="bg-stone-100 dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800 text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-widest transition-colors">
                                <th className="w-[80px] px-4 py-4 !text-left">Mã</th>
                                <th className="w-[160px] px-4 py-4 !text-left">Thời gian tạo</th>
                                <th className="w-[120px] px-4 py-4 !text-left">Biển số</th>
                                <th className="px-4 py-4 !text-left">Khách hàng</th>
                                <th className="w-[150px] px-4 py-4 !text-left">Trạng thái</th>
                                <th className="w-[150px] px-4 py-4 !text-right">Tổng dự toán</th>
                                <th className="w-[100px] px-4 py-4 !text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-transparent">
                            {quotes.map((quote: any) => (
                                <tr key={quote.id} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                                    <td className="px-4 py-4 font-bold text-stone-900 dark:text-slate-100 border-b border-stone-100 dark:border-slate-800">
                                        #{quote.id}
                                    </td>
                                    <td className="px-4 py-4 text-stone-600 dark:text-slate-400 border-b border-stone-100 dark:border-slate-800 tabular-nums">
                                        {new Date(quote.createdAt).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-4 py-4 font-black text-stone-800 dark:text-slate-100 border-b border-stone-100 dark:border-slate-800">
                                        {quote.plate}
                                    </td>
                                    <td className="px-4 py-4 truncate text-stone-900 dark:text-slate-100 border-b border-stone-100 dark:border-slate-800 font-medium">
                                        {quote.customerName}
                                    </td>
                                    <td className="px-4 py-4 border-b border-stone-100 dark:border-slate-800">
                                        {getStatusBadge(quote.status)}
                                    </td>
                                    <td className="px-4 py-4 text-right font-black text-stone-900 dark:text-slate-100 border-b border-stone-100 dark:border-slate-800 tabular-nums">
                                        {formatCurrency(Number(quote.grandTotal)).replace('₫', '').trim()}
                                    </td>
                                    <td className="px-4 py-4 text-right border-b border-stone-100 dark:border-slate-800">
                                        <Link
                                            href={`/sale/orders/${quote.id}`}
                                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-black text-[12px] uppercase tracking-tighter transition-all group-hover:gap-2"
                                        >
                                            Tiếp tục <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}
            </div>
        </DashboardLayout>
    );
}
