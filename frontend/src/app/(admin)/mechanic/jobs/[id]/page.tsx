import { DashboardLayout } from '@/modules/common/components/layout';
import { getJobDetails } from '@/modules/service/mechanic';
import { notFound } from 'next/navigation';
import { ArrowLeft, Car, User, Phone, Wrench, Package } from 'lucide-react';
import Link from 'next/link';
import JobItemCheckbox from './JobItemCheckbox';
import CompleteJobButton from './CompleteJobButton';
import UnclaimJobButton from './UnclaimJobButton';
import ClaimJobButton from './ClaimJobButton';
import MechanicProductSearch from '@/modules/mechanic/components/MechanicProductSearch';
import JoinItemButton from './JoinItemButton';
import AssignmentList from './AssignmentList';
import DepositWarning from '@/modules/mechanic/components/DepositWarning';
import { auth } from '@/lib/auth';
import ParticipationSummary from './ParticipationSummary';
import MechanicLimitSelector from './MechanicLimitSelector';

export default async function JobDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) return notFound();

    const [job, session] = await Promise.all([
        getJobDetails(orderId),
        auth()
    ]);
    if (!job) return notFound();

    const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;
    const isClaimedByMe = job.claimedById === currentUserId;

    const progress = job.totalItems > 0
        ? Math.round((job.completedItems / job.totalItems) * 100)
        : 0;

    const allCompleted = job.completedItems === job.totalItems && job.totalItems > 0;
    const isJobActive = !['CHO_THANH_TOAN', 'HOAN_THANH', 'DONG', 'HUY'].includes(job.status || '');

    const resolvedSearchParams = await searchParams;
    const source = resolvedSearchParams?.source;
    const backLink = source === 'history' ? '/mechanic/history' : (isJobActive ? '/mechanic/jobs' : '/mechanic/history');
    const backText = source === 'history' ? 'Quay lại lịch sử' : 'Quay lại danh sách';

    return (
        <DashboardLayout title="Chi tiết công việc" subtitle={`Đơn hàng #${job.id}`}>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link href={backLink} className="flex items-center gap-2 text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="w-4 h-4" /> {backText}
                    </Link>
                    <div className="flex items-center gap-3">
                        {isJobActive && (
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

                {/* Participation Summary */}
                <ParticipationSummary
                    items={job.items}
                    jobLead={job.claimedByName}
                    isLead={isClaimedByMe}
                    currentUserId={currentUserId}
                />

                {/* Danh sách hạng mục */}
                {/* Deposit Warning */}
                <DepositWarning deposit={job.tienCoc} total={job.tongCong} />

                {/* Danh sách hạng mục */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Alert Info for Unclaimed Job - Only show if Active */}
                    {!isClaimedByMe && isJobActive && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-xl mb-6 shadow-sm flex items-center gap-3">
                            <Wrench className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            <div>
                                <p className="font-medium">Bạn chưa nhận công việc này.</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Vui lòng bấm nút "Nhận việc này" ở góc trên bên phải để bắt đầu làm việc.</p>
                            </div>
                        </div>
                    )}

                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Danh sách công việc</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Đánh dấu hoàn thành khi thực hiện xong từng hạng mục
                            </p>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {job.items.map((item, idx) => {
                            const isAssignedToMe = item.assignments.some(a => a.mechanicId === currentUserId);
                            const canJoin = job.claimedById && !isAssignedToMe && !item.isCompleted && isJobActive;

                            // Check deposit safe for actions
                            const depositSafe = !job.tongCong || job.tongCong <= 5000000 || (job.tienCoc >= job.tongCong * 0.3);

                            return (
                                <div
                                    key={item.id}
                                    className={`px-6 py-4 ${item.isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''} ${!isClaimedByMe && !isAssignedToMe ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <JobItemCheckbox
                                                itemId={item.id}
                                                isCompleted={item.isCompleted}
                                                disabled={(!isClaimedByMe && !isAssignedToMe) || !depositSafe || !isJobActive}
                                            />
                                            <div className="flex-1">
                                                <p className={`font-medium ${item.isCompleted ? 'text-emerald-800 dark:text-emerald-400 line-through decoration-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                                    {item.productName}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                    <span>Mã: {item.productCode}</span>
                                                    <span>•</span>
                                                    <span>SL: {item.quantity}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col items-end gap-2">
                                            {/* Completed By Badge */}
                                            {item.isCompleted && item.completedByName && (
                                                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2 py-1 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                                                    <div
                                                        className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold"
                                                        title={item.completedByName}
                                                    >
                                                        {item.completedByName.charAt(0)}
                                                    </div>
                                                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                                        {item.completedById === currentUserId ? 'Bạn' : item.completedByName}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Join Button */}
                                            {canJoin && (
                                                <JoinItemButton itemId={item.id} disabled={!depositSafe} isLead={isClaimedByMe} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Báo phát sinh (Chỉ cho thợ đã nhận việc và đang sửa chữa) */}
                {isClaimedByMe && isJobActive && (
                    <MechanicProductSearch orderId={job.id} />
                )}

                {/* Footer Action */}
                {/* For Repair Lead: Send to QC */}
                {
                    isClaimedByMe && allCompleted && isJobActive && job.status === 'DANG_SUA' && (
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
                    job.status === 'CHO_KCS' && (
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
                                    label="Từ chối (Làm lại)"
                                    className="bg-red-600 hover:bg-red-700 text-white shadow-xl text-lg px-8 py-3 rounded-xl transition-transform hover:scale-105"
                                />
                            </div>
                        </div>
                    )
                }
            </div >
        </DashboardLayout >
    );
}
