'use client';

import { Suspense, useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { Search, Save, RefreshCw, AlertCircle, CheckCircle2, Info, Plus, FileSpreadsheet, Percent, CircleDollarSign, Package } from 'lucide-react';
import { formatCurrency, removeAccents } from '@/lib/utils';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';
import { Switch } from '@/modules/shared/components/ui/Switch';
import CurrencyInput from '@/modules/shared/components/ui/CurrencyInput';


type Product = {
    id: number;
    code: string;
    maHang: string;
    name: string;
    tenHang: string;
    description: string;
    giaBanNiemYet: number;
    giaVon: number;
    laDichVu: boolean;
    baoHanhSoThang: number;
    baoHanhKm: number;
    soLuongTon: number;
};

type PendingChange = {
    price?: number;
    warrantyMonths?: number;
    warrantyKm?: number;
};

export default function ServicesPage() {
    return (
        <DashboardLayout title="Dịch vụ & Bảng giá" subtitle="Quản lý danh mục dịch vụ và chiến lược giá">
            <Suspense fallback={<div>Loading...</div>}>
                <ServicesContent />
            </Suspense>
        </DashboardLayout>
    );
}

function ServicesContent() {
    const { data: session } = useSession();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'service' | 'part'>('service');
    const [isPricingMode, setIsPricingMode] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingChanges, setPendingChanges] = useState<Record<number, PendingChange>>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const confirm = useConfirm();

    // @ts-ignore
    const token = session?.user?.accessToken;

    useEffect(() => {
        if (!token) return;
        loadProducts();
    }, [token]);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/products', token);
            const mapped = res.map((p: any) => ({
                id: p.id,
                code: p.maHang,
                maHang: p.maHang,
                name: p.tenHang,
                tenHang: p.tenHang,
                description: p.description,
                giaBanNiemYet: p.giaBanNiemYet,
                giaVon: p.giaVon || 0,
                laDichVu: !!p.laDichVu,
                baoHanhSoThang: p.baoHanhSoThang || 0,
                baoHanhKm: p.baoHanhKm || 0,
                soLuongTon: p.soLuongTon || 0
            }));
            setProducts(mapped);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Lỗi tải dữ liệu. Vui lòng thử lại.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        filterProducts(products, activeTab, searchTerm);
    }, [searchTerm, products, activeTab]);

    const filterProducts = (list: Product[], tab: 'service' | 'part', term: string) => {
        const normalizedTerm = removeAccents(term.toLowerCase());
        const filtered = list.filter((p) => {
            const matchesTab = (tab === 'service') === !!p.laDichVu;
            const matchesSearch = removeAccents(p.tenHang.toLowerCase()).includes(normalizedTerm) ||
                removeAccents(p.maHang.toLowerCase()).includes(normalizedTerm);
            return matchesTab && matchesSearch;
        });
        setFilteredProducts(filtered);
    };

    const handlePriceChange = (id: number, val: string) => {
        const num = parseInt(val.replace(/\D/g, ''), 10) || 0;
        setPendingChanges(prev => ({
            ...prev,
            [id]: { ...prev[id], price: num }
        }));
    };

    const handleWarrantyChange = (id: number, field: 'warrantyMonths' | 'warrantyKm', val: string) => {
        const num = parseInt(val.replace(/\D/g, ''), 10) || 0;
        setPendingChanges(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: num }
        }));
    };

    const hasChanges = Object.keys(pendingChanges).length > 0;

    const handleSave = async () => {
        if (!hasChanges) return;
        const confirmed = await confirm({
            title: 'Cập nhật dữ liệu',
            message: `Bạn có chắc muốn cập nhật cho ${Object.keys(pendingChanges).length} mục?`,
            type: 'warning',
            confirmText: 'Cập nhật'
        });
        if (!confirmed) return;

        setIsSaving(true);
        setMessage(null);

        try {
            const items = Object.entries(pendingChanges).map(([id, changes]) => ({
                id: parseInt(id),
                ...changes
            }));

            await api.post('/products/batch-update', items, token);

            setMessage({ type: 'success', text: 'Cập nhật thành công!' });
            setPendingChanges({});
            loadProducts();
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Lỗi: ' + (error.message || 'Không thể lưu') });
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportExcel = () => {
        const now = new Date();
        const dateStr = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
        const fileName = `BangGia_${activeTab}_${dateStr}.csv`;
        const headers = ["Mã Hàng", "Tên Hàng", "Phân loại", "Tồn Kho", "Giá Vốn", "Giá Bán", "Lợi Nhuận (%)", "BH (Tháng)", "BH (Km)"];

        const rows = filteredProducts.map(p => {
            const currentPrice = pendingChanges[p.id]?.price !== undefined ? pendingChanges[p.id].price! : (p.giaBanNiemYet || 0);
            const costPrice = p.giaVon || 0;
            const profitPercent = costPrice > 0 ? ((currentPrice - costPrice) / costPrice) * 100 : 100;

            return [
                p.maHang,
                `"${p.tenHang.replace(/"/g, '""')}"`,
                p.laDichVu ? "Dịch vụ" : "Phụ tùng",
                p.soLuongTon,
                costPrice,
                currentPrice,
                profitPercent.toFixed(2),
                p.baoHanhSoThang,
                p.baoHanhKm
            ].join(",");
        });

        const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatForInput = (val: number) => {
        return new Intl.NumberFormat('vi-VN').format(val);
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pb-20">
            {/* Top Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-stone-50 dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-stone-200/70 dark:border-slate-800">

                {/* Left: Tabs & Mode */}
                <div className="flex flex-col sm:flex-row gap-5 w-full lg:w-auto items-center">
                    {/* Tabs */}
                    <div className="flex bg-stone-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('service')}
                            className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'service' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-stone-200 dark:ring-0' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Dịch vụ
                        </button>
                        <button
                            onClick={() => setActiveTab('part')}
                            className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'part' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-0' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Phụ tùng
                        </button>
                    </div>

                    <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700"></div>

                    {/* Pricing Mode Toggle */}
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <Switch
                            checked={isPricingMode}
                            onCheckedChange={setIsPricingMode}
                        />
                        <span className={`text-sm font-medium ${isPricingMode ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                            {isPricingMode ? '✏️ Chế độ sửa giá' : 'Chế độ xem'}
                        </span>
                    </div>
                </div>

                {/* Center: Search */}
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder={activeTab === 'service' ? "Tìm dịch vụ..." : "Tìm phụ tùng..."}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Right: Actions */}
                <div className="flex gap-2 w-full lg:w-auto justify-end">
                    {isPricingMode && (
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                            title="Xuất Excel"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <span className="hidden sm:inline">Excel</span>
                        </button>
                    )}

                    {!isPricingMode && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-sm hover:shadow active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Thêm mới</span>
                        </button>
                    )}

                    <button
                        onClick={loadProducts}
                        className="p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        title="Tải lại"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold shadow-sm transition-all ${hasChanges
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                            }`}
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Lưu...' : `Lưu (${Object.keys(pendingChanges).length})`}
                    </button>
                </div>
            </div>

            {/* Helper Banner */}
            {isPricingMode && (
                <div className="flex items-start gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-xl">
                    <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                        {activeTab === 'service' ? (
                            <p>
                                <strong>Lưu ý về Dịch vụ:</strong> Đại đa số dịch vụ không có giá vốn cố định (0đ).
                                Bạn có thể nhập <span className="text-indigo-600 font-medium">Giá vốn ước tính</span> (nhân công, khấu hao) để hệ thống tính toán biên lợi nhuận chính xác hơn.
                            </p>
                        ) : (
                            <p>
                                <strong>Chiến lược giá Phụ tùng:</strong> Điều chỉnh giá bán để đạt <span className="text-emerald-600 font-medium">Biên lợi nhuận mục tiêu</span>.
                                Những mục có lợi nhuận dưới 15% sẽ được cảnh báo đỏ.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Feedback Message */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm border ${message.type === 'success'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-400'
                    : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            {/* Table */}
            <div className="bg-stone-50 dark:bg-slate-900 rounded-xl shadow-sm border border-stone-200/70 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                <th className="pl-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-full">Mã / Tên Dịch Vụ</th>

                                {!isPricingMode && (
                                    <>
                                        <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-[150px] whitespace-nowrap">Bảo Hành (Tháng)</th>
                                        <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-[150px] whitespace-nowrap">Bảo Hành (Km)</th>
                                        <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-[180px] pr-8 whitespace-nowrap">Giá Niêm Yết</th>
                                    </>
                                )}

                                {isPricingMode && (
                                    <>
                                        {activeTab === 'part' && (
                                            <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-[120px]">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Package className="w-3 h-3 text-slate-400" />
                                                    Tồn kho
                                                </div>
                                            </th>
                                        )}
                                        <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-[150px]">
                                            <div className="flex items-center justify-end gap-1">
                                                <CircleDollarSign className="w-3 h-3 text-slate-400" />
                                                {activeTab === 'service' ? 'Giá Vốn (Est)' : 'Giá Vốn'}
                                            </div>
                                        </th>
                                        <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-[200px]">
                                            {activeTab === 'service' ? 'Phí Dịch Vụ' : 'Giá Bán (VNĐ)'}
                                        </th>
                                        <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-[120px] pr-6">
                                            <div className="flex items-center justify-end gap-1">
                                                <Percent className="w-3 h-3 text-slate-400" />
                                                Lợi nhuận
                                            </div>
                                        </th>
                                    </>
                                )}

                                <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-[120px] pr-4">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                <tr><td colSpan={10} className="p-12 text-center text-slate-500 dark:text-slate-400">Đang tải dữ liệu...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan={10} className="p-12 text-center text-slate-500 dark:text-slate-400">Không tìm thấy dữ liệu phù hợp</td></tr>
                            ) : (
                                filteredProducts.map(p => {
                                    const changes = pendingChanges[p.id] || {};
                                    const isPriceChanged = changes.price !== undefined && changes.price !== p.giaBanNiemYet;
                                    const isMonthChanged = changes.warrantyMonths !== undefined && changes.warrantyMonths !== p.baoHanhSoThang;
                                    const isKmChanged = changes.warrantyKm !== undefined && changes.warrantyKm !== p.baoHanhKm;
                                    const hasAnyChange = isPriceChanged || isMonthChanged || isKmChanged;

                                    const currentPrice = changes.price !== undefined ? changes.price : (p.giaBanNiemYet || 0);
                                    const costPrice = p.giaVon || 0;
                                    const profitPercent = costPrice > 0
                                        ? ((currentPrice - costPrice) / costPrice) * 100
                                        : (currentPrice > 0 ? 100 : 0);

                                    return (
                                        <tr key={p.id} className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${hasAnyChange ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''}`}>

                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p.tenHang}</div>
                                                <div className="text-[11px] font-mono text-slate-400 mt-0.5">{p.maHang}</div>
                                            </td>

                                            {!isPricingMode && (
                                                <>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-center">
                                                            <input
                                                                type="text"
                                                                className={`w-20 px-2 py-1.5 text-center text-sm border rounded hover:border-indigo-300 focus:outline-none focus:ring-2 bg-transparent ${isMonthChanged ? 'border-indigo-500 ring-1 ring-indigo-200 bg-white' : 'border-transparent group-hover:bg-white group-hover:border-slate-200'}`}
                                                                value={changes.warrantyMonths !== undefined ? changes.warrantyMonths : p.baoHanhSoThang}
                                                                onChange={(e) => handleWarrantyChange(p.id, 'warrantyMonths', e.target.value)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-center">
                                                            <input
                                                                type="text"
                                                                className={`w-24 px-2 py-1.5 text-center text-sm border rounded hover:border-indigo-300 focus:outline-none focus:ring-2 bg-transparent ${isKmChanged ? 'border-indigo-500 ring-1 ring-indigo-200 bg-white' : 'border-transparent group-hover:bg-white group-hover:border-slate-200'}`}
                                                                value={changes.warrantyKm !== undefined ? formatForInput(changes.warrantyKm) : formatForInput(p.baoHanhKm)}
                                                                onChange={(e) => handleWarrantyChange(p.id, 'warrantyKm', e.target.value)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-medium text-slate-700 dark:text-slate-300 pr-8 whitespace-nowrap">
                                                        {formatCurrency(p.giaBanNiemYet)}
                                                    </td>
                                                </>
                                            )}

                                            {isPricingMode && (
                                                <>
                                                    {activeTab === 'part' && (
                                                        <td className="px-6 py-4 text-right font-mono text-slate-500 text-xs">
                                                            {p.soLuongTon}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 text-right text-sm text-slate-500">
                                                        {formatCurrency(costPrice)}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex justify-center">
                                                            <input
                                                                type="text"
                                                                className={`w-36 px-3 py-1.5 text-right font-bold text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${isPriceChanged
                                                                    ? 'border-emerald-500 ring-1 ring-emerald-200 text-emerald-700 bg-white'
                                                                    : 'border-slate-200 bg-slate-50/50 group-hover:bg-white group-hover:border-slate-300'}`}
                                                                value={changes.price !== undefined ? formatForInput(changes.price) : formatForInput(p.giaBanNiemYet)}
                                                                onChange={(e) => handlePriceChange(p.id, e.target.value)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className={`px-6 py-4 text-right font-mono font-bold text-xs pr-6 ${profitPercent < 15 ? "text-rose-500" : "text-emerald-600"}`}>
                                                        {profitPercent.toFixed(1)}%
                                                    </td>
                                                </>
                                            )}

                                            <td className="px-4 py-4 text-center pr-4">
                                                {hasAnyChange ? (
                                                    <span className="inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider dark:bg-indigo-900/30 dark:text-indigo-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                                        Đã sửa
                                                    </span>
                                                ) : (
                                                    <span className="text-transparent">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {isCreating && (
                <CreateProductModal
                    isOpen={isCreating}
                    onClose={() => setIsCreating(false)}
                    onSuccess={() => {
                        setIsCreating(false);
                        loadProducts();
                        setMessage({ type: 'success', text: 'Thêm mới thành công' });
                    }}
                    type={activeTab}
                    token={token}
                />
            )}
        </div>
    );
}

function CreateProductModal({ isOpen, onClose, onSuccess, type, token }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; type: 'service' | 'part'; token?: string }) {
    const [formData, setFormData] = useState({
        maHang: '',
        tenHang: '',
        giaBanNiemYet: 0,
        giaVon: 0,
        laDichVu: type === 'service',
        baoHanhSoThang: 0,
        baoHanhKm: 0,
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/products', formData, token || '');
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Lỗi tạo mới');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                        {type === 'service' ? 'Thêm Dịch Vụ Mới' : 'Thêm Phụ Tùng Mới'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã {type === 'service' ? 'dịch vụ' : 'phụ tùng'}</label>
                            <input
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700 transition-all"
                                value={formData.maHang}
                                onChange={(e) => setFormData({ ...formData, maHang: e.target.value })}
                                placeholder="VD: DV001"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên {type === 'service' ? 'dịch vụ' : 'phụ tùng'}</label>
                            <input
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700 transition-all"
                                value={formData.tenHang}
                                onChange={(e) => setFormData({ ...formData, tenHang: e.target.value })}
                                placeholder="VD: Thay nhớt..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá bán (VNĐ)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700 transition-all font-mono"
                                value={formData.giaBanNiemYet}
                                onChange={(e) => setFormData({ ...formData, giaBanNiemYet: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        {!formData.laDichVu && (
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá vốn (VNĐ)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700 transition-all font-mono"
                                    value={formData.giaVon}
                                    onChange={(e) => setFormData({ ...formData, giaVon: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Bảo hành (Tháng)</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700 transition-all"
                                value={formData.baoHanhSoThang}
                                onChange={(e) => setFormData({ ...formData, baoHanhSoThang: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Bảo hành (KM)</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700 transition-all"
                                value={formData.baoHanhKm}
                                onChange={(e) => setFormData({ ...formData, baoHanhKm: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Mô tả chi tiết</label>
                        <textarea
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700 transition-all resize-none"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-md shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:shadow-none"
                        >
                            {isSubmitting ? 'Đang tạo...' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
