'use client';

import { useState, useEffect } from 'react';
import { Search, Package, Wrench, Plus, Layers } from 'lucide-react';
import { searchProductsForMechanic, getTopProductsForMechanic } from '@/modules/service/mechanic';
import { useDebounce } from '@/hooks/useDebounce';

type Product = {
    id: number;
    code: string;
    name: string;
    isService: boolean;
    stock: number;
};

interface ProductSearchMechanicProps {
    onSelect: (product: Product) => void;
}

export default function ProductSearchMechanic({ onSelect }: ProductSearchMechanicProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [topProducts, setTopProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'SERVICE' | 'PART'>('ALL');

    const debouncedQuery = useDebounce(query, 300);

    // Initial load for quick select
    useEffect(() => {
        getTopProductsForMechanic().then(setTopProducts);
    }, []);

    // Search logic
    useEffect(() => {
        if (debouncedQuery.length >= 1) {
            setLoading(true);
            searchProductsForMechanic(debouncedQuery)
                .then(setResults)
                .finally(() => setLoading(false));
        } else {
            setResults([]);
        }
    }, [debouncedQuery]);

    const handleSelect = (product: Product) => {
        onSelect(product);
        setQuery('');
        setResults([]);
        setShowResults(false);
        // Reset filter when selecting? No, keep it.
    };

    // Filter displayed list
    const getDisplayList = () => {
        let list = query.length >= 1 ? results : topProducts;

        if (filter === 'SERVICE') return list.filter(p => p.isService);
        if (filter === 'PART') return list.filter(p => !p.isService);
        return list;
    };

    const displayList = getDisplayList();

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowResults(true)}
                    placeholder="Tìm phụ tùng hoặc dịch vụ..."
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
                />
            </div>

            {/* Dropdown Results */}
            {showResults && (
                <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-[400px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Filter Tabs */}
                    <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'ALL' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:bg-white/50'}`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilter('SERVICE')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'SERVICE' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:bg-white/50'}`}
                        >
                            Dịch vụ
                        </button>
                        <button
                            onClick={() => setFilter('PART')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'PART' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:bg-white/50'}`}
                        >
                            Phụ tùng
                        </button>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                Đang tìm...
                            </div>
                        ) : displayList.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                Không tìm thấy kết quả
                            </div>
                        ) : (
                            displayList.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => handleSelect(product)}
                                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-50 rounded-lg text-left transition-colors group"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${product.isService ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {product.isService ? <Wrench className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 truncate group-hover:text-blue-700">{product.name}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-2">
                                            <span>{product.code}</span>
                                            {!product.isService && (
                                                <span className={`${product.stock <= 0 ? 'text-red-500 font-medium' : 'text-emerald-600'}`}>
                                                    • Tồn: {product.stock}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <Plus className="w-4 h-4 text-slate-300 group-hover:text-slate-900" />
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer Hint */}
                    <div className="p-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-500 text-center">
                        {query.length < 1 ? 'Gợi ý phổ biến' : `Kết quả tìm kiếm cho "${query}"`}
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {showResults && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowResults(false)}
                />
            )}
        </div>
    );
}
