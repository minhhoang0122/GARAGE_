import { Badge } from "@/modules/shared/components/ui/badge";

export const STATUS_MAPPING: Record<string, { label: string; color: string; variant?: "default" | "secondary" | "destructive" | "outline" }> = {
    // Sales / Reception Flow
    'TIEP_NHAN': { label: 'Đang Tiếp Nhận', color: 'bg-blue-100 text-blue-800' },
    'CHO_CHAN_DOAN': { label: 'Chờ Chẩn Đoán', color: 'bg-yellow-100 text-yellow-800' },
    'BAO_GIA': { label: 'Đang Báo Giá', color: 'bg-amber-100 text-amber-800' },
    'BAO_GIA_LAI': { label: 'Báo Giá Lại', color: 'bg-orange-100 text-orange-800' },
    'CHO_KH_DUYET': { label: 'Chờ KH Duyệt', color: 'bg-orange-100 text-orange-800' },
    'KHACH_TU_CHOI': { label: 'Khách Từ Chối', color: 'bg-red-100 text-red-800' },
    'DA_DUYET': { label: 'Đã Duyệt', color: 'bg-green-100 text-green-800' },

    // Mechanic Flow
    'CHO_SUA_CHUA': { label: 'Chờ Sửa Chữa', color: 'bg-indigo-100 text-indigo-800' },
    'DANG_SUA': { label: 'Đang Sửa', color: 'bg-purple-100 text-purple-800' },
    'CHO_KCS': { label: 'Chờ Nghiệm Thu', color: 'bg-teal-100 text-teal-800' },
    'CHO_NGHIEM_THU': { label: 'Chờ Nghiệm Thu', color: 'bg-teal-100 text-teal-800' },

    // Payment / Closing Flow
    'CHO_THAN_TOAN': { label: 'Chờ Thanh Toán', color: 'bg-pink-100 text-pink-800' },
    'HOAN_THANH': { label: 'Hoàn Thành', color: 'bg-emerald-100 text-emerald-800' },
    'DONG': { label: 'Đã Đóng', color: 'bg-slate-100 text-slate-800' },
    'HUY': { label: 'Đã Hủy', color: 'bg-red-100 text-red-800' },

    // Warehouse Flow
    'KHO_DUYET': { label: 'Kho Đã Duyệt', color: 'bg-cyan-100 text-cyan-800' },
    'XUAT_KHO': { label: 'Đã Xuất Kho', color: 'bg-blue-100 text-blue-800' },
    'CHO_XUAT': { label: 'Chờ Xuất Kho', color: 'bg-yellow-100 text-yellow-800' },

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
    // We use deep backgrounds with sharp vivid borders for character
    let darkClass = "dark:bg-slate-800/50 dark:text-slate-200 dark:border-slate-700";

    if (status === 'DA_DUYET' || status === 'ACTIVE' || status === 'HOAN_THANH')
        darkClass = "dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/50 dark:shadow-[0_0_12px_rgba(16,185,129,0.05)]";
    if (status === 'DANG_SUA' || status === 'CHO_SUA_CHUA')
        darkClass = "dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/50 dark:shadow-[0_0_12px_rgba(99,102,241,0.05)]";
    if (status === 'CHO_THANH_TOAN' || status === 'CHO_KH_DUYET' || status === 'BAO_GIA_LAI')
        darkClass = "dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/50 dark:shadow-[0_0_12px_rgba(249,115,22,0.05)]";
    if (status === 'HUY' || status === 'EXPIRED')
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
