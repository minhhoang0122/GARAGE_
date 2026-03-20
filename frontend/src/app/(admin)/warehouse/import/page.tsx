'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { ArrowLeft, Plus, Save, Trash2, Search, Loader2, Package, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency, removeAccents } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { importStock } from '@/modules/inventory/warehouse';
import { getAllProducts, createProduct } from '@/modules/service/order';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/modules/shared/components/ui/dialog";
import { Label } from "@/modules/shared/components/ui/label";
import { Input } from "@/modules/shared/components/ui/input";
import { Button } from "@/modules/shared/components/ui/button";
import { useToast } from '@/modules/shared/components/ui/use-toast';
import PrintImportNote from '@/modules/inventory/components/PrintImportNote';
import { api } from '@/lib/api';

interface Product {
    ID: number;
    MaHang: string;
    TenHang: string;
    GiaVon: number; // Cost Price
    GiaBanNiemYet?: number; // List Price
    SoLuongTon: number;
    LaDichVu: boolean;
}

interface ImportItem {
    product: Product;
    quantity: number;
    costPrice: number;
    vatRate?: number;
    expiryDate?: string;
    sellingPrice?: number;
    updateGlobalPrice?: boolean;
}

import { usePermission } from '@/hooks/usePermission';

export default function ImportStockPage() {
    const { data: session } = useSession();
    const { hasPermission, isAdmin } = usePermission();

    // In import page, ADMIN or those with MANAGE_INVENTORY can manage prices
    const isAdminOrManager = isAdmin || hasPermission('MANAGE_INVENTORY');
    const isAdminOrSale = isAdminOrManager; // Reusing for compatibility with existing logic

    const router = useRouter();
    const [supplierName, setSupplierName] = useState('');
    const [note, setNote] = useState('');
    const [items, setItems] = useState<ImportItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [printData, setPrintData] = useState<any>(null);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Selected Product for Adding
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [addQuantity, setAddQuantity] = useState<number>(1);
    const [addCostPrice, setAddCostPrice] = useState<number>(0);
    const [addExpiry, setAddExpiry] = useState<string>('');

    // Quick Create State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', code: '', costPrice: 0, minStock: 5 });
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateProduct = async () => {
        if (!newProduct.name || !newProduct.code) {
            toast({ title: "Lỗi", description: "Vui lòng nhập tên và mã sản phẩm", variant: "destructive" });
            return;
        }

        setIsCreating(true);
        try {
            const res = await createProduct({
                ...newProduct,
                tenHang: newProduct.name,
                maHang: newProduct.code,
                giaVon: newProduct.costPrice,
                dinhMucTonToiThieu: newProduct.minStock
            });

            if (res.success) {
                toast({ title: "Thành công", description: "Đã tạo sản phẩm mới", variant: "default" });
                setIsCreateOpen(false);

                // Invalidate cache
                api.invalidateCache('/warehouse/products');

                // Refresh list and select new product
                const all = await getAllProducts();
                // @ts-ignore
                const parts = all.filter(p => !p.LaDichVu);
                setAllProducts(parts); // Update global list

                // Auto Search & Select if possible, or just let user find it
                setSearchTerm(newProduct.code);
            } else {
                toast({ title: "Lỗi", description: "Lỗi: " + res.error, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Lỗi", description: "Có lỗi xảy ra", variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    };

    const debouncedSearch = useDebounce(searchTerm, 300);

    // Load Products
    // Load Products
    useEffect(() => {
        const load = async () => {
            const res = await getAllProducts();
            // Filter only Parts (not Services) for Import? 
            // Usually we only import parts.
            const parts = (res as any[]).filter(p => !p.LaDichVu);
            setAllProducts(parts);
        };
        load();
    }, []);

    const { toast } = useToast();

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter Logic
    useEffect(() => {
        // Safety check for allProducts
        if (!allProducts || allProducts.length === 0) return;

        if (!debouncedSearch) {
            // Show first 10 items if searching without keyword (e.g. on focus)
            if (isSearching) {
                setFilteredProducts(allProducts.slice(0, 10));
            } else {
                setFilteredProducts([]);
            }
            return;
        }

        const term = removeAccents(debouncedSearch.toLowerCase().trim());
        const results = allProducts.filter(p => {
            // Safety checks for properties
            const name = p.TenHang ? removeAccents(p.TenHang.toLowerCase()) : '';
            const code = p.MaHang ? removeAccents(p.MaHang.toLowerCase()) : '';

            // Allow matching "lop" to "Lốp" (via removeAccents) OR "lốp" to "Lốp" (via includes)
            return name.includes(term) ||
                code.includes(term) ||
                (p.TenHang && p.TenHang.toLowerCase().includes(debouncedSearch.toLowerCase()));
        });
        setFilteredProducts(results.slice(0, 10)); // Limit 10
    }, [debouncedSearch, allProducts, isSearching]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsSearching(false);
                setFilteredProducts([]);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectProduct = (p: Product) => {
        setSelectedProduct(p);
        setAddCostPrice(p.GiaVon || 0);
        setAddQuantity(1);
        setSearchTerm(''); // Clear search
        setFilteredProducts([]);
        setIsSearching(false);
    };

    const handleAddItem = () => {
        if (!selectedProduct) return;
        if (addQuantity <= 0) {
            toast({ title: "Lỗi", description: 'Số lượng phải > 0', variant: "destructive" });
            return;
        }
        if (addCostPrice < 0) {
            toast({ title: "Lỗi", description: 'Giá nhập không hợp lệ', variant: "destructive" });
            return;
        }

        setItems(prev => [
            ...prev,
            {
                product: selectedProduct,
                quantity: addQuantity,
                costPrice: addCostPrice,
                vatRate: 0,
                expiryDate: addExpiry || undefined,
            }
        ]);
        setSelectedProduct(null);
        setAddQuantity(1);
        setAddCostPrice(0);
        setAddExpiry('');
    };

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!supplierName) {
            toast({ title: "Thiếu thông tin", description: 'Vui lòng nhập tên nhà cung cấp', variant: "destructive" });
            return;
        }
        if (items.length === 0) {
            toast({ title: "Thiếu thông tin", description: 'Danh sách nhập kho trống', variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const data = {
                supplierName,
                note,
                items: items.map(i => ({
                    productId: i.product.ID,
                    quantity: i.quantity,
                    costPrice: i.costPrice,
                    vatRate: 0, // VAT removed, set to 0
                    expiryDate: i.expiryDate,
                }))
            };

            const result = await importStock(data);
            if (result.success) {
                if (isAdminOrSale) {
                    toast({ title: "Thành công", description: 'Nhập kho thành công!', variant: "default" });
                } else {
                    toast({ title: "Thành công", description: 'Đã gửi yêu cầu nhập kho. Vui lòng chờ duyệt.', variant: "default" });
                }

                // Invalidate cache
                api.invalidateCache('/warehouse/stats');
                api.invalidateCache('/warehouse/products');
                api.invalidateCache('/warehouse/history'); // If it exists

                // Fetch print data
                try {
                    // @ts-ignore
                    const token = JSON.parse(localStorage.getItem('session'))?.user?.accessToken || '';
                    const detail = await api.get(`/warehouse/import/${result.importId}`, token);
                    setPrintData(detail);
                } catch (err) {
                    console.error("Could not fetch print data", err);
                    router.replace('/warehouse');
                }

            } else {
                toast({ title: "Lỗi", description: 'Lỗi: ' + result.error, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Lỗi", description: 'Có lỗi xảy ra', variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClosePrint = () => {
        setPrintData(null);
        router.replace('/warehouse');
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);

    return (
        <DashboardLayout title="Nhập kho" subtitle="Tạo phiếu nhập kho mới">
            {printData && (
                <PrintImportNote data={printData} onClose={handleClosePrint} />
            )}

            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Link href="/warehouse" className="flex items-center gap-2 text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: General Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Thông tin chung</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nhà cung cấp (*)</label>
                                    <input
                                        type="text"
                                        value={supplierName}
                                        onChange={e => setSupplierName(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="VD: Công ty Lốp Michelin"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ghi chú</label>
                                    <textarea
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                        placeholder="Số hóa đơn, ghi chú..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Add Product Search & Quick Create */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                            {!selectedProduct ? (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Thêm sản phẩm</h3>

                                        <button
                                            onClick={() => setIsCreateOpen(true)}
                                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" /> Thêm mới
                                        </button>

                                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Thêm phụ tùng mới</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="code" className="text-right">Mã (*)</Label>
                                                        <Input id="code" value={newProduct.code} onChange={e => setNewProduct({ ...newProduct, code: e.target.value })} className="col-span-3" />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="name" className="text-right">Tên (*)</Label>
                                                        <Input id="name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="col-span-3" />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="cost" className="text-right">Giá vốn (VNĐ)</Label>
                                                        <Input
                                                            id="cost"
                                                            type="text"
                                                            value={newProduct.costPrice === 0 ? '' : new Intl.NumberFormat('vi-VN').format(newProduct.costPrice)}
                                                            onChange={e => {
                                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                                setNewProduct({ ...newProduct, costPrice: Number(val) });
                                                            }}
                                                            className="col-span-3 font-mono"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="minStock" className="text-right">Định mức</Label>
                                                        <Input
                                                            id="minStock"
                                                            type="text"
                                                            value={newProduct.minStock}
                                                            onChange={e => {
                                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                                setNewProduct({ ...newProduct, minStock: Number(val) });
                                                            }}
                                                            className="col-span-3"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>
                                                        Hủy
                                                    </Button>
                                                    <Button onClick={handleCreateProduct} disabled={isCreating}>
                                                        {isCreating && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Lưu
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    <div className="relative mb-4" ref={wrapperRef}>
                                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Tìm phụ tùng (Tên hoặc Mã)..."
                                            value={searchTerm}
                                            onFocus={() => {
                                                setIsSearching(true);
                                                if (!searchTerm && allProducts.length > 0) {
                                                    setFilteredProducts(allProducts.slice(0, 10));
                                                }
                                            }}
                                            onChange={e => {
                                                setSearchTerm(e.target.value);
                                                setIsSearching(true);
                                            }}
                                            className="w-full pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        {searchTerm && (
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setFilteredProducts([]);
                                                }}
                                                className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}

                                        {filteredProducts.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-80 overflow-auto divide-y divide-slate-100 dark:divide-slate-800">
                                                {filteredProducts.map(p => (
                                                    <button
                                                        key={p.ID}
                                                        onClick={() => handleSelectProduct(p)}
                                                        className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-start gap-3 group transition-colors"
                                                    >
                                                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors mt-0.5">
                                                            <Package className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-slate-700 dark:text-slate-200 truncate" title={p.TenHang}>
                                                                {p.TenHang}
                                                            </div>
                                                            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                                <span className="font-mono text-slate-600 dark:text-slate-400">
                                                                    {p.MaHang}
                                                                </span>
                                                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.GiaVon || 0)}
                                                                </span>
                                                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                                                <span>Tồn: {p.SoLuongTon}</span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex justify-between items-center border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">{selectedProduct.TenHang}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedProduct.MaHang}</p>
                                        </div>
                                        <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm">
                                            Chọn lại
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Số lượng</label>
                                            <input
                                                type="text"
                                                value={addQuantity}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    setAddQuantity(Number(val));
                                                }}
                                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-lg"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Giá nhập (VNĐ)</label>
                                            <input
                                                type="text"
                                                value={addCostPrice === 0 ? '' : new Intl.NumberFormat('vi-VN').format(addCostPrice)}
                                                onChange={e => {
                                                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                                    setAddCostPrice(Number(rawValue));
                                                }}
                                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-lg font-mono"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Hạn sử dụng (Tùy chọn)</label>
                                        <input
                                            type="date"
                                            value={addExpiry || ''}
                                            onChange={e => setAddExpiry(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-lg"
                                        />
                                    </div>

                                    <button
                                        onClick={handleAddItem}
                                        className="w-full py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" /> Thêm vào phiếu
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Items Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[500px] flex flex-col transition-colors">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Chi tiết phiếu nhập</h3>
                                <span className="font-mono font-medium text-lg dark:text-slate-200">
                                    Tổng: {formatCurrency(totalAmount)}
                                </span>
                            </div>

                            <div className="flex-1 overflow-auto">
                                <table className="w-full min-w-[1000px]">
                                    <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Mã hàng</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Tên hàng</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">SL</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Giá nhập</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Thành tiền</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Xóa</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.product.MaHang}</td>
                                                <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-200 font-medium">{item.product.TenHang}</td>
                                                <td className="px-6 py-4 text-sm text-right dark:text-slate-300">{item.quantity}</td>
                                                <td className="px-6 py-4 text-sm text-right dark:text-slate-300">{formatCurrency(item.costPrice)}</td>
                                                <td className="px-6 py-4 text-sm text-right font-medium dark:text-slate-200">{formatCurrency(item.quantity * item.costPrice)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleRemoveItem(idx)}
                                                        className="text-red-400 hover:text-red-600 p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {items.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                                    Chưa có sản phẩm nào
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || items.length === 0}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-sm"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Hoàn tất nhập kho (Tổng: {formatCurrency(items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0))})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout >
    );
}
