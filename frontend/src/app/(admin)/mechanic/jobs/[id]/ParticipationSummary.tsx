import { Wrench, CheckCircle2, Users, ClipboardList } from "lucide-react";
import AssignmentList from "./AssignmentList";
import { isAssignApproved, isAssignCompleted } from "@/lib/status";

interface ParticipationSummaryProps {
    items: any[];
    jobLead?: string | null;
    isLead: boolean;
    currentUserId: number | null;
}

export default function ParticipationSummary({ items, jobLead, isLead, currentUserId }: ParticipationSummaryProps) {
    // 1. Group items by mechanic for the summary view
    const mechanicWork: Record<string, any[]> = {};
    (items || []).forEach(item => {
        if (item.assignments && item.assignments.length > 0) {
            item.assignments.forEach((assign: any) => {
                if (isAssignApproved(assign.status) || isAssignCompleted(assign.status)) {
                    if (!mechanicWork[assign.mechanicName]) mechanicWork[assign.mechanicName] = [];
                    mechanicWork[assign.mechanicName].push({
                        name: item.productName,
                        role: assign.isMain ? 'Thợ chính' : `Thợ phụ (${assign.percentage}%)`,
                        code: item.productCode
                    });
                }
            });
        }
    });

    const mechanics = Object.keys(mechanicWork);

    return (
        <div className="space-y-6 mb-6">
            {/* Team Management Section (Only for Lead/Management roles) */}
            {isLead && (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            Quản lý & Phân công đội ngũ
                        </h3>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Dành cho Quản lý</span>
                    </div>

                    <div className="p-6">
                        <div className="space-y-6">
                            {(items || []).map(item => {
                                return (
                                    <div key={item.id} className="group relative">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                            <div className="flex items-start gap-2">
                                                <ClipboardList className="w-4 h-4 text-slate-400 mt-1" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{item.productName}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-tight">{item.productCode} • SL: {item.quantity}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Nested Assignment List for Management */}
                                        <div className="pl-6">
                                            <AssignmentList
                                                itemId={item.id}
                                                assignments={item.assignments || []}
                                                isLead={true}
                                                currentUserId={currentUserId}
                                                isItemCompleted={item.isCompleted}
                                            />
                                        </div>

                                        {/* Separator line except for last item */}
                                        <div className="h-[1px] bg-slate-100 dark:bg-slate-800 mt-6 group-last:hidden" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}


            {/* Approved Work Summary View (Combined for all users) */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                    <Wrench className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    Báo cáo phân bổ công việc
                </h3>

                {mechanics.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">Chưa có thợ nào được phê duyệt bắt đầu làm việc.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mechanics.map(mechName => (
                            <div key={mechName} className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4 border border-slate-100 dark:border-slate-800/50">
                                <div className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center justify-between">
                                    <span>{mechName}</span>
                                    {mechName === jobLead && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase">Trưởng nhóm</span>}
                                </div>
                                <ul className="space-y-3">
                                    {mechanicWork[mechName].map((task, idx) => (
                                        <li key={idx} className="text-xs flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-slate-700 dark:text-slate-300 font-medium">{task.name}</p>
                                                <p className="text-[10px] text-slate-500">{task.role}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
