'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { ArrowLeft, Send, Trash2, Info, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import ProductSearch from '@/modules/service/components/ProductSearch';
import ImageGallery from '@/modules/shared/components/common/ImageGallery';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';
import { useToast } from '@/contexts/ToastContext';

interface ProposalItem {
    productId: number;
    productCode: string;
    productName: string;
    quantity: number;
    isService: boolean;
}

interface ReceptionDetail {
    id: number;
    plate: string;
    customerName: string;
    vehicleBrand: string;
    vehicleModel: string;
    request: string;
    odo: number;
    fuelLevel: string;
    bodyCondition: string;
    imageUrl?: string;
    status?: string;
    existingItems: any[];
}

export default function InspectPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [reception, setReception] = useState<ReceptionDetail | null>(null);
    const [proposalItems, setProposalItems] = useState<ProposalItem[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const confirm = useConfirm();
    const { showToast } = useToast();

    const source = searchParams.get('source');
    const backLink = source === 'history' ? '/mechanic/history' : '/mechanic/inspect';

    useEffect(() => {
        // @ts-ignore
        const token = session?.user?.accessToken;
        if (token && id) {
            api.get(`/mechanic/inspect/${id}`, token)
                .then(data => {
                    setReception(data);
                    // Load existing items into proposal list for view/edit
                    if (data.existingItems && data.existingItems.length > 0) {
                        setProposalItems(data.existingItems.map((i: any) => ({
                            productId: i.productId,
                            productCode: i.productCode,
                            productName: i.productName,
                            quantity: i.quantity,
                            isService: i.isService
                        })));
                    }
                })
                .catch(err => {
                    console.error(err);
                    showToast('error', "Không thể tải thông tin xe");
                    router.replace('/mechanic');
                });
        }
    }, [id, session]);

    const isReadOnly = reception?.status && reception.status !== 'TIEP_NHAN' && reception.status !== 'CHO_CHAN_DOAN';

    const handleAddProduct = (product: any) => {
        if (isReadOnly) return;
        setProposalItems(prev => {
            const exists = prev.find(p => p.productId === product.ID);
            if (exists) {
                return prev.map(p => p.productId === product.ID ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, {
                productId: product.ID,
                productCode: product.MaHang,
                productName: product.TenHang,
                quantity: 1,
                isService: product.LaDichVu
            }];
        });
    };

    const handleRemoveItem = (index: number) => {
        if (isReadOnly) return;
        setProposalItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateQuantity = (index: number, delta: number) => {
        if (isReadOnly) return;
        setProposalItems(prev => prev.map((item, i) => {
            if (i === index) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handleSubmit = async () => {
        if (isReadOnly) return;
        if (proposalItems.length === 0) return;
        const confirmed = await confirm({
            title: 'Gửi đề xuất',
            message: 'Xác nhận gửi đề xuất sửa chữa?',
            type: 'info',
            confirmText: 'Gửi'
        });
        if (!confirmed) return;

        setSubmitting(true);
        try {
            // @ts-ignore
            const token = session?.user?.accessToken;
            await api.post(`/mechanic/inspect/${id}/proposal`, proposalItems, token);

            // Invalidate cache so Dashboard updates
            api.invalidateCache('/mechanic/inspect');
            api.invalidateCache('/mechanic/inspect/history');

            await confirm({ title: 'Thành công', message: 'Đã gửi đề xuất thành công!', type: 'info', confirmText: 'OK', cancelText: '' });
            router.replace('/mechanic');
        } catch (error) {
            console.error(error);
            await confirm({ title: 'Lỗi', message: 'Lỗi khi gửi đề xuất', type: 'danger', confirmText: 'Đóng', cancelText: '' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!reception) return <div className="p-8 text-center">Đang tải...</div>;

    const getStatusText = (status: string | undefined) => {
        if (!status) return "Wait for Inspect";
        if (status === 'TIEP_NHAN' || status === 'CHO_CHAN_DOAN') return "Wait for Inspect";
        return "Đã đề xuất";
    };

    return (
        <DashboardLayout title="Chẩn đoán xe" subtitle={`Kiểm tra xe: ${reception.plate}`}>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-6">
                    <Link href={backLink} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> {source === 'history' ? 'Quay lại lịch sử' : 'Quay lại danh sách'}
                    </Link>
                </div>

                {/* Info Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Gallery - Left side on Desktop */}
                        {reception.imageUrl && (
                            <div className="w-full md:w-1/3">
                                <ImageGallery images={reception.imageUrl} />
                            </div>
                        )}

                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{reception.plate}</h2>
                                    <p className="text-slate-500">{reception.vehicleBrand} {reception.vehicleModel} - {reception.customerName}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${isReadOnly ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                        {getStatusText(reception.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Yêu cầu của khách</p>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{reception.request || "Không có"}</p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tình trạng tiếp nhận</p>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">ODO: {reception.odo} km</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Xăng: {reception.fuelLevel}</p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Thân vỏ</p>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{reception.bodyCondition || "Bình thường"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Proposal Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Product Search - HIDE if ReadOnly */}
                    {!isReadOnly && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 h-fit">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-500" />
                                Thêm hạng mục đề xuất
                            </h3>
                            <ProductSearch onProductSelect={handleAddProduct} />
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-lg flex gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>Chọn phụ tùng / công việc từ danh sách để thêm vào bảng đề xuất bên phải.</p>
                            </div>
                        </div>
                    )}

                    {/* Right: Proposal List - Expand to full width if ReadOnly */}
                    <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col ${isReadOnly ? 'col-span-2' : ''}`}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Danh sách đề xuất ({proposalItems.length})</h3>
                        </div>

                        <div className="flex-1 p-0 overflow-hidden">
                            {proposalItems.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    Chưa có hạng mục nào
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {proposalItems.map((item, idx) => (
                                        <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between group">
                                            <div>
                                                <p className="font-medium text-slate-800 dark:text-slate-200">{item.productName}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.productCode}</p>
                                            </div>
                                            {!isReadOnly && (
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                                                        <button onClick={() => handleUpdateQuantity(idx, -1)} className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">-</button>
                                                        <span className="w-8 text-center text-sm font-medium text-slate-800 dark:text-slate-200">{item.quantity}</span>
                                                        <button onClick={() => handleUpdateQuantity(idx, 1)} className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">+</button>
                                                    </div>
                                                    <button onClick={() => handleRemoveItem(idx)} className="text-slate-400 hover:text-red-500 p-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                            {isReadOnly && (
                                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                    SL: {item.quantity}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {!isReadOnly && (
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={handleSubmit}
                                    disabled={proposalItems.length === 0 || submitting}
                                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg dark:bg-white dark:text-slate-900"
                                >
                                    {submitting ? "Đang gửi..." : (
                                        <>
                                            <Send className="w-4 h-4" /> Gửi đề xuất
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
