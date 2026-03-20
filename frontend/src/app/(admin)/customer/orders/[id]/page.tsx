'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Car, CheckCircle, XCircle, Loader2, AlertCircle, Clock, ShieldCheck, Phone, User, Calendar, Package, Edit } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { getCustomerOrderDetails, approveQuote, rejectQuote, requestRevision } from '@/modules/customer/customer';

export default function CustomerOrderDetailPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const params = useParams();
    const orderId = Number(params.id);
    const { showToast } = useToast();
    
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Modals state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [reason, setReason] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        if (authStatus === 'unauthenticated') { router.push('/customer/login'); return; }
        if (authStatus !== 'authenticated') return;
        fetchOrder();
    }, [authStatus, orderId]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const data = await getCustomerOrderDetails(orderId);
            setOrder(data);
        } catch (error) {
            showToast('error', 'Không thể tải thông tin đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!confirm('Bạn đồng ý với báo giá này?')) return;
        setSubmitting(true);
        try {
            const result = await approveQuote(orderId);
            if (result.success) {
                showToast('success', 'Đã duyệt báo giá thành công');
                fetchOrder();
            } else {
                showToast('error', result.error || 'Duyệt thất bại');
            }
        } catch (error) {
            showToast('error', 'Lỗi kết nối');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!reason.trim()) {
            showToast('error', 'Vui lòng nhập lý do từ chối');
            return;
        }
        setSubmitting(true);
        try {
            const result = await rejectQuote(orderId, reason);
            if (result.success) {
                showToast('success', 'Đã từ chối báo giá');
                setShowRejectModal(false);
                fetchOrder();
            } else {
                showToast('error', result.error || 'Thao tác thất bại');
            }
        } catch (error) {
            showToast('error', 'Lỗi kết nối');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequestRevision = async () => {
        if (!note.trim()) {
            showToast('error', 'Vui lòng nhập ghi chú yêu cầu');
            return;
        }
        setSubmitting(true);
        try {
            const result = await requestRevision(orderId, note);
            if (result.success) {
                showToast('success', 'Đã gửi yêu cầu chỉnh sửa');
                setShowRevisionModal(false);
                fetchOrder();
            } else {
                showToast('error', result.error || 'Gửi yêu cầu thất bại');
            }
        } catch (error) {
            showToast('error', 'Lỗi kết nối');
        } finally {
            setSubmitting(false);
        }
    };

    if (authStatus === 'loading' || loading) {
        return <div className="min-h-screen bg-stone-950 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
    }

    if (!order) return <div className="min-h-screen bg-stone-950 p-6 text-white text-center">Không tìm thấy đơn hàng</div>;

    const isPendingQuote = order.status === 'CHO_KH_DUYET' || order.status === 'BAO_GIA_LAI';

    return (
        <div className="min-h-screen bg-stone-950 text-stone-200 pb-20">
            <header className="bg-stone-900 border-b border-stone-800 px-4 py-3 sticky top-0 z-10 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <Link href="/customer/progress" className="text-stone-500 hover:text-white transition-colors p-2"><ArrowLeft size={20} /></Link>
                    <div className="flex-1">
                        <h1 className="text-white font-bold text-lg">Chi tiết đơn hàng #{order.id}</h1>
                        <p className="text-[10px] text-stone-500 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Vehicle & Customer Info Card */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                    
                    <div className="relative">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                <Car className="text-orange-500" size={28} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight">{order.plate || order.plateNumber}</h2>
                                <p className="text-stone-500 text-xs uppercase font-bold tracking-widest mt-1">Hạng mục sửa chữa</p>
                            </div>
                        </div>

                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${
                            isPendingQuote ? 'bg-orange-900/40 text-orange-400 border border-orange-500/30' : 'bg-stone-800 text-stone-400 border border-stone-700'
                        }`}>
                            {isPendingQuote ? <AlertCircle size={14} className="animate-pulse" /> : <Clock size={14} />}
                            {order.status === 'BAO_GIA_LAI' ? 'ĐANG CẬP NHẬT BÁO GIÁ' : order.status}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="text-stone-500" size={16} />
                                <div>
                                    <p className="text-[10px] text-stone-500 uppercase font-bold">Khách hàng</p>
                                    <p className="text-sm font-medium text-white">{order.customerName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="text-stone-500" size={16} />
                                <div>
                                    <p className="text-[10px] text-stone-500 uppercase font-bold">Liên hệ</p>
                                    <p className="text-sm font-medium text-white">{order.customerPhone}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="text-stone-500" size={16} />
                                <div>
                                    <p className="text-[10px] text-stone-500 uppercase font-bold">Ngày nhận xe</p>
                                    <p className="text-sm font-medium text-white">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-stone-500" size={16} />
                                <div>
                                    <p className="text-[10px] text-stone-500 uppercase font-bold">Cố vấn dịch vụ</p>
                                    <p className="text-sm font-medium text-white">{order.saleName || 'Hệ thống'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items List Section */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Package size={14} /> Danh sách hạng mục dich vụ & phụ tùng
                    </h3>
                    
                    <div className="grid gap-3">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex justify-between items-center group hover:border-stone-700 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-stone-950 flex items-center justify-center text-xs font-bold text-stone-400 border border-stone-800 group-hover:border-orange-500/30 transition-colors">
                                        {item.quantity}
                                    </div>
                                    <div>
                                        <div className="text-white font-bold flex items-center gap-2">
                                            {item.productName}
                                            {item.isWarranty && <span className="bg-emerald-950 text-emerald-500 text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-black tracking-tighter">BẢO HÀNH</span>}
                                        </div>
                                        <div className="text-stone-500 text-[10px] mt-0.5 font-medium uppercase tracking-tighter">
                                            Mã: {item.productCode} • Đơn giá: {Number(item.unitPrice).toLocaleString('vi-VN')}đ
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-black text-lg">{Number(item.total || item.totalPrice).toLocaleString('vi-VN')}đ</div>
                                    <div className={`text-[9px] mt-1 font-black tracking-widest uppercase ${
                                        item.itemStatus === 'KHACH_DONG_Y' ? 'text-emerald-500' : 
                                        item.itemStatus === 'KHACH_TU_CHOI' ? 'text-red-500' : 'text-stone-500'
                                    }`}>
                                        {item.itemStatus === 'DE_XUAT' ? 'CHỜ DUYỆT' : item.itemStatus}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 space-y-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full -mb-32 -mr-32"></div>
                    
                    <div className="flex justify-between text-stone-500 text-sm font-medium">
                        <span>Giá trị dịch vụ & phụ tùng</span>
                        <span className="text-stone-300 font-bold">{Number(order.totalAmount || order.total || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                    {order.discount > 0 && (
                        <div className="flex justify-between text-emerald-500 text-sm font-bold">
                            <span>Chiết khấu ưu đãi</span>
                            <span>-{Number(order.discount).toLocaleString('vi-VN')}đ</span>
                        </div>
                    )}
                    <div className="flex justify-between items-end pt-6 border-t border-stone-800">
                        <div>
                            <p className="text-[10px] text-stone-500 uppercase font-black tracking-[0.2em] mb-1">Tổng chi phí thanh toán</p>
                            <h4 className="text-white font-black text-3xl tracking-tighter">
                                {Number(order.finalAmount || order.total || 0).toLocaleString('vi-VN')}<span className="text-lg ml-1 font-bold text-stone-500 tracking-normal">đ</span>
                            </h4>
                        </div>
                        <div className="text-right pb-1">
                             <p className="text-[10px] text-stone-500 uppercase font-bold italic">Giá đã bao gồm VAT</p>
                        </div>
                    </div>
                </div>

                {/* Compliance Alert for Pending Quotes */}
                {isPendingQuote && (
                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 flex gap-4">
                        <AlertCircle className="text-orange-500 shrink-0" size={24} />
                        <div>
                            <h4 className="text-orange-400 font-bold text-sm mb-1 uppercase tracking-tight">Lưu ý chẩn đoán phát sinh</h4>
                            <p className="text-orange-200/60 text-xs italic leading-relaxed">
                                Quý khách đang xem các hạng mục phát sinh được đội ngũ kỹ thuật chẩn đoán thêm trong quá trình tháo lắp thực tế. 
                                Các hạng mục này được đánh giá dựa trên tiêu chuẩn an toàn kỹ thuật của hãng.
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Action Bar */}
            {isPendingQuote && (
                <div className="fixed bottom-0 left-0 right-0 bg-stone-900/80 backdrop-blur-xl border-t border-stone-800 p-4 shadow-2xl z-20">
                    <div className="max-w-4xl mx-auto flex gap-3">
                        <button 
                            disabled={submitting}
                            className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold px-6 py-4 rounded-2xl transition-all flex items-center gap-2"
                            onClick={() => setShowRevisionModal(true)}
                        >
                            <Edit size={18} />
                            Sửa
                        </button>
                        <button 
                            disabled={submitting}
                            className="bg-stone-800 hover:bg-red-900/30 hover:text-red-500 text-stone-500 font-bold px-6 py-4 rounded-2xl transition-all"
                            onClick={() => setShowRejectModal(true)}
                        >
                            Từ chối
                        </button>
                        <button 
                            disabled={submitting}
                            onClick={handleApprove}
                            className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-950/40 flex items-center justify-center gap-3 transition-all active:scale-95"
                        >
                            {submitting ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} />}
                            ĐỒNG Ý SỬA CHỮA
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-8">
                            <h3 className="text-2xl font-black text-white mb-2">Từ chối báo giá</h3>
                            <p className="text-stone-500 text-sm mb-6">Xin Quý khách vui lòng cho biết lý do từ chối để chúng tôi cải thiện dịch vụ.</p>
                            
                            <textarea
                                className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-white text-sm focus:border-orange-500/50 outline-none transition-colors mb-6 resize-none"
                                rows={4}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Nhập lý do tại đây..."
                            />
                            
                            <div className="flex gap-3">
                                <button className="flex-1 py-4 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-2xl transition-colors" onClick={() => setShowRejectModal(false)}>Hủy</button>
                                <button className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-colors" onClick={handleReject} disabled={submitting}>Xác nhận từ chối</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Revision Modal */}
            {showRevisionModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-8">
                            <h3 className="text-2xl font-black text-white mb-2">Yêu cầu chỉnh sửa</h3>
                            <p className="text-stone-500 text-sm mb-6">Nhập nội dung Quý khách mong muốn thay đổi (VD: linh kiện, nhân công...)</p>
                            
                            <textarea
                                className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-white text-sm focus:border-orange-500/50 outline-none transition-colors mb-6 resize-none"
                                rows={4}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Nhập yêu cầu chi tiết..."
                            />
                            
                            <div className="flex gap-3">
                                <button className="flex-1 py-4 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-2xl transition-colors" onClick={() => setShowRevisionModal(false)}>Hủy</button>
                                <button className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl transition-colors" onClick={handleRequestRevision} disabled={submitting}>Gửi yêu cầu</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
