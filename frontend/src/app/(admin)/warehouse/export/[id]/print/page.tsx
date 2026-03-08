import { notFound, redirect } from 'next/navigation';
import PrintButton from './PrintButton';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

export default async function PrintExportSlipPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) return notFound();

    const session = await auth();
    const token = (session?.user as any)?.accessToken;
    if (!token) return redirect('/login');

    let exportSlip = null;
    try {
        exportSlip = await api.get(`/warehouse/export/${orderId}/slip`, token);
    } catch (e) {
        return notFound();
    }

    if (!exportSlip) return notFound();

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const formatDate = (date: string | Date) =>
        new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));

    const totalValue = (exportSlip.items || []).reduce((sum: number, item: any) => sum + Number(item.total), 0);

    return (
        <div className="print-page">
            <style dangerouslySetInnerHTML={{
                __html: `
                .print-page {
                    font-family: 'Times New Roman', serif;
                    font-size: 12pt;
                    line-height: 1.5;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    color: #000;
                }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
                .company-name { font-size: 18pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
                .company-info { font-size: 10pt; color: #333; margin-top: 5px; }
                .title { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 25px 0 10px; text-align: center; }
                .slip-number { text-align: center; font-size: 11pt; color: #333; margin-bottom: 25px; }
                
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
                .info-box { padding: 12px; border: 1px solid #333; }
                .info-box h3 { font-size: 11pt; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                .info-row { display: flex; font-size: 11pt; margin: 6px 0; }
                .info-label { font-weight: bold; width: 100px; }
                .info-value { flex: 1; }
                
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th { background: #f5f5f5; font-weight: bold; text-align: left; padding: 10px 8px; font-size: 10pt; border: 1px solid #333; }
                td { padding: 8px; font-size: 10pt; border: 1px solid #333; vertical-align: top; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                
                .summary { width: 250px; margin-left: auto; margin-bottom: 30px; border: 1px solid #333; }
                .summary-row { display: flex; justify-content: space-between; padding: 10px 15px; font-size: 12pt; font-weight: bold; background: #f5f5f5; }
                
                .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; }
                .footer-box h4 { font-size: 11pt; font-weight: bold; margin-bottom: 80px; }
                .footer-box p { font-size: 10pt; }

                .print-btn { 
                    position: fixed; top: 20px; right: 20px; 
                    padding: 12px 24px; background: #333; color: white; 
                    border: none; cursor: pointer; font-size: 14px; font-weight: bold;
                }
                .print-btn:hover { background: #000; }
                @media print { 
                    .print-btn { display: none; }
                    .print-page { padding: 0; max-width: none; }
                    @page { margin: 15mm; size: A4; }
                }
            `}} />

            <PrintButton />

            {/* Header */}
            <div className="header">
                <div className="company-name">AUTOCARE</div>
                <div className="company-info">
                    GARA SỬA CHỮA Ô TÔ CHUYÊN NGHIỆP<br />
                    Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh<br />
                    Điện thoại: 028 1234 5678 | Email: info@autocare.vn
                </div>
            </div>

            {/* Title */}
            <div className="title">PHIẾU XUẤT KHO</div>
            <div className="slip-number">
                Số: PXK-{exportSlip.ID.toString().padStart(6, '0')} &nbsp;|&nbsp; Ngày: {formatDate(exportSlip.ngayXuat)}
            </div>

            {/* Info Grid */}
            <div className="info-grid">
                <div className="info-box">
                    <h3>Thông tin đơn hàng</h3>
                    <div className="info-row">
                        <span className="info-label">Mã đơn:</span>
                        <span className="info-value">DH{exportSlip.orderId.toString().padStart(4, '0')}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Biển số:</span>
                        <span className="info-value" style={{ fontWeight: 'bold' }}>
                            {exportSlip.plate}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Loại xuất:</span>
                        <span className="info-value">Xuất cho sửa chữa</span>
                    </div>
                </div>
                <div className="info-box">
                    <h3>Thông tin khách hàng</h3>
                    <div className="info-row">
                        <span className="info-label">Họ tên:</span>
                        <span className="info-value">
                            {exportSlip.customerName}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">SĐT:</span>
                        <span className="info-value">
                            {exportSlip.customerPhone}
                        </span>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <table>
                <thead>
                    <tr>
                        <th style={{ width: '5%' }} className="text-center">STT</th>
                        <th style={{ width: '15%' }}>Mã hàng</th>
                        <th style={{ width: '40%' }}>Tên hàng</th>
                        <th style={{ width: '10%' }} className="text-center">ĐVT</th>
                        <th style={{ width: '10%' }} className="text-center">SL xuất</th>
                        <th style={{ width: '20%' }} className="text-right">Đơn giá</th>
                    </tr>
                </thead>
                <tbody>
                    {(exportSlip.items || []).map((item: any, idx: number) => (
                        <tr key={item.ID}>
                            <td className="text-center">{idx + 1}</td>
                            <td>{item.productCode}</td>
                            <td>{item.productName}</td>
                            <td className="text-center">Cái</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-right">{formatCurrency(Number(item.unitPrice))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Summary */}
            <div className="summary">
                <div className="summary-row">
                    <span>TỔNG GIÁ TRỊ:</span>
                    <span>{formatCurrency(totalValue)}</span>
                </div>
            </div>

            {/* Footer Signatures */}
            <div className="footer">
                <div className="footer-box">
                    <h4>NGƯỜI NHẬN (THỢ)</h4>
                    <p>(Ký, ghi rõ họ tên)</p>
                </div>
                <div className="footer-box">
                    <h4>NGƯỜI XUẤT KHO</h4>
                    <p><strong>{exportSlip.creatorName || '_______________'}</strong></p>
                </div>
            </div>
        </div>
    );
}
