'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Package, Wrench, Loader2 } from 'lucide-react';
import { useSearchProducts, useAddOrderItem } from '@/modules/sale/hooks/useSale';
import { api } from '@/lib/api';
import { useDebounce } from '@/hooks/use-debounce';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

interface ProductSearchProps {
    orderId?: number;
    readOnly?: boolean;
    onProductSelect?: (product: Product) => void;
}

interface Product {
    id: number;
    code: string;
    name: string;
    price: number;
    isService: boolean;
    stock: number;
}

type TabType = 'all' | 'parts' | 'services';

const EMPTY_PRODUCTS: Product[] = [];

export default function ProductSearch({ orderId, readOnly = false, onProductSelect }: ProductSearchProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('all');

    const debouncedSearch = useDebounce(searchTerm, 300);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { data: allProducts, isLoading } = useSearchProducts(debouncedSearch);
    const products = allProducts || EMPTY_PRODUCTS;
    const { mutate: addItemMatch, isPending: isAdding } = useAddOrderItem();

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
    const filteredResults = useMemo(() => {
        let filtered = products;

        // Filter by tab
        if (activeTab === 'parts') {
            filtered = filtered.filter((p: Product) => !p.isService);
        } else if (activeTab === 'services') {
            filtered = filtered.filter((p: Product) => p.isService);
        }

        // Filter by search term (optional redundant client-side filter if API returns more)
        if (debouncedSearch.length >= 1) {
            const term = debouncedSearch.toLowerCase();
            filtered = filtered.filter((p: Product) =>
                p.name.toLowerCase().includes(term) ||
                p.code.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [debouncedSearch, products, activeTab]);

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

        const isOutOfStock = !product.isService && product.stock <= 0;
        if (isOutOfStock) {
            showToast('error', 'Sản phẩm này đã hết hàng trong kho');
            return;
        }

        addItemMatch({ orderId, productId: product.id, quantity: 1 }, {
            onSuccess: () => {
                setSearchTerm('');
                setIsOpen(false);
                showToast('success', 'Đã thêm vào báo giá');
                router.refresh();
            },
            onError: (error: any) => {
                showToast('error', error.message || 'Lỗi thêm sản phẩm');
            }
        });
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
                            Tất cả ({products.length})
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
                        ) : filteredResults.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                                Không tìm thấy sản phẩm nào
                            </div>
                        ) : (
                            filteredResults.map((product) => (
                                <ProductRow
                                    key={product.id}
                                    product={product}
                                    onSelect={handleSelectProduct}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function ProductRow({ product, onSelect }: { product: Product, onSelect: (p: Product) => void }) {
    const isOutOfStock = !product.isService && product.stock <= 0;
    const [prevStock, setPrevStock] = useState(product.stock);
    const [isPulsing, setIsPulsing] = useState(false);

    useEffect(() => {
        if (product.stock !== prevStock) {
            setIsPulsing(true);
            const timer = setTimeout(() => setIsPulsing(false), 2000);
            setPrevStock(product.stock);
            return () => clearTimeout(timer);
        }
    }, [product.stock, prevStock]);

    return (
        <button
            onClick={() => !isOutOfStock && onSelect(product)}
            disabled={isOutOfStock}
            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 text-left ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''} ${isPulsing ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${product.isService ? 'bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    {product.isService ? <Wrench className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                </div>
                <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{product.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex gap-2">
                        <span>{product.code}</span>
                        {!product.isService && (
                            <span className={`${isOutOfStock ? 'text-red-500 font-bold' : isPulsing ? 'text-orange-600 font-black animate-bounce' : 'text-slate-400'} transition-all`}>
                                | Tồn: {product.stock}
                            </span>
                        )}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(product.price))}
                </p>
                {isOutOfStock ? (
                    <span className="text-xs text-red-500 font-bold tracking-tight">Hết hàng</span>
                ) : isPulsing ? (
                    <span className="text-[10px] text-orange-600 font-bold animate-pulse">Vừa thay đổi!</span>
                ) : (
                    <span className="text-xs text-indigo-600 font-medium">+ Thêm</span>
                )}
            </div>
        </button>
    );
}

