'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Package, Wrench, Loader2 } from 'lucide-react';
import { searchProducts, addItemToOrder, getAllProducts } from '@/modules/service/order';
import { useDebounce } from '@/hooks/use-debounce';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

interface ProductSearchProps {
    orderId?: number;
    readOnly?: boolean;
    onProductSelect?: (product: Product) => void;
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

export default function ProductSearch({ orderId, readOnly = false, onProductSelect }: ProductSearchProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('all');

    const debouncedSearch = useDebounce(searchTerm, 300);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Load all products when dropdown opens
    useEffect(() => {
        if (isOpen && allProducts.length === 0) {
            setIsLoading(true);
            getAllProducts().then((products) => {
                setAllProducts(products);
                setResults(products);
                setIsLoading(false);
            }).catch(() => setIsLoading(false));
        }
    }, [isOpen, allProducts.length]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter products based on search term and active tab
    useEffect(() => {
        let filtered = allProducts;

        // Filter by tab
        if (activeTab === 'parts') {
            filtered = filtered.filter(p => !p.LaDichVu);
        } else if (activeTab === 'services') {
            filtered = filtered.filter(p => p.LaDichVu);
        }

        // Filter by search term
        if (debouncedSearch.length >= 1) {
            const term = debouncedSearch.toLowerCase();
            filtered = filtered.filter(p =>
                p.TenHang.toLowerCase().includes(term) ||
                p.MaHang.toLowerCase().includes(term)
            );
        }

        setResults(filtered);
    }, [debouncedSearch, allProducts, activeTab]);

    const handleSelectProduct = async (product: Product) => {
        if (onProductSelect) {
            onProductSelect(product);
            setSearchTerm('');
            setIsOpen(false);
            return;
        }

        if (!orderId) {
            console.error("Order ID is missing");
            return;
        }

        setIsAdding(true);
        try {
            await addItemToOrder(orderId, product.ID, 1);
            setSearchTerm('');
            setIsOpen(false);
            showToast('success', 'Đã thêm vào báo giá');
            router.refresh();
        } catch (error) {
            showToast('error', 'Lỗi thêm sản phẩm');
        } finally {
            setIsAdding(false);
        }
    };

    const handleFocus = () => {
        if (!readOnly) {
            setIsOpen(true);
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={handleFocus}
                    placeholder={readOnly ? "Báo giá đã chốt" : "Nhấp vào để chọn hoặc gõ tìm kiếm..."}
                    className={`w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${readOnly ? 'bg-slate-50 dark:bg-slate-900 cursor-not-allowed' : ''}`}
                    disabled={isAdding || readOnly}
                />
                {isAdding && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                    </div>
                )}
            </div>

            {isOpen && !readOnly && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-h-96 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'all' ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white bg-white dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Tất cả ({allProducts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('parts')}
                            className={`flex-1 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'parts' ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white bg-white dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            <Package className="w-4 h-4" /> Phụ tùng
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`flex-1 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'services' ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 bg-white dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            <Wrench className="w-4 h-4" /> Dịch vụ
                        </button>
                    </div>

                    {/* Product List */}
                    <div className="max-h-72 overflow-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-slate-500">
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            </div>
                        ) : results.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                                Không tìm thấy sản phẩm nào
                            </div>
                        ) : (
                            results.map((product) => (
                                <button
                                    key={product.ID}
                                    onClick={() => handleSelectProduct(product)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${product.LaDichVu ? 'bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                                            {product.LaDichVu ? <Wrench className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-slate-100">{product.TenHang}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 flex gap-2">
                                                <span>{product.MaHang}</span>
                                                {!product.LaDichVu && (
                                                    <span className="text-slate-400">| Tồn: {product.SoLuongTon}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(product.GiaBanNiemYet))}
                                        </p>
                                        <span className="text-xs text-indigo-600 font-medium">+ Thêm</span>
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
