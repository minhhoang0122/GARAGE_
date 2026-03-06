'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Package, Wrench, Loader2, AlertCircle } from 'lucide-react';
import { getAllProducts } from '@/modules/service/order';
import { reportTechnicalIssue } from '@/modules/service/mechanic';
import { useDebounce } from '@/hooks/use-debounce';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';

interface MechanicProductSearchProps {
    orderId: number;
    disabled?: boolean;
}

interface Product {
    ID: number;
    MaHang: string;
    TenHang: string;
    GiaBanNiemYet: number;
    LaDichVu: boolean;
    SoLuongTon: number;
}

type TabType = 'all' | 'parts' | 'services';

export default function MechanicProductSearch({ orderId, disabled = false }: MechanicProductSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const confirm = useConfirm();

    const debouncedSearch = useDebounce(searchTerm, 300);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadAll = async () => {
            try {
                const products = await getAllProducts();
                setAllProducts(products as Product[]);
            } catch (error) {
                console.error("Load products error", error);
            }
        };
        loadAll();
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        let filtered = allProducts;
        if (activeTab === 'parts') {
            filtered = filtered.filter(p => !p.LaDichVu);
        } else if (activeTab === 'services') {
            filtered = filtered.filter(p => p.LaDichVu);
        }
        if (debouncedSearch.length >= 1) {
            const term = debouncedSearch.toLowerCase();
            filtered = filtered.filter(p =>
                p.TenHang.toLowerCase().includes(term) ||
                p.MaHang.toLowerCase().includes(term)
            );
        }
        setResults(filtered);
    }, [debouncedSearch, allProducts, activeTab]);

    const handleReportItem = async (product: Product) => {
        const confirmed = await confirm({
            title: 'Báo phát sinh',
            message: `Xác nhận báo phát sinh: ${product.TenHang}?`,
            type: 'warning',
            confirmText: 'Xác nhận'
        });
        if (!confirmed) return;

        setIsReporting(true);
        try {
            const result = await reportTechnicalIssue(orderId, [{ productId: product.ID, quantity: 1 }]);
            if (result.success) {
                setSearchTerm('');
                setIsOpen(false);
                await confirm({ title: 'Thành công', message: 'Đã gửi yêu cầu phát sinh tới Sale.', type: 'info', confirmText: 'OK', cancelText: '' });
            } else {
                await confirm({ title: 'Lỗi', message: result.error, type: 'danger', confirmText: 'Đóng', cancelText: '' });
            }
        } catch (error) {
            await confirm({ title: 'Lỗi', message: 'Lỗi khi gửi yêu cầu', type: 'danger', confirmText: 'Đóng', cancelText: '' });
        } finally {
            setIsReporting(false);
        }
    };

    return (
        <div className="relative mt-6" ref={wrapperRef}>
            <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Báo phát sinh kỹ thuật (Phụ tùng/Dịch vụ mới)</h3>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => !disabled && setIsOpen(true)}
                    placeholder={disabled ? "Chỉ thợ được phân công mới có thể báo phát sinh" : "Tìm phụ tùng/dịch vụ phát sinh..."}
                    className={`w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm transition-colors ${disabled ? 'bg-slate-50 dark:bg-slate-800 cursor-not-allowed text-slate-500' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'}`}
                    disabled={isReporting || disabled}
                />
                {isReporting && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                    </div>
                )}
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-h-96 overflow-hidden">
                    <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'all' ? 'text-amber-600 dark:text-amber-500 border-b-2 border-amber-600 dark:border-amber-500 bg-white dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setActiveTab('parts')}
                            className={`flex-1 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'parts' ? 'text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-500 bg-white dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            <Package className="w-4 h-4" /> Phụ tùng
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`flex-1 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'services' ? 'text-purple-600 dark:text-purple-500 border-b-2 border-purple-600 dark:border-purple-500 bg-white dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            <Wrench className="w-4 h-4" /> Dịch vụ
                        </button>
                    </div>

                    <div className="max-h-72 overflow-auto custom-scrollbar">
                        {results.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                <p>Không tìm thấy kết quả phù hợp</p>
                            </div>
                        ) : (
                            results.map((product) => (
                                <button
                                    key={product.ID}
                                    onClick={() => handleReportItem(product)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${product.LaDichVu ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'}`}>
                                            {product.LaDichVu ? <Wrench className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">{product.TenHang}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{product.MaHang}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-amber-600 dark:text-amber-400 font-bold px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-100 dark:border-amber-900/30">Báo phát sinh</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
