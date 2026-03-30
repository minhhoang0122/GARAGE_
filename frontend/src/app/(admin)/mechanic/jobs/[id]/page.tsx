'use client';

import { DashboardLayout } from '@/modules/common/components/layout';
import { notFound, useSearchParams } from 'next/navigation';
import { ArrowLeft, Car, User, Phone, Wrench, Package, CheckCircle2, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';
import JobItemCheckbox from './JobItemCheckbox';
import CompleteJobButton from './CompleteJobButton';
import UnclaimJobButton from './UnclaimJobButton';
import ClaimJobButton from './ClaimJobButton';
import MechanicProductSearch from '@/modules/mechanic/components/MechanicProductSearch';
import DepositWarning from '@/modules/mechanic/components/DepositWarning';
import { useSession } from 'next-auth/react';
import { useJobDetails } from '@/modules/mechanic/hooks/useMechanic';
import { useRealtimeUpdate } from '@/hooks/useRealtimeUpdate';
import { use } from 'react';
import Timeline from '@/modules/shared/components/common/Timeline';
import { 
    isApproved, 
    isInProgress, 
    isWaitingForQC, 
    isCompleted,
    isClosed,
    isCancelled,
    isWaitingPayment
} from '@/lib/status';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const orderId = parseInt(id);
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    
    const { data: job, isLoading, isError } = useJobDetails(orderId);
    
    // Realtime Sync
    useRealtimeUpdate(['mechanic', 'job', orderId], { refId: orderId });


    if (isNaN(orderId)) return notFound();
    if (isLoading) {
        return (
            <DashboardLayout title="Chi tiết công việc" subtitle={`Đơn hàng #${id}`}>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </DashboardLayout>
        );
    }
    if (isError || !job) return notFound();

    const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;
    const isClaimedByMe = job.claimedById === currentUserId;

    const progress = (job?.totalItems || 0) > 0
        ? Math.round(((job?.completedItems || 0) / (job?.totalItems || 0)) * 100)
        : 0;

    const allCompleted = (job?.completedItems || 0) === (job?.totalItems || 0) && (job?.totalItems || 0) > 0;
    const isJobActive = !(
        isWaitingPayment(job.status) || 
        isCompleted(job.status) || 
        isClosed(job.status) || 
        isCancelled(job.status)
    );

    const source = searchParams.get('source');
    const backLink = source === 'history' ? '/mechanic/history' : (isJobActive ? '/mechanic/jobs' : '/mechanic/history');
    const backText = source === 'history' ? 'Quay lại lịch sử' : 'Quay lại danh sách';

    return (
        <DashboardLayout title="Chi tiết công việc" subtitle={`Đơn hàng #${job.id}`}>
            <div className="max-w-[1800px] mx-auto pb-20 px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link href={backLink} className="flex items-center gap-2 text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="w-4 h-4" /> {backText}
                    </Link>
                    <div className="flex items-center gap-3">
                        {/* Chỉ Quản đốc mới thấy nút phân công */}
                        {session?.user?.roles?.includes('QUAN_LY_XUONG') && (
                            <Link
                                href={`/mechanic/assign/${job.id}`}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition-all border border-blue-200"
                            >
                                <Wrench className="w-4 h-4" /> Chia việc
                            </Link>
                        )}
                        {isJobActive && isApproved(job.status) && (
                            <ClaimJobButton
                                orderId={job.id}
                                claimedByName={job.claimedByName}
                                isClaimedByMe={isClaimedByMe}
                            />
                        )}
                        {isClaimedByMe && isJobActive && (
                            <>
                                <UnclaimJobButton orderId={job.id} completedItems={job.completedItems} />
                                <CompleteJobButton orderId={job.id} disabled={!allCompleted} className="hidden md:flex" />
                            </>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Tiến độ công việc</h3>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {job.completedItems}/{job.totalItems} hạng mục ({progress}%)
                        </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {allCompleted && isJobActive && (
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                            Tất cả hạng mục đã hoàn thành! Bấm "Hoàn thành đơn" để chuyển cho Thu ngân.
                        </p>
                    )}
                    {allCompleted && !isJobActive && (
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                            Đơn hàng đã hoàn thành.
                        </p>
                    )}
                </div>

                {/* Thông tin xe & khách */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                                <Car className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Thông tin xe
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex">
                                    <span className="text-slate-500 dark:text-slate-400 w-24">Biển số:</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-100 text-lg">{job.plate}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-slate-500 dark:text-slate-400 w-24">Hãng xe:</span>
                                    <span className="text-slate-800 dark:text-slate-200">{job.vehicleBrand} {job.vehicleModel}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                                <User className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Thông tin khách
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex">
                                    <span className="text-slate-500 dark:text-slate-400 w-24">Họ tên:</span>
                                    <span className="text-slate-800 dark:text-slate-200">{job.customerName}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-slate-500 dark:text-slate-400 w-24">SĐT:</span>
                                    <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" /> {job.customerPhone}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {job.request && (
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Yêu cầu của khách:</p>
                            <p className="text-sm text-amber-700 dark:text-amber-300">{job.request}</p>
                        </div>
                    )}

                </div>



                {/* Danh sách hạng mục */}
                {/* Deposit Warning */}
                <DepositWarning deposit={job.tienCoc} total={job.tongCong} />

                {/* Danh sách hạng mục - Tách 3 bảng riêng biệt */}
                <div className="space-y-6">
                    {(() => {
                        const diagnosticItems = job.items.filter((i: any) => !i.isTechnicalAddition && i.proposedByRole !== 'SALE');
                        const additionItems = job.items.filter((i: any) => i.isTechnicalAddition || i.proposedByRole === 'SALE');

                        // Tổng hợp danh sách thợ tham gia
                        const allAssignmentsMap = new Map<number, {
                            mechanicId: number;
                            mechanicName: string;
                            tasks: string[];
                            isMain: boolean;
                        }>();

                        job.items.forEach((item: any) => {
                            item.assignments?.forEach((a: any) => {
                                if (!allAssignmentsMap.has(a.mechanicId)) {
                                    allAssignmentsMap.set(a.mechanicId, {
                                        mechanicId: a.mechanicId,
                                        mechanicName: a.mechanicName,
                                        tasks: [item.productName],
                                        isMain: a.isMain
                                    });
                                } else {
                                    const record = allAssignmentsMap.get(a.mechanicId)!;
                                    if (!record.tasks.includes(item.productName)) {
                                        record.tasks.push(item.productName);
                                    }
                                    if (a.isMain) record.isMain = true;
                                }
                            });
                        });

                        const mechanicList = Array.from(allAssignmentsMap.values());

                        const renderItem = (item: any) => {
                            const isAssignedToMe = item.assignments?.some((a: any) => a.mechanicId === currentUserId);
                            const depositSafe = !job.tongCong || job.tongCong <= 5000000 || (job.tienCoc >= job.tongCong * 0.3);

                            return (
                                <div
                                    key={item.id}
                                    className={`px-6 py-4 transition-colors ${item.isCompleted ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''} ${!isClaimedByMe && !isAssignedToMe ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <JobItemCheckbox
                                                itemId={item.id}
                                                orderId={orderId}
                                                isCompleted={item.isCompleted}
                                                disabled={!isAssignedToMe || !depositSafe || !isJobActive}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-bold ${item.isCompleted ? 'text-emerald-800 dark:text-emerald-400 line-through decoration-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                                        {item.productName}
                                                    </p>
                                                    {item.isTechnicalAddition && (
                                                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-black uppercase rounded border border-purple-200">Phát sinh</span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                    <span>Mã: {item.productCode}</span>
                                                    <span>•</span>
                                                    <span>SL: {item.quantity}</span>
                                                    {item.proposedByName && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="italic text-[11px]">Đề xuất: <span className="font-bold text-slate-600 dark:text-slate-300">{item.proposedByRole === 'AI' ? 'AI Chẩn đoán' : item.proposedByName}</span></span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            {/* Completed Badge */}
                                            {item.isCompleted && (
                                                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mt-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Đã xong
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        };

                        const renderSection = (items: any[], title: string, icon: any, color: string, description: string) => (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between ${color === 'amber' ? 'bg-amber-50/30' : 'bg-slate-50/30'}`}>
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-lg ${color === 'amber' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {icon}
                                            </div>
                                            <h2 className="font-black text-[12px] uppercase tracking-wider text-slate-800 dark:text-slate-100">{title} ({items.length})</h2>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium ml-10">{description}</p>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {items.map(renderItem)}
                                </div>
                            </div>
                        );

                        return (
                            <>
                                {diagnosticItems.length > 0 && renderSection(
                                    diagnosticItems, 
                                    "1. Chẩn đoán chuyên môn", 
                                    <Package className="w-4 h-4" />, 
                                    "blue",
                                    "Các hạng mục do Quản đốc hoặc AI đề xuất ban đầu"
                                )}
                                {additionItems.length > 0 && renderSection(
                                    additionItems, 
                                    "2. Yêu cầu bổ sung & Sale", 
                                    <Wrench className="w-4 h-4" />, 
                                    "amber",
                                    "Các hạng mục do khách hàng yêu cầu thêm hoặc phát sinh kỹ thuật"
                                )}

                                {mechanicList.length > 0 && (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <User className="w-5 h-5 text-slate-600" />
                                                <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase text-[11px] tracking-widest">
                                                    3. Nhân sự thực hiện ({mechanicList.length})
                                                </h3>
                                            </div>
                                            {(session?.user?.roles?.includes('ADMIN') || session?.user?.roles?.includes('QUAN_LY_XUONG')) && (
                                                <Link
                                                    href={`/mechanic/assign/${orderId}`}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm"
                                                >
                                                    <Wrench className="w-3.5 h-3.5" /> Điều phối ngay
                                                </Link>
                                            )}
                                        </div>
                                        <div className="w-full">
                                            <table className="w-full text-sm table-fixed">
                                                <thead>
                                                    <tr className="bg-slate-50/30 border-b border-slate-100 dark:border-slate-800">
                                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left w-[150px] md:w-[200px]">Nhân viên</th>
                                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left w-auto">Hạng mục đảm nhận</th>
                                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-[80px] md:w-[120px]">Vai trò</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {mechanicList.map((m: any) => (
                                                        <tr key={m.mechanicId}>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200 dark:border-slate-700">
                                                                        {m.mechanicName.charAt(0)}
                                                                    </div>
                                                                    <span className={`font-bold ${m.mechanicId === currentUserId ? 'text-blue-600 dark:text-blue-400 underline decoration-2' : 'text-slate-700 dark:text-slate-300'}`}>
                                                                        {m.mechanicId === currentUserId ? 'BẠN' : m.mechanicName}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {m.tasks.map((t: string, idx: number) => (
                                                                        <span key={idx} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold border border-blue-100/50 dark:border-blue-800/50">
                                                                            {t}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${m.isMain ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                                                                    {m.isMain ? 'Thợ chính' : 'Hỗ trợ'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>

                {/* Báo phát sinh (Chỉ cho thợ đã nhận việc và đang sửa chữa) */}
                {isClaimedByMe && isJobActive && (
                    <MechanicProductSearch orderId={job.id} />
                )}

                {/* Footer Action */}
                {
                    isClaimedByMe && allCompleted && isJobActive && isInProgress(job.status) && (
                        <div className="mt-8 mb-12 flex justify-center animate-in fade-in zoom-in duration-500">
                            <CompleteJobButton
                                orderId={job.id}
                                label="Hoàn thành & Gửi Nghiệm Thu"
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl text-lg px-8 py-4 rounded-xl transition-transform hover:scale-105"
                            />
                        </div>
                    )
                }

                {/* For QC (Diagnostic Mechanic or Admin) */}
                {
                    isWaitingForQC(job.status) && (
                        <div className="mt-8 mb-12 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-6 py-4 rounded-xl shadow-sm flex items-center gap-3 mb-4">
                                <Wrench className="w-5 h-5" />
                                <div>
                                    <p className="font-bold">Đang chờ Nghiệm thu (QC)</p>
                                    <p className="text-sm">Vui lòng kiểm tra xe trước khi duyệt.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <CompleteJobButton
                                    orderId={job.id}
                                    isQC={true}
                                    qcAction="pass"
                                    label="Duyệt (Đạt)"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl text-lg px-8 py-3 rounded-xl transition-transform hover:scale-105"
                                />
                                <CompleteJobButton
                                    orderId={job.id}
                                    isQC={true}
                                    qcAction="fail"
                                    />
                            </div>
                        </div>
                    )
                }

                {/* Timeline - Nhật ký xe */}
                {job.receptionId && (
                    <div className="mt-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-slate-500" />
                            <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase text-[11px] tracking-widest">
                                Nhật ký & Trao đổi công việc
                            </h3>
                        </div>
                        <Timeline receptionId={job.receptionId} />
                    </div>
                )}
            </div >
        </DashboardLayout >
    );
}
