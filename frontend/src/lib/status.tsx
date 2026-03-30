import { Badge } from "@/modules/shared/components/ui/badge";

export const STATUS_MAPPING: Record<string, { label: string; color: string; variant?: "default" | "secondary" | "destructive" | "outline" }> = {
    // Sales / Reception Flow
    'TIEP_NHAN': { label: 'Đã Tiếp Nhận', color: 'bg-blue-100 text-blue-800' },
    'RECEIVED': { label: 'Đã Tiếp Nhận', color: 'bg-blue-100 text-blue-800' },
    'NEW': { label: 'Đã Tiếp Nhận', color: 'bg-blue-100 text-blue-800' },
    'CHO_CHAN_DOAN': { label: 'Chờ Chẩn Đoán', color: 'bg-yellow-100 text-yellow-800' },
    'WAITING_FOR_DIAGNOSIS': { label: 'Chờ Chẩn Đoán', color: 'bg-yellow-100 text-yellow-800' },
    'BAO_GIA': { label: 'Đang Báo Giá', color: 'bg-amber-100 text-amber-800' },
    'QUOTING': { label: 'Đang Báo Giá', color: 'bg-amber-100 text-amber-800' },
    'BAO_GIA_LAI': { label: 'Báo Giá Lại', color: 'bg-orange-100 text-orange-800' },
    'RE_QUOTATION': { label: 'Yêu Cầu Báo Giá Lại', color: 'bg-orange-100 text-orange-800' },
    'CHO_KH_DUYET': { label: 'Chờ KH Duyệt', color: 'bg-orange-100 text-orange-800' },
    'WAITING_FOR_CUSTOMER_APPROVAL': { label: 'Chờ Khách Duyệt', color: 'bg-orange-100 text-orange-800' },
    'KHACH_TU_CHOI': { label: 'Khách Từ Chối', color: 'bg-red-100 text-red-800' },
    'CUSTOMER_REJECTED': { label: 'Khách Từ Chối', color: 'bg-red-100 text-red-800' },
    'DA_DUYET': { label: 'Đã Duyệt', color: 'bg-green-100 text-green-800' },
    'APPROVED': { label: 'Đã Duyệt', color: 'bg-green-100 text-green-800' },

    // Mechanic Flow
    'CHO_SUA_CHUA': { label: 'Chờ Sửa Chữa', color: 'bg-indigo-100 text-indigo-800' },
    'DANG_SUA': { label: 'Đang Sửa', color: 'bg-purple-100 text-purple-800' },
    'IN_PROGRESS': { label: 'Đang Sửa Chữa', color: 'bg-purple-100 text-purple-800' },
    'CHO_KCS': { label: 'Chờ Nghiệm Thu', color: 'bg-teal-100 text-teal-800' },
    'CHO_NGHIEM_THU': { label: 'Chờ Nghiệm Thu', color: 'bg-teal-100 text-teal-800' },
    'WAITING_FOR_QC': { label: 'Chờ Nghiệm Thu QC', color: 'bg-teal-100 text-teal-800' },

    // Payment / Closing Flow
    'CHO_THAN_TOAN': { label: 'Chờ Thanh Toán', color: 'bg-pink-100 text-pink-800' },
    'WAITING_FOR_PAYMENT': { label: 'Chờ Thanh Toán', color: 'bg-pink-100 text-pink-800' },
    'HOAN_THANH': { label: 'Hoàn Thành', color: 'bg-emerald-100 text-emerald-800' },
    'COMPLETED': { label: 'Hoàn Thành', color: 'bg-emerald-100 text-emerald-800' },
    'DONG': { label: 'Đã Đóng', color: 'bg-slate-100 text-slate-800' },
    'CLOSED': { label: 'Đã Đóng', color: 'bg-slate-100 text-slate-800' },
    'HUY': { label: 'Đã Hủy', color: 'bg-red-100 text-red-800' },
    'CANCELLED': { label: 'Đã Hủy', color: 'bg-red-100 text-red-800' },
    'SETTLED': { label: 'Đã Quyết Toán', color: 'bg-emerald-100 text-emerald-800' },

    // Warehouse Flow
    'KHO_DUYET': { label: 'Kho Đã Duyệt', color: 'bg-cyan-100 text-cyan-800' },
    'XUAT_KHO': { label: 'Đã Xuất Kho', color: 'bg-blue-100 text-blue-800' },
    'CHO_XUAT': { label: 'Chờ Xuất Kho', color: 'bg-yellow-100 text-yellow-800' },
    'WAITING_FOR_PARTS': { label: 'Chờ Linh Kiện', color: 'bg-cyan-100 text-cyan-800' },

    // General
    'ACTIVE': { label: 'Hoạt Động', color: 'bg-green-100 text-green-800' },
    'INACTIVE': { label: 'Ngừng HĐ', color: 'bg-gray-100 text-gray-800' },
    'EXPIRED': { label: 'Đã Hết Hạn', color: 'bg-red-50 text-red-600' },
    'RELEASED': { label: 'Đã Nhả', color: 'bg-gray-100 text-gray-600' },
    'CONVERTED': { label: 'Đã Chuyển Đổi', color: 'bg-indigo-50 text-indigo-600' },
};

