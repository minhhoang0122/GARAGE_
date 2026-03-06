'use client';

import { Printer } from 'lucide-react';

interface PrintExportButtonProps {
    orderId: number;
    disabled?: boolean;
}

export default function PrintExportButton({ orderId, disabled = false }: PrintExportButtonProps) {
    const handlePrint = () => {
        window.open(`/warehouse/export/${orderId}/print`, '_blank');
    };

    return (
        <button
            onClick={handlePrint}
            disabled={disabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${disabled
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
        >
            <Printer className="w-4 h-4" /> In phiếu xuất
        </button>
    );
}
