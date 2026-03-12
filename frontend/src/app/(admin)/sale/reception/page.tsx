'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DashboardLayout from '@/modules/common/components/layout/DashboardLayout';
import { Plus, FileText, Car, Printer, RefreshCw } from 'lucide-react';
import { EmptyState } from '@/modules/shared/components/ui/empty-state';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import CreateOrderButton from '@/modules/service/components/CreateOrderButton';
import { getStatusBadge } from '@/lib/status';
import { ReceptionListSkeleton } from '@/modules/service/components/ReceptionListSkeleton';
import { SearchInput } from '@/modules/shared/components/ui/search-input';

export default function ReceptionListPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { data: session } = useSession();

    const [receptions, setReceptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const searchKeyword = searchParams.get('q') || '';

    async function loadReceptions() {
        setLoading(true);
        try {
            // @ts-ignore
            const token = session?.user?.accessToken;
            if (!token) return;

            const res = await api.get('/reception', token);
            setReceptions(res || []);
        } catch (e) {
            console.error('Failed to fetch receptions', e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (session) {
            loadReceptions();
        }
    }, [session]);

    // Filter locally
    const filteredReceptions = receptions.filter(r =>
        r.XeBienSo?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        r.KhachHangName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        r.KhachHangPhone?.includes(searchKeyword)
    );

    return (
        <DashboardLayout title="Tiếp nhận xe" subtitle="Danh sách xe đã tiếp nhận">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <SearchInput
                            placeholder="Tìm theo biển số, tên KH..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadReceptions}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-5 h-5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <Link
                            href="/sale/reception/new"
                            className="bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Tiếp nhận xe mới
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <ReceptionListSkeleton />
                ) : filteredReceptions.length === 0 ? (
                    <div className="p-8 flex justify-center">
                        <EmptyState
                            title={searchKeyword ? 'Không tìm thấy kết quả nào' : 'Chưa có phiếu tiếp nhận nào'}
                            description={searchKeyword ? `Không tìm thấy phiếu nào khớp với từ khóa "${searchKeyword}"` : "Bắt đầu bằng cách tạo phiếu tiếp nhận mới cho khách hàng đến sửa chữa."}
                            icon={FileText}
                            actionLabel={!searchKeyword ? "Tạo phiếu ngay" : undefined}
                            onAction={!searchKeyword ? () => router.push('/sale/reception/new') : undefined}
                            className="border-none shadow-none bg-transparent"
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase transition-colors">
                                        <th className="px-2 py-3 text-center w-16">Ảnh</th>
                                        <th className="px-3 py-3 text-center w-28">Thời gian</th>
                                        <th className="px-3 py-3 text-center w-36">Biển số</th>
                                        <th className="px-3 py-3 text-left min-w-[150px]">Khách hàng</th>
                                        <th className="px-3 py-3 text-left w-40">Xe</th>
                                        <th className="px-3 py-3 text-center w-36">Trạng thái</th>
                                        <th className="px-3 py-3 text-center w-28">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredReceptions.map((r: any) => (
                                        <tr key={r.ID} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-2 py-3 text-center">
                                                {r.HinhAnh ? (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 mx-auto">
                                                        <img src={r.HinhAnh.split(',')[0]} alt="Xe" className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 mx-auto">
                                                        <Car className="w-4 h-4 opacity-40" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                                                        {new Date(r.NgayGio).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400">
                                                        {new Date(r.NgayGio).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <Link href={`/sale/reception/${r.ID}`} className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-indigo-600 transition-colors">
                                                    {r.XeBienSo}
                                                </Link>
                                            </td>
                                            <td className="px-3 py-3 text-left">
                                                <div className="font-medium text-sm text-slate-800 dark:text-slate-200">{r.KhachHangName}</div>
                                                <div className="text-[11px] text-slate-400 dark:text-slate-500">{r.KhachHangPhone}</div>
                                            </td>
                                            <td className="px-3 py-3 text-left">
                                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                                    {r.XeNhanHieu} {r.XeModel}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <div className="flex justify-center">
                                                    {r.DonHangSuaChua ? (
                                                        getStatusBadge(r.DonHangSuaChua.TrangThai)
                                                    ) : (
                                                        getStatusBadge('TIEP_NHAN')
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <div className="flex items-center justify-center">

                                                    {r.DonHangSuaChua ? (
                                                        <Link
                                                            href={`/sale/orders/${r.DonHangSuaChua.ID}?source=reception`}
                                                            className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-lg shadow-sm hover:translate-y-[-1px] transition-all"
                                                        >
                                                            Đơn hàng
                                                        </Link>
                                                    ) : (
                                                        <CreateOrderButton receptionId={r.ID} />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden grid grid-cols-1 gap-3 p-3">
                            {filteredReceptions.map((r: any) => (
                                <div key={r.ID} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-sm flex gap-3">
                                    {/* Image Left - Smaller on mobile */}
                                    <div className="flex-shrink-0">
                                        {r.HinhAnh ? (
                                            <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                                                <img src={r.HinhAnh.split(',')[0]} alt="Xe" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-14 h-14 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                                                <Car className="w-6 h-6 opacity-40" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Right */}
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Link href={`/sale/reception/${r.ID}`} className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-indigo-600 block leading-tight">
                                                    {r.XeBienSo}
                                                </Link>
                                                <p className="text-xs text-slate-500 line-clamp-1">{r.XeNhanHieu} {r.XeModel}</p>
                                            </div>
                                            {r.DonHangSuaChua ? (
                                                <div className="scale-90 origin-top-right">
                                                    {getStatusBadge(r.DonHangSuaChua.TrangThai)}
                                                </div>
                                            ) : (
                                                getStatusBadge('TIEP_NHAN')
                                            )}
                                        </div>

                                        <div className="text-xs text-slate-600 dark:text-slate-300">
                                            <p className="font-medium truncate">{r.KhachHangName}</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Thời gian</span>
                                                <span className="text-xs text-slate-600 dark:text-slate-300">
                                                    {new Date(r.NgayGio).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} <span className="text-slate-300">|</span> {new Date(r.NgayGio).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                </span>
                                            </div>

                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/sale/reception/${r.ID}?print=true`}
                                                    target="_blank"
                                                    className="p-1.5 text-slate-500 bg-slate-50 dark:bg-slate-800 rounded hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </Link>
                                                {r.DonHangSuaChua ? (
                                                    <Link
                                                        href={`/sale/orders/${r.DonHangSuaChua.ID}?source=reception`}
                                                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium text-xs rounded flex items-center hover:bg-indigo-100 transition-colors"
                                                    >
                                                        Đơn hàng &rarr;
                                                    </Link>
                                                ) : (
                                                    <CreateOrderButton receptionId={r.ID} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
