'use client';

import { Printer } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function PrintQuoteButton() {
    const params = useParams();

    const handlePrint = () => {
        // Mở trang in riêng trong tab mới
        window.open(`/sale/orders/${params.id}/print`, '_blank');
    };

    return (
        <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
        >
            <Printer className="w-4 h-4" /> In báo giá
        </button>
    );
}
