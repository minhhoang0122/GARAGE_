'use client';

import { Printer, FileText } from 'lucide-react';

interface PrintInvoiceButtonProps {
    variant?: 'invoice' | 'receipt';
}

export default function PrintInvoiceButton({ variant = 'invoice' }: PrintInvoiceButtonProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm"
        >
            {variant === 'invoice' ? (
                <>
                    <FileText className="w-4 h-4" />
                    In hóa đơn
                </>
            ) : (
                <>
                    <Printer className="w-4 h-4" />
                    In phiếu thu
                </>
            )}
        </button>
    );
}
