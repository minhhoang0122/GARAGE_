'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCustomerOrderDetails, approveQuote, rejectQuote, requestRevision } from '@/modules/customer/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card';
import { Button } from '@/modules/shared/components/ui/button';
import { Badge } from '@/modules/shared/components/ui/badge';
import { ArrowLeft, Check, X, Edit, Car, User, Phone, Calendar, Wallet, Package } from 'lucide-react';

import Link from 'next/link';
import { useToast } from '@/modules/shared/components/ui/use-toast';

const statusMap: Record<string, { label: string; color: string }> = {
    'CHO_KH_DUYET': { label: 'Chờ duyệt báo giá', color: 'bg-yellow-500' },
    'BAO_GIA_LAI': { label: 'Đang sửa báo giá', color: 'bg-orange-500' },
    'DA_DUYET': { label: 'Đã duyệt', color: 'bg-blue-500' },
    'DANG_SUA': { label: 'Đang sửa chữa', color: 'bg-indigo-500' },
    'CHO_THANH_TOAN': { label: 'Chờ thanh toán', color: 'bg-purple-500' },
    'HOAN_THANH': { label: 'Hoàn thành', color: 'bg-green-500' },
    'DONG': { label: 'Đã đóng', color: 'bg-slate-500' },
    'HUY': { label: 'Đã hủy', color: 'bg-red-500' },
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

export default function CustomerOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = Number(params.id);

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [reason, setReason] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        async function loadOrder() {
            const data = await getCustomerOrderDetails(orderId);
            setOrder(data);
            setLoading(false);
        }
        loadOrder();
    }, [orderId]);

    const { toast } = useToast();

    // ... (rest of the state)

    const handleApprove = async () => {
        setProcessing(true);
        const result = await approveQuote(orderId);
        if (result.success) {
            toast({ title: 'Thành công', description: 'Đã duyệt báo giá thành công!', variant: 'default' });
            router.replace('/customer/orders');
        } else {
            toast({ title: 'Lỗi', description: result.error || 'Có lỗi xảy ra', variant: 'destructive' });
        }
        setProcessing(false);
    };

    const handleReject = async () => {
        if (!reason.trim()) {
            toast({ title: 'Cảnh báo', description: 'Vui lòng nhập lý do từ chối', variant: 'destructive' });
            return;
        }
        setProcessing(true);
        const result = await rejectQuote(orderId, reason);
        if (result.success) {
            toast({ title: 'Thông báo', description: 'Đã từ chối báo giá' });
            router.replace('/customer/orders');
        } else {
            toast({ title: 'Lỗi', description: result.error || 'Có lỗi xảy ra', variant: 'destructive' });
        }
        setProcessing(false);
    };

    const handleRequestRevision = async () => {
        if (!note.trim()) {
            toast({ title: 'Cảnh báo', description: 'Vui lòng nhập ghi chú yêu cầu chỉnh sửa', variant: 'destructive' });
            return;
        }
        setProcessing(true);
        const result = await requestRevision(orderId, note);
        if (result.success) {
            toast({ title: 'Thành công', description: 'Đã gửi yêu cầu chỉnh sửa báo giá' });
            router.replace('/customer/orders');
        } else {
            toast({ title: 'Lỗi', description: result.error || 'Có lỗi xảy ra', variant: 'destructive' });
        }
        setProcessing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Card className="p-8">
                    <p className="text-red-500">Không tìm thấy đơn hàng hoặc bạn không có quyền xem</p>
                    <Link href="/customer/orders" className="mt-4 inline-flex h-10 px-4 py-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300">
                        Quay lại
                    </Link>
                </Card>
            </div>
        );
    }

    const status = statusMap[order.status] || { label: order.status, color: 'bg-slate-400' };
    const canApprove = order.status === 'CHO_KH_DUYET' || order.status === 'BAO_GIA_LAI';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/customer/orders" className="h-10 w-10 inline-flex items-center justify-center hover:bg-slate-100 rounded-md transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-800">Chi tiết báo giá</h1>
                        <p className="text-slate-500">Đơn #{orderId}</p>
                    </div>
                    <Badge className={`${status.color} text-white px-4 py-1`}>
                        {status.label}
                    </Badge>
                </div>

                {/* Vehicle & Customer Info */}
                <Card className="mb-6">
                    <CardContent className="p-5">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center gap-3">
                                <Car className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-sm text-slate-500">Biển số</p>
                                    <p className="font-semibold">{order.plate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-sm text-slate-500">Khách hàng</p>
                                    <p className="font-semibold">{order.customerName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-sm text-slate-500">SĐT</p>
                                    <p className="font-semibold">{order.customerPhone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-sm text-slate-500">Ngày lập</p>
                                    <p className="font-semibold">
                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Items list */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Chi tiết dịch vụ & phụ tùng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="text-left p-3">Tên</th>
                                    <th className="text-center p-3">SL</th>
                                    <th className="text-right p-3">Đơn giá</th>
                                    <th className="text-right p-3">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(order.items || []).map((item: any, idx: number) => (
                                    <tr key={idx} className="border-b">
                                        <td className="p-3">
                                            <div className="font-medium">{item.productName}</div>
                                            <div className="text-xs text-slate-500">{item.productCode}</div>
                                        </td>
                                        <td className="text-center p-3">{item.quantity}</td>
                                        <td className="text-right p-3">{formatCurrency(item.unitPrice)}</td>
                                        <td className="text-right p-3 font-medium">{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-blue-50">
                                <tr>
                                    <td colSpan={3} className="text-right p-3 font-bold">Tổng cộng</td>
                                    <td className="text-right p-3 font-bold text-lg text-slate-900 dark:text-white">
                                        {formatCurrency(order.finalAmount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </CardContent>
                </Card>

                {/* Actions */}
                {canApprove && (
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-lg mb-4 text-slate-800">Xác nhận báo giá</h3>
                            <div className="flex gap-3 flex-wrap">
                                <Button
                                    className="bg-green-600 hover:bg-green-700 flex-1"
                                    onClick={handleApprove}
                                    disabled={processing}
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Duyệt báo giá
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50"
                                    onClick={() => setShowRevisionModal(true)}
                                    disabled={processing}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Yêu cầu chỉnh sửa
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={processing}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Từ chối
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md mx-4">
                            <CardHeader>
                                <CardTitle>Từ chối báo giá</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-slate-600">Vui lòng nhập lý do từ chối:</p>
                                <textarea
                                    className="w-full p-3 border rounded-lg resize-none"
                                    rows={3}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Nhập lý do..."
                                />
                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setShowRejectModal(false)}>
                                        Hủy
                                    </Button>
                                    <Button className="flex-1 bg-red-600" onClick={handleReject} disabled={processing}>
                                        Xác nhận từ chối
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Revision Modal */}
                {showRevisionModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md mx-4">
                            <CardHeader>
                                <CardTitle>Yêu cầu chỉnh sửa báo giá</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-slate-600">Nhập ghi chú yêu cầu:</p>
                                <textarea
                                    className="w-full p-3 border rounded-lg resize-none"
                                    rows={3}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="VD: Xin giảm giá phần nhân công..."
                                />
                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setShowRevisionModal(false)}>
                                        Hủy
                                    </Button>
                                    <Button className="flex-1 bg-orange-600" onClick={handleRequestRevision} disabled={processing}>
                                        Gửi yêu cầu
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