export function getStatusBadge(status: string) {
    const config = STATUS_MAPPING[status] || { label: status, color: 'bg-slate-100 text-slate-800' };

    // High Legibility "Pro" style for Dark Mode
    let darkClass = "dark:bg-slate-800/50 dark:text-slate-200 dark:border-slate-700";

    if (['DA_DUYET', 'APPROVED', 'ACTIVE', 'HOAN_THANH', 'COMPLETED', 'SETTLED'].includes(status))
        darkClass = "dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/50 dark:shadow-[0_0_12px_rgba(16,185,129,0.05)]";
    if (['DANG_SUA', 'IN_PROGRESS', 'CHO_SUA_CHUA', 'RECEIVED', 'TIEP_NHAN'].includes(status))
        darkClass = "dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/50 dark:shadow-[0_0_12px_rgba(99,102,241,0.05)]";
    if (['CHO_THAN_TOAN', 'WAITING_FOR_PAYMENT', 'CHO_KH_DUYET', 'WAITING_FOR_CUSTOMER_APPROVAL', 'BAO_GIA_LAI', 'RE_QUOTATION', 'BAO_GIA', 'QUOTING'].includes(status))
        darkClass = "dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/50 dark:shadow-[0_0_12px_rgba(249,115,22,0.05)]";
    if (['HUY', 'CANCELLED', 'EXPIRED', 'KHACH_TU_CHOI', 'CUSTOMER_REJECTED'].includes(status))
        darkClass = "dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/50 dark:shadow-[0_0_12px_rgba(239,68,68,0.05)]";

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
    status === 'TIEP_NHAN' || status === 'RECEIVED';

export const isWaitingDiagnosis = (status?: string) => 
    status === 'CHO_CHAN_DOAN' || status === 'WAITING_FOR_DIAGNOSIS';

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
        'TIEP_NHAN', 'RECEIVED',
        'CHO_CHAN_DOAN', 'WAITING_FOR_DIAGNOSIS',
        'BAO_GIA', 'QUOTING',
        'BAO_GIA_LAI', 'RE_QUOTATION',
        'CHO_KH_DUYET', 'WAITING_FOR_CUSTOMER_APPROVAL'
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
    !status || status === 'PENDING' || status === 'CHO_THUC_HIEN' || status === 'CHỜ_THỰC_HIỆN' || status === 'RECEIVED' || status === 'WAITING_FOR_DIAGNOSIS';

export const isItemInProgress = (status?: string | null) => 
    status === 'IN_PROGRESS' || status === 'DANG_THUC_HIEN' || status === 'ĐANG_THỰC_HIỆN' || status === 'DOING' || status === 'DANG_SUA';

export const isItemCompleted = (status?: string | null) => 
    status === 'COMPLETED' || status === 'HOAN_THANH' || status === 'HOÀN_THÀNH' || status === 'DONE' || status === 'DA_HOAN_THANH';

export const isItemCancelled = (status?: string | null) => 
    status === 'CANCELLED' || status === 'DA_HUY' || status === 'ĐÃ_HỦY';

export const isItemRejected = (status?: string | null) => 
    status === 'REJECTED' || status === 'TU_CHOI' || status === 'TỪ_CHỐI' || status === 'CUSTOMER_REJECTED' || status === 'KHACH_TU_CHOI';

export const isItemApproved = (status?: string | null) => 
    status === 'APPROVED' || status === 'KHACH_DONG_Y' || status === 'CUSTOMER_APPROVED' || (!status || status === 'PENDING' || isItemPending(status));

export const isItemExported = (status?: string | null) =>
    status === 'EXPORTED' || status === 'DA_XUAT_KHO';
