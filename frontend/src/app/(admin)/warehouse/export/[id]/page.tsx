import { DashboardLayout } from '@/modules/common/components/layout';
import { getOrderExportDetails } from '@/modules/inventory/warehouse';
import { notFound } from 'next/navigation';
import { ArrowLeft, Car, User, Phone, Package } from 'lucide-react';
import Link from 'next/link';
import ExportConfirmButton from './ExportConfirmButton';
import PrintExportButton from './PrintExportButton';
import ReturnItemButton from './ReturnItemButton';

export default async function ExportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) return notFound();

    const order = await getOrderExportDetails(orderId);
    if (!order) return notFound();

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const totalValue = order.items.reduce((sum: number, item: any) => sum + item.unitPrice * item.quantity, 0);

    return (
        <DashboardLayout title="Chi tiết xuất kho" subtitle={`Đơn hàng #${order.id}`}>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link href="/warehouse/export" className="flex items-center gap-2 text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                    </Link>
                    <div className="flex gap-3">
                        <PrintExportButton orderId={order.id} disabled={!order.hasExported} />
                        <ExportConfirmButton orderId={order.id} disabled={order.hasExported} />
                    </div>
                </div>

                {/* Thông báo đã xuất */}
                {order.hasExported && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-emerald-700">
                        <Package className="w-5 h-5" />
                        <span>Đơn hàng này đã được xuất kho và chuyển sang trạng thái "Đang sửa".</span>
                    </div>
                )}

                {/* Thông tin đơn hàng */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <Car className="w-5 h-5 text-indigo-600" /> Thông tin xe
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex">
                                    <span className="text-slate-500 w-24">Biển số:</span>
                                    <span className="font-semibold text-slate-800">{order.plate}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-slate-500 w-24">Hãng xe:</span>
                                    <span className="text-slate-800">{order.vehicleBrand} {order.vehicleModel}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-600" /> Thông tin khách
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex">
                                    <span className="text-slate-500 w-24">Họ tên:</span>
                                    <span className="text-slate-800">{order.customerName}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-slate-500 w-24">SĐT:</span>
                                    <span className="text-slate-800 flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" /> {order.customerPhone}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bảng vật tư cần xuất */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto transition-colors">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-800">Danh sách vật tư cần xuất</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Chỉ hiển thị phụ tùng đã được khách duyệt (không bao gồm dịch vụ)
                        </p>
                    </div>

                    {order.items.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500">
                            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>Không có vật tư nào cần xuất cho đơn hàng này</p>
                            <p className="text-sm">(Đơn hàng chỉ có dịch vụ)</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                                    <th className="px-6 py-3 text-left">STT</th>
                                    <th className="px-6 py-3 text-left">Mã hàng</th>
                                    <th className="px-6 py-3 text-left">Tên hàng</th>
                                    <th className="px-6 py-3 text-center">SL xuất</th>
                                    <th className="px-6 py-3 text-center">Tồn kho</th>
                                    <th className="px-6 py-3 text-right">Đơn giá</th>
                                    <th className="px-6 py-3 text-right">Thành tiền</th>
                                    <th className="px-6 py-3 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {order.items.map((item: any, idx: number) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-slate-600">{idx + 1}</td>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-600">{item.productCode}</td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{item.productName}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-800">{item.quantity}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-medium ${item.stockQty < item.quantity ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {item.stockQty}
                                            </span>
                                            {item.stockQty < item.quantity && (
                                                <span className="ml-1 text-xs text-red-500">(Thiếu!)</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-slate-800">
                                            {formatCurrency(item.unitPrice * item.quantity)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <ReturnItemButton
                                                orderId={order.id}
                                                productId={item.productId}
                                                productName={item.productName}
                                                maxQuantity={item.quantity}
                                                disabled={!order.hasExported || item.quantity <= 0}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-50 border-t border-slate-200">
                                    <td colSpan={7} className="px-6 py-4 text-right font-semibold text-slate-800">
                                        Tổng giá trị xuất:
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900 text-lg">
                                        {formatCurrency(totalValue)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
