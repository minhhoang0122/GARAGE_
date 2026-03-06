'use client';

import { ReactNode } from 'react';

interface PrintLayoutProps {
    children: ReactNode;
    title: string;
    showSignatures?: boolean;
}

/**
 * A wrapper component that adds professional branding and signatures for printed documents.
 * It uses CSS classes defined in globals.css (@media print).
 */
export default function PrintLayout({ children, title, showSignatures = true }: PrintLayoutProps) {
    return (
        <div className="relative">
            {/* Print Header - Only visible during printing */}
            <div className="print-header hidden print:flex mb-8">
                <div>
                    <div className="company-name text-2xl font-black text-blue-900 leading-tight">GARA Ô TÔ CHUYÊN NGHIỆP</div>
                    <div className="text-sm text-slate-600 mt-1 uppercase font-bold tracking-widest">Hệ thống quản lý dịch vụ sửa chữa</div>
                </div>
                <div className="company-info text-right">
                    <p className="font-bold">Địa chỉ: 123 Đường Láng, Hà Nội</p>
                    <p>Hotline: 090 123 4567</p>
                    <p>Website: www.gara-chuyen-nghiep.vn</p>
                </div>
            </div>

            {/* Document Title for Print */}
            <div className="hidden print:block text-center mb-8">
                <h1 className="text-2xl font-bold uppercase tracking-widest border-y-2 border-slate-900 py-2 inline-block px-8">
                    {title}
                </h1>
            </div>

            {/* Main Content */}
            <div className="print-content">
                {children}
            </div>

            {/* Print Signatures - Only visible during printing */}
            {showSignatures && (
                <div className="print-signatures hidden print:flex mt-12 pt-8 border-t border-dashed border-slate-300">
                    <div className="signature-box text-center">
                        <div className="signature-label font-bold mb-16">Khách hàng</div>
                        <div className="signature-name text-sm text-slate-500">(Ký và ghi rõ họ tên)</div>
                    </div>
                    <div className="signature-box text-center">
                        <div className="signature-label font-bold mb-16">Cố vấn dịch vụ</div>
                        <div className="signature-name text-sm text-slate-500">(Ký và ghi rõ họ tên)</div>
                    </div>
                    <div className="signature-box text-center">
                        <div className="signature-label font-bold mb-16">Người lập phiếu</div>
                        <div className="signature-name text-sm text-slate-500 italic">Trần Thị Bình</div>
                    </div>
                </div>
            )}

            {/* Print Footer/Note */}
            <div className="hidden print:block mt-12 text-[10px] text-slate-400 text-center border-t pt-2">
                <p>Quý khách vui lòng kiểm tra kỹ phụ tùng và xe trước khi rời Gara.</p>
                <p>In từ hệ thống quản lý Gara</p>
            </div>
        </div>
    );
}
