'use client';

import { useRef } from 'react';
import { Printer } from 'lucide-react';

interface InvoicePrintProps {
    order: {
        id: number;
        plate: string;
        customerName: string;
        phone: string;
        odo: number;
        items: {
            productName: string;
            productCode: string;
            quantity: number;
            unitPrice: number;
            discountAmount: number;
            total: number;
            isService: boolean;
            warrantyMonths?: number;
        }[];
        totalParts: number;
        totalLabor: number;
        totalDiscount: number;
        vat: number;
        grandTotal: number;
        amountPaid: number;
        paymentMethod: string | null;
        paymentDate: Date | null;
    };
}

export default function InvoicePrint({ order }: InvoicePrintProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN').format(val) + 'đ';

    const formatDate = (date: Date | null) => {
        if (!date) return new Date().toLocaleDateString('vi-VN');
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '', 'width=380,height=600');
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Hóa đơn #${order.id}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                        max-width: 700px;
                        margin: 0 auto;
                        padding: 20px;
                        background: white;
                    }
                    .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .store-name { font-size: 24px; font-weight: bold; color: #1e40af; }
                    .store-tagline { font-size: 11px; color: #666; }
                    .store-info { font-size: 10px; color: #888; margin-top: 3px; }
                    .invoice-title { font-size: 16px; font-weight: bold; text-align: center; margin: 10px 0; color: #333; }
                    .info-section { display: flex; justify-content: space-between; margin-bottom: 12px; background: #f8f9fa; padding: 10px 15px; border-radius: 4px; font-size: 11px; }
                    .info-row { margin: 3px 0; }
                    .label { color: #666; display: inline-block; min-width: 70px; }
                    .value { font-weight: 600; }
                    .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11px; }
                    .items-table th { background: #1e40af; color: white; padding: 6px 8px; text-align: left; }
                    .items-table th:last-child { text-align: right; }
                    .items-table td { padding: 6px 8px; border-bottom: 1px solid #eee; }
                    .items-table td:last-child { text-align: right; font-weight: 600; }
                    .items-table tr:nth-child(even) { background: #f8f9fa; }
                    .item-code { font-size: 9px; color: #888; }
                    .service-badge { font-size: 8px; background: #10b981; color: white; padding: 1px 4px; border-radius: 3px; }
                    .total-section { margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px; }
                    .total-row { display: flex; justify-content: flex-end; padding: 3px 0; font-size: 11px; }
                    .total-row .label { min-width: 100px; text-align: right; margin-right: 20px; }
                    .total-row .value { min-width: 90px; text-align: right; }
                    .grand-total { font-size: 14px; font-weight: bold; color: #1e40af; border-top: 2px solid #1e40af; padding-top: 8px; margin-top: 5px; }
                    .payment-info { background: #ecfdf5; padding: 8px 12px; border-radius: 4px; margin-top: 10px; font-size: 11px; }
                    .payment-info .title { font-weight: bold; color: #059669; margin-bottom: 3px; }
                    .footer { text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #ccc; font-size: 10px; }
                    .footer .thanks { font-size: 12px; font-weight: bold; color: #333; }
                    .footer .note { color: #888; margin-top: 3px; }
                    @media print {
                        body { padding: 15px; }
                        @page { margin: 10mm; }
                    }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <>
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors font-medium text-sm w-full justify-center"
            >
                <Printer className="w-4 h-4" />
                In hóa đơn
            </button>

            {/* Hidden Print Template */}
            <div className="hidden">
                <div ref={printRef}>
                    {/* Header */}
                    <div className="header">
                        <div className="store-name">AUTOCARE</div>
                        <div className="store-tagline">Garage Management System</div>
                        <div className="store-info">Hotline: 1900-xxx-xxx | Email: autocare@example.com</div>
                    </div>

                    <div className="invoice-title">HÓA ĐƠN DỊCH VỤ</div>

                    {/* Order Info */}
                    <div className="info-section">
                        <div className="info-block">
                            <div className="info-row">
                                <span className="label">Số HĐ:</span>
                                <span className="value">#{order.id}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Ngày:</span>
                                <span className="value">{formatDate(order.paymentDate)}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">ODO:</span>
                                <span className="value">{order.odo.toLocaleString()} km</span>
                            </div>
                        </div>
                        <div className="info-block">
                            <div className="info-row">
                                <span className="label">Biển số:</span>
                                <span className="value" style={{ fontSize: '18px', color: '#1e40af' }}>{order.plate}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Khách hàng:</span>
                                <span className="value">{order.customerName}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">SĐT:</span>
                                <span className="value">{order.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Hạng mục</th>
                                <th style={{ width: '15%', textAlign: 'center' }}>SL</th>
                                <th style={{ width: '20%', textAlign: 'right' }}>Đơn giá</th>
                                <th style={{ width: '25%', textAlign: 'right' }}>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.filter(i => i.total > 0).map((item, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{item.productName}</div>
                                        <div className="item-code">
                                            {item.productCode}
                                            {item.isService && <span className="service-badge" style={{ marginLeft: '8px' }}>Dịch vụ</span>}
                                            {item.warrantyMonths && item.warrantyMonths > 0 ? (
                                                <span style={{ marginLeft: '8px', color: '#1e40af', fontWeight: 'bold' }}>
                                                    (BH: {item.warrantyMonths}T)
                                                </span>
                                            ) : null}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="total-section">
                        <div className="total-row">
                            <span className="label">Tiền hàng:</span>
                            <span className="value">{formatCurrency(order.totalParts)}</span>
                        </div>
                        <div className="total-row">
                            <span className="label">Tiền công:</span>
                            <span className="value">{formatCurrency(order.totalLabor)}</span>
                        </div>
                        {order.totalDiscount > 0 && (
                            <div className="total-row">
                                <span className="label">Chiết khấu:</span>
                                <span className="value" style={{ color: '#dc2626' }}>-{formatCurrency(order.totalDiscount)}</span>
                            </div>
                        )}
                        {order.vat > 0 && (
                            <div className="total-row">
                                <span className="label">Thuế VAT:</span>
                                <span className="value">{formatCurrency(order.vat)}</span>
                            </div>
                        )}
                        <div className="total-row grand-total">
                            <span className="label">TỔNG CỘNG:</span>
                            <span className="value">{formatCurrency(order.grandTotal)}</span>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="payment-info">
                        <div className="title">✓ ĐÃ THANH TOÁN</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Phương thức: {order.paymentMethod === 'TIEN_MAT' ? 'Tiền mặt' : order.paymentMethod === 'CHUYEN_KHOAN' ? 'Chuyển khoản' : 'Hỗn hợp'}</span>
                            <span style={{ fontWeight: 600 }}>{formatCurrency(order.amountPaid)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="footer">
                        <div className="thanks">Cảm ơn Quý khách đã sử dụng dịch vụ!</div>
                        <div className="note">Bảo hành theo quy định của cửa hàng. Vui lòng giữ hóa đơn này để được hỗ trợ bảo hành.</div>
                    </div>
                </div>
            </div>
        </>
    );
}
