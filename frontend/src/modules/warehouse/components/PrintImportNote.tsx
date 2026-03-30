import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '@/lib/utils';

// Helper for date if not in utils
const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN');
};

interface PrintImportNoteProps {
    data: any;
    onClose: () => void;
}

const PrintImportNote: React.FC<PrintImportNoteProps> = ({ data, onClose }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Auto-print when mounted
        const timer = setTimeout(() => {
            window.print();
        }, 800);

        // Close when print dialog is closed (or user cancels)
        const handleAfterPrint = () => {
            // Keep open or close based on preference. 
        };

        window.addEventListener('afterprint', handleAfterPrint);
        return () => {
            window.removeEventListener('afterprint', handleAfterPrint);
            clearTimeout(timer);
        }
    }, [onClose]);

    if (!data || !mounted) return null;

    // Use a Portal to render at the document body level, 
    // ensuring no parent overflow issues affect printing
    const content = (
        <div className="fixed inset-0 bg-white z-[99999] overflow-auto p-0 text-black print-container top-0 left-0 w-full h-full">
            <style jsx global>{`
                @media print {
                    @page { margin: 10mm; size: auto; }
                    /* Hide everything in body */
                    body > * {
                        display: none !important;
                    }
                    /* Show only our portal content */
                    body > .print-portal-root {
                        display: block !important;
                    }
                    /* Just in case the portable root isn't the direct parent, target the container */
                    .print-container {
                        display: block !important;
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        z-index: 99999 !important;
                        background-color: white !important;
                        visibility: visible !important;
                    }
                    .print-container * {
                        visibility: visible !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="max-w-[210mm] mx-auto bg-white min-h-[297mm] p-8 relative print-content">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 border-b border-gray-300 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Phiếu nhập kho</h1>
                        <p className="text-sm text-gray-600">Mã phiếu: <span className="font-mono font-bold tracking-tight text-black">{data.code}</span></p>
                        <p className="text-sm text-gray-600">Ngày nhập: {formatDate(data.date)}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-gray-800">Gara Master</h2>
                        <p className="text-sm text-gray-500">Hệ thống quản lý Gara chuyên nghiệp</p>
                        <p className="text-sm text-gray-500">Hotline: 1900 1234</p>
                    </div>
                </div>

                {/* Info */}
                <div className="mb-8 grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold border-b border-gray-200 pb-1 mb-2">Nhà Cung Cấp</h3>
                        <p>{data.supplier}</p>
                    </div>
                    <div>
                        <h3 className="font-bold border-b border-gray-200 pb-1 mb-2">Thông Tin Chung</h3>
                        <p>Người nhập: {data.creator}</p>
                        <p>Ghi chú: {data.note || 'Không có'}</p>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full mb-8 text-sm border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-800">
                            <th className="text-left py-2 px-1 w-10">STT</th>
                            <th className="text-left py-2 px-1">Mã Hàng</th>
                            <th className="text-left py-2 px-1">Tên Hàng Hóa</th>
                            <th className="text-right py-2 px-1 w-24">Số Lượng</th>
                            <th className="text-right py-2 px-1 w-32">Đơn Giá</th>
                            <th className="text-right py-2 px-1 w-20">Thuế (%)</th>
                            <th className="text-right py-2 px-1 w-32">Thành Tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items?.map((item: any, index: number) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-2 px-1 text-center">{index + 1}</td>
                                <td className="py-2 px-1 font-mono text-xs">{item.productCode}</td>
                                <td className="py-2 px-1">{item.productName}</td>
                                <td className="py-2 px-1 text-right">{item.quantity}</td>
                                <td className="py-2 px-1 text-right">{formatCurrency(item.unitPrice)}</td>
                                <td className="py-2 px-1 text-right">{item.vatRate || 10}%</td>
                                <td className="py-2 px-1 text-right font-medium">{formatCurrency(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={5} className="py-2 px-1 text-right font-medium text-gray-600">Tiền hàng:</td>
                            <td className="py-2 px-1 text-right font-semibold">{formatCurrency(data.total - (data.vat || 0))}</td>
                        </tr>
                        <tr>
                            <td colSpan={5} className="py-2 px-1 text-right font-medium text-gray-600">Thuế GTGT:</td>
                            <td className="py-2 px-1 text-right font-semibold">{formatCurrency(data.vat || 0)}</td>
                        </tr>
                        <tr className="border-t-2 border-gray-800">
                            <td colSpan={5} className="py-4 px-1 text-right font-bold text-lg">Tổng thanh toán:</td>
                            <td className="py-4 px-1 text-right font-bold text-xl text-blue-900 leading-none">{formatCurrency(data.total)}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer Signatures - Using Table for consistent print layout */}
                <table className="w-full mt-16 text-center break-inside-avoid">
                    <tbody>
                        <tr>
                            <td className="align-top pb-20 w-1/3">
                                <p className="font-bold mb-2">Người lập phiếu</p>
                                <p className="text-sm italic text-transparent">.</p>
                            </td>
                            <td className="align-top pb-20 w-1/3">
                                <p className="font-bold mb-2">Thủ kho</p>
                                <p className="text-sm italic text-transparent">.</p>
                            </td>
                            <td className="align-top pb-20 w-1/3">
                                <p className="font-bold mb-2">Giám đốc</p>
                                <p className="text-sm italic text-transparent">.</p>
                            </td>
                        </tr>
                        <tr>
                            <td className="italic text-sm">(Ký, họ tên)</td>
                            <td className="italic text-sm">(Ký, họ tên)</td>
                            <td className="italic text-sm">(Ký, họ tên)</td>
                        </tr>
                    </tbody>
                </table>

                {/* Button to close manualy if print fails/cancels */}
                <div className="fixed top-4 right-4 no-print z-50">
                    <button onClick={onClose} className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 font-bold">
                        Đóng (Close)
                    </button>
                    <button onClick={() => window.print()} className="ml-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold">
                        In Lại (Print)
                    </button>
                </div>
            </div>
        </div>
    );

    // Ensure we render into the body
    return createPortal(content, document.body);
};

export default PrintImportNote;
