import { Badge } from "@/modules/shared/components/ui/badge";

export const STATUS_MAPPING: Record<string, { label: string; color: string; badgeClassName?: string; variant?: "default" | "secondary" | "destructive" | "outline" }> = {
    // ===== Standard Order Lifecycle (Backend Enums) =====
    // ===== Standard Order Lifecycle (Backend Enums) =====
    'NEW': { label: 'Đã tiếp nhận', color: 'bg-blue-100 text-blue-800' },
    'RECEIVED': { label: 'Đã tiếp nhận', color: 'bg-blue-100 text-blue-800' },
    'TIEP_NHAN': { label: 'Đã tiếp nhận', color: 'bg-blue-100 text-blue-800' },
    
    'WAITING_FOR_DIAGNOSIS': { label: 'Chờ chẩn đoán', color: 'bg-amber-100 text-amber-800' },
    'CHO_CHAN_DOAN': { label: 'Chờ chẩn đoán', color: 'bg-amber-100 text-amber-800' },
    
    'QUOTING': { label: 'Đang báo giá', color: 'bg-indigo-100 text-indigo-800' },
    'BAO_GIA': { label: 'Đang báo giá', color: 'bg-indigo-100 text-indigo-800' },
    
    'WAITING_FOR_CUSTOMER_APPROVAL': { label: 'Chờ khách duyệt', color: 'bg-orange-100 text-orange-800' },
    'CHO_KH_DUYET': { label: 'Chờ khách duyệt', color: 'bg-orange-100 text-orange-800' },
    
    'APPROVED': { label: 'Đã chốt đơn', color: 'bg-green-100 text-green-800' },
    'DA_DUYET': { label: 'Đã chốt đơn', color: 'bg-green-100 text-green-800' },
    
    'IN_PROGRESS': { label: 'Đang sửa chữa', color: 'bg-blue-500 text-white' },
    'DANG_SUA': { label: 'Đang sửa chữa', color: 'bg-blue-500 text-white' },
    
    'WAITING_FOR_QC': { label: 'Chờ nghiệm thu', color: 'bg-purple-100 text-purple-800' },
    'CHO_KCS': { label: 'Chờ nghiệm thu', color: 'bg-purple-100 text-purple-800' },
    'CHO_NGHIEM_THU': { label: 'Chờ nghiệm thu', color: 'bg-purple-100 text-purple-800' },
    
    'COMPLETED': { label: 'Chờ thanh toán', color: 'bg-emerald-100 text-emerald-800' },
    'DA_HOAN_THANH': { label: 'Chờ thanh toán', color: 'bg-emerald-100 text-emerald-800' },
    'WAITING_FOR_PAYMENT': { label: 'Chờ thanh toán', color: 'bg-emerald-100 text-emerald-800' },
    
    'CLOSED': { label: 'Đã quyết toán', color: 'bg-slate-100 text-slate-800' },
    'DA_QUYET_TOAN': { label: 'Đã quyết toán', color: 'bg-slate-100 text-slate-800' },
    'SETTLED': { label: 'Đã quyết toán', color: 'bg-slate-100 text-slate-800' },
    
    'CANCELLED': { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
    'DA_HUY': { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
    'HUY': { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
    
    'DIAGNOSING': { label: 'Đang chẩn đoán', color: 'bg-cyan-100 text-cyan-800' },
    'DANG_CHAN_DOAN': { label: 'Đang chẩn đoán', color: 'bg-cyan-100 text-cyan-800' },

    // ===== Item / Assignment Specific =====
    'PENDING': { label: 'Đang chờ', color: 'bg-amber-100 text-amber-800' },
    'PROPOSAL': { label: 'Đang đề xuất', color: 'bg-blue-100 text-blue-800' },
    'DE_XUAT': { label: 'Đang đề xuất', color: 'bg-blue-100 text-blue-800' },
    'DA_XUAT_KHO': { label: 'Đã xuất kho', color: 'bg-blue-100 text-blue-800' },
    'CHO_XUAT': { label: 'Chờ xuất kho', color: 'bg-yellow-100 text-yellow-800' },

};

export function getStatusBadge(status: string) {
    const config = STATUS_MAPPING[status] || { label: status, color: 'bg-slate-100 text-slate-800' };

    // High Legibility "Pro" style for Dark Mode
    let darkClass = "dark:bg-slate-800/50 dark:text-slate-200 dark:border-slate-700";

    if (['DA_DUYET', 'APPROVED', 'ACTIVE', 'HOAN_THANH', 'COMPLETED', 'SETTLED'].includes(status))
        darkClass = "dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/50 dark:shadow-[0_0_12px_rgba(16,185,129,0.05)]";
    if (['DANG_SUA', 'IN_PROGRESS', 'CHO_SUA_CHUA', 'RECEIVED', 'TIEP_NHAN', 'PROPOSAL', 'DE_XUAT'].includes(status))
        darkClass = "dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/50 dark:shadow-[0_0_12px_rgba(99,102,241,0.05)]";
    if (['CHO_THAN_TOAN', 'WAITING_FOR_PAYMENT', 'CHO_KH_DUYET', 'WAITING_FOR_CUSTOMER_APPROVAL', 'BAO_GIA_LAI', 'RE_QUOTATION', 'BAO_GIA', 'QUOTING'].includes(status))
        darkClass = "dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/50 dark:shadow-[0_0_12px_rgba(249,115,22,0.05)]";
    if (['HUY', 'CANCELLED', 'EXPIRED', 'KHACH_TU_CHOI', 'CUSTOMER_REJECTED'].includes(status))
        darkClass = "dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/50 dark:shadow-[0_0_12px_rgba(239,68,68,0.05)]";
    if (['DIAGNOSING', 'DANG_CHAN_DOAN'].includes(status))
        darkClass = "dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/50 dark:shadow-[0_0_12px_rgba(6,182,212,0.05)]";

    return (
        <span className={`
            inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap shrink-0
            ${config.color} 
            ${darkClass}
            transition-all duration-300
        `}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-80 shrink-0"></span>
            {config.label}
        </span>
    );
}

// Helper to get just the text label
export function getStatusLabel(status: string) {
    return STATUS_MAPPING[status]?.label || status;
}

/**
 * LEGACY-AWARE STATUS CHECKERS
 * These helpers support both old Vietnamese keys and new English Enum names.
 * Use these instead of direct string comparisons like `status === 'DA_DUYET'`.
 */

export const isApproved = (status?: string) => 
    status === 'DA_DUYET' || status === 'APPROVED';

export const isRejected = (status?: string) => 
    status === 'KHACH_TU_CHOI' || status === 'CUSTOMER_REJECTED';

export const isReceived = (status?: string) => 
    status === 'TIEP_NHAN' || status === 'RECEIVED' || status === 'NEW';

export const isWaitingDiagnosis = (status?: string) => 
    status === 'CHO_CHAN_DOAN' || status === 'WAITING_FOR_DIAGNOSIS' || status === 'DIAGNOSING' || status === 'DANG_CHAN_DOAN';

export const isDiagnosing = (status?: string) =>
    status === 'DIAGNOSING' || status === 'DANG_CHAN_DOAN';

export const isQuoting = (status?: string) => 
    status === 'BAO_GIA' || status === 'QUOTING' || status === 'BAO_GIA_LAI' || status === 'RE_QUOTATION';

export const isWaitingForCustomer = (status?: string) => 
    status === 'CHO_KH_DUYET' || status === 'WAITING_FOR_CUSTOMER_APPROVAL';

export const isWaitingForRepair = (status?: string) => 
    status === 'CHO_SUA_CHUA' || status === 'DA_DUYET' || status === 'APPROVED';

export const isInProgress = (status?: string) => 
    status === 'DANG_SUA' || status === 'IN_PROGRESS';

export const isWaitingForQC = (status?: string) => 
    status === 'CHO_KCS' || status === 'WAITING_FOR_QC' || status === 'CHO_NGHIEM_THU';

export const isCompleted = (status?: string) => 
    status === 'HOAN_THANH' || status === 'COMPLETED' || status === 'SETTLED';

export const isClosed = (status?: string) => 
    status === 'DONG' || status === 'CLOSED' || status === 'HUY' || status === 'CANCELLED';

export const isWaitingPayment = (status?: string) => 
    status === 'CHO_THAN_TOAN' || status === 'WAITING_FOR_PAYMENT';

export const isCancelled = (status?: string) => 
    status === 'HUY' || status === 'CANCELLED';

/**
 * Business Logic Groupings
 */
export const isPostApproval = (status?: string) => {
    if (!status) return false;
    // Bất kỳ trạng thái nào KHÔNG phải là các trạng thái tiền-duyệt (pre-approval)
    const preApprovalStatuses = [
        'TIEP_NHAN', 'RECEIVED', 'NEW',
        'CHO_CHAN_DOAN', 'WAITING_FOR_DIAGNOSIS',
        'BAO_GIA', 'QUOTING',
        'BAO_GIA_LAI', 'RE_QUOTATION',
        'CHO_KH_DUYET', 'WAITING_FOR_CUSTOMER_APPROVAL',
        'DE_XUAT', 'PROPOSAL'
    ];
    return !preApprovalStatuses.includes(status);
};

/**
 * ASSIGNMENT STATUS CHECKERS
 * Used for individual item assignments to mechanics.
 */
export const isAssignPending = (status?: string) => 
    status === 'PENDING' || status === 'CHO_DUYET';

export const isAssignApproved = (status?: string) => 
    status === 'APPROVED' || status === 'DA_DUYET';

export const isAssignCompleted = (status?: string) => 
    status === 'COMPLETED' || status === 'HOAN_THANH';
// Item status helpers
export const isItemPending = (status?: string | null) => 
    !status || status === 'PENDING' || status === 'CHO_THUC_HIEN' || status === 'CHỜ_THỰC_HIỆN' || status === 'RECEIVED' || status === 'WAITING_FOR_DIAGNOSIS' || status === 'PROPOSAL' || status === 'DE_XUAT';

export const isItemInProgress = (status?: string | null) => 
    status === 'IN_PROGRESS' || status === 'DANG_THUC_HIEN' || status === 'ĐANG_THỰC_HIỆN' || status === 'DOING' || status === 'DANG_SUA';

export const isItemCompleted = (status?: string | null) => 
    status === 'COMPLETED' || status === 'HOAN_THANH' || status === 'HOÀN_THÀNH' || status === 'DONE' || status === 'DA_HOAN_THANH';

export const isItemCancelled = (status?: string | null) => 
    status === 'CANCELLED' || status === 'DA_HUY' || status === 'ĐÃ_HỦY';

export const isItemRejected = (status?: string | null) => 
    status === 'REJECTED' || status === 'TU_CHOI' || status === 'TỪ_CHỐI' || status === 'CUSTOMER_REJECTED' || status === 'KHACH_TU_CHOI';

export const isItemApproved = (status?: string | null) => 
    status === 'APPROVED' || status === 'KHACH_DONG_Y' || status === 'CUSTOMER_APPROVED';

export const isItemExported = (status?: string | null) =>
    status === 'EXPORTED' || status === 'DA_XUAT_KHO';
