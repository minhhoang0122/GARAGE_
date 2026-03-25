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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/modules/shared/components/ui/dialog";
import { Label } from "@/modules/shared/components/ui/label";
import { Input } from "@/modules/shared/components/ui/input";
import { Button } from "@/modules/shared/components/ui/button";
import { useToast } from '@/modules/shared/components/ui/use-toast';
import PrintImportNote from '@/modules/inventory/components/PrintImportNote';
import { api } from '@/lib/api';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { importSchema, type ImportSchema } from '@/app/(admin)/warehouse/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/modules/shared/components/ui/form';
import { Checkbox } from '@/modules/shared/components/ui/checkbox';
import { usePermission } from '@/hooks/usePermission';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Product {
    ID: number;
    MaHang: string;
    TenHang: string;
    GiaVon: number;
    GiaBanNiemYet?: number;
    SoLuongTon: number;
    LaDichVu: boolean;
}

export default function ImportStockPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const { hasPermission, isAdmin } = usePermission();
    // @ts-ignore
    const token = session?.user?.accessToken;

    const { data: allProducts = [] } = useQuery<Product[]>({
        queryKey: ['warehouse', 'products'],
        queryFn: async () => {
            const res = await getAllProducts();
            // @ts-ignore
            return (res as any[]).filter(p => !p.LaDichVu);
        },
        enabled: !!token
    });

    const createProductMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await createProduct(payload);
            if (!res.success) throw new Error(res.error);
            return res;
        },
        onSuccess: () => {
            toast({ title: "Thành công", description: "Đã tạo sản phẩm mới", variant: "default" });
            setIsCreateOpen(false);
            queryClient.invalidateQueries({ queryKey: ['warehouse', 'products'] });
            setSearchTerm(newProduct.code);
        },
        onError: (error: any) => {
            toast({ title: "Lỗi", description: "Lỗi: " + error.message, variant: "destructive" });
        }
    });

    const importStockMutation = useMutation({
        mutationFn: async (data: any) => {
            const result = await importStock(data);
            if (!result.success) throw new Error(result.error);
            return result;
        },
        onSuccess: async (result) => {
            if (isAdminOrSale) {
                toast({ title: "Thành công", description: 'Nhập kho thành công!', variant: "default" });
            } else {
                toast({ title: "Thành công", description: 'Đã gửi yêu cầu nhập kho. Vui lòng chờ duyệt.', variant: "default" });
            }

            queryClient.invalidateQueries({ queryKey: ['warehouse'] });

            try {
                const sessionStr = localStorage.getItem('session');
                const token = sessionStr ? JSON.parse(sessionStr)?.user?.accessToken : '';
                const detail = await api.get(`/warehouse/import/${result.importId}`, token);
                setPrintData(detail);
            } catch (err) {
                console.error("Could not fetch print data", err);
                router.replace('/warehouse');
            }
        },
        onError: (error: any) => {
            toast({ title: "Lỗi", description: 'Lỗi: ' + error.message, variant: "destructive" });
        }
    });

    const isAdminOrManager = isAdmin || hasPermission('MANAGE_INVENTORY');
    const isAdminOrSale = isAdminOrManager;

    const router = useRouter();
    const [printData, setPrintData] = useState<any>(null);

    const form = useForm<ImportSchema>({
        resolver: zodResolver(importSchema),
        defaultValues: {
            supplierName: '',
            items: [],
            note: ''
        }
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: 'items'
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [addQuantity, setAddQuantity] = useState<number>(1);
    const [addCostPrice, setAddCostPrice] = useState<number>(0);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', code: '', costPrice: 0, minStock: 5 });

    const handleCreateProduct = async () => {
        if (!newProduct.name || !newProduct.code) {
            toast({ title: "Lỗi", description: "Vui lòng nhập tên và mã sản phẩm", variant: "destructive" });
            return;
        }
        createProductMutation.mutate({
            ...newProduct,
            tenHang: newProduct.name,
            maHang: newProduct.code,
            giaVon: newProduct.costPrice,
            dinhMucTonToiThieu: newProduct.minStock
        });
    };

    const debouncedSearch = useDebounce(searchTerm, 300);
    const isCreating = createProductMutation.isPending;
    const isLoading = importStockMutation.isPending;
    const { toast } = useToast();
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!allProducts || allProducts.length === 0) return;
        if (!debouncedSearch) {
            if (isSearching) {
                setFilteredProducts(allProducts.slice(0, 10));
            } else {
                setFilteredProducts([]);
            }
            return;
        }

        const term = removeAccents(debouncedSearch.toLowerCase().trim());
        const results = allProducts.filter(p => {
            const name = p.TenHang ? removeAccents(p.TenHang.toLowerCase()) : '';
            const code = p.MaHang ? removeAccents(p.MaHang.toLowerCase()) : '';
            return name.includes(term) || code.includes(term) || (p.TenHang && p.TenHang.toLowerCase().includes(debouncedSearch.toLowerCase()));
        });
        setFilteredProducts(results.slice(0, 10));
    }, [debouncedSearch, allProducts, isSearching]);

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
        setSearchTerm('');
        setFilteredProducts([]);
        setIsSearching(false);
    };

    const onImportSubmit = (data: ImportSchema) => {
        if (data.items.length === 0) {
            toast({ title: "Lỗi", description: "Danh sách nhập kho trống", variant: "destructive" });
            return;
        }
        const payload = {
            supplierName: data.supplierName,
            note: data.note,
            items: data.items.map((i) => ({
                productId: i.product.ID,
                quantity: i.quantity,
                costPrice: i.costPrice,
                vatRate: i.vatRate,
                updateGlobalPrice: i.updateGlobalPrice
            }))
        };
        importStockMutation.mutate(payload);
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

        append({
            product: selectedProduct,
            quantity: addQuantity,
            costPrice: addCostPrice,
            vatRate: 0,
            updateGlobalPrice: false
        });

        setSelectedProduct(null);
        setAddQuantity(1);
        setAddCostPrice(0);
    };

    const handleClosePrint = () => {
        setPrintData(null);
        router.replace('/warehouse');
    };

    const totalAmount = fields.reduce((sum, field: any) => sum + (Number(field.quantity) * Number(field.costPrice)), 0);

    return (
        <DashboardLayout title="Nhập kho" subtitle="Tạo phiếu nhập kho mới">
            {printData && (
                <PrintImportNote data={printData} onClose={handleClosePrint} />
            )}

            <div className="max-w-6xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-6">
                    <Link href="/warehouse" className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Quay lại quản lý kho</span>
                    </Link>

                    <Button
                        type="button"
                        onClick={() => form.handleSubmit(onImportSubmit)()}
                        disabled={isLoading || fields.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-6 h-10 flex items-center gap-2 group"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                        {isAdminOrSale ? 'Nhập kho ngay' : 'Gửi yêu cầu nhập'}
                    </Button>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onImportSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                                    Thông tin phiếu
                                </h3>

                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="supplierName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nhà cung cấp (*)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Tên NCC..." />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="note"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ghi chú</FormLabel>
                                                <FormControl>
                                                    <textarea
                                                        {...field}
                                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                                        placeholder="Số hóa đơn, ghi chú..."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-900 dark:bg-blue-950 p-6 rounded-xl shadow-xl text-white">
                                <p className="text-slate-400 dark:text-blue-300 text-sm mb-1 uppercase tracking-wider font-bold">Tổng tiền hàng</p>
                                <p className="text-4xl font-black font-mono">
                                    {formatCurrency(totalAmount)}
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-800 dark:border-blue-900 flex justify-between text-sm">
                                    <span className="text-slate-400">Số mặt hàng:</span>
                                    <span className="font-bold">{fields.length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        Thêm sản phẩm
                                    </h3>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsCreateOpen(true)}
                                        className="h-8 text-xs font-bold border-dashed flex items-center gap-1.5"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Tạo mã mới
                                    </Button>

                                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Thêm phụ tùng mới</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="code" className="text-right font-bold">Mã (*)</Label>
                                                    <Input id="code" value={newProduct.code} onChange={e => setNewProduct({ ...newProduct, code: e.target.value })} className="col-span-3 font-mono" />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="name" className="text-right font-bold">Tên (*)</Label>
                                                    <Input id="name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="col-span-3" />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="cost" className="text-right font-bold">Giá vốn</Label>
                                                    <div className="col-span-3 relative">
                                                        <Input
                                                            id="cost"
                                                            type="text"
                                                            value={newProduct.costPrice === 0 ? '' : new Intl.NumberFormat('vi-VN').format(newProduct.costPrice)}
                                                            onChange={e => {
                                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                                setNewProduct({ ...newProduct, costPrice: Number(val) });
                                                            }}
                                                            className="font-mono pr-12"
                                                            placeholder="0"
                                                        />
                                                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">VNĐ</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>Hủy</Button>
                                                <Button type="button" onClick={handleCreateProduct} disabled={isCreating} className="bg-slate-900 text-white hover:bg-black">
                                                    {isCreating && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Lưu sản phẩm
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="space-y-4">
                                    {!selectedProduct ? (
                                        <div className="relative" ref={wrapperRef}>
                                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm theo Mã hoặc Tên phụ tùng..."
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
                                                className="w-full pl-9 pr-8 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all"
                                            />
                                            {searchTerm && (
                                                <button type="button" onClick={() => { setSearchTerm(''); setFilteredProducts([]); }} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}

                                            {filteredProducts.length > 0 && (
                                                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-auto divide-y divide-slate-100 dark:divide-slate-800 scrollbar-thin">
                                                    {filteredProducts.map(p => (
                                                        <button key={p.ID} type="button" onClick={() => handleSelectProduct(p)} className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-slate-800/80 flex items-start gap-4 group transition-colors">
                                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 transition-colors">
                                                                <Package className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-700">{p.TenHang}</div>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 font-bold">{p.MaHang}</span>
                                                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{formatCurrency(p.GiaVon || 0)}</span>
                                                                    <span className="text-[10px] text-slate-400">Tồn: {p.SoLuongTon}</span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-top-2 border-2 border-blue-500 dark:border-blue-400 rounded-xl p-4 bg-blue-50/30 dark:bg-blue-900/10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 dark:text-white leading-tight">{selectedProduct.TenHang}</h4>
                                                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5">{selectedProduct.MaHang}</p>
                                                    </div>
                                                </div>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedProduct(null)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50">
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Số lượng</Label>
                                                    <Input
                                                        type="number"
                                                        value={addQuantity}
                                                        onChange={e => setAddQuantity(Number(e.target.value))}
                                                        className="h-10 text-lg font-bold font-mono border-slate-300 focus:border-blue-500"
                                                        min={1}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Giá nhập (VNĐ)</Label>
                                                    <Input
                                                        type="text"
                                                        value={addCostPrice === 0 ? '' : new Intl.NumberFormat('vi-VN').format(addCostPrice)}
                                                        onChange={e => {
                                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                                            setAddCostPrice(Number(val));
                                                        }}
                                                        className="h-10 text-lg font-bold font-mono border-slate-300 focus:border-blue-500"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="col-span-2 md:col-span-1 flex items-end">
                                                    <Button type="button" onClick={handleAddItem} className="w-full h-10 bg-slate-900 text-white hover:bg-black font-bold uppercase tracking-wide text-xs">
                                                        Thêm vào danh sách
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors overflow-hidden">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30">
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-widest">Danh sách chờ nhập</h3>
                                    {fields.length > 0 && (
                                        <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">{fields.length} ITEMS</span>
                                    )}
                                </div>

                                <div className="overflow-x-auto min-h-[300px]">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-100 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-bold uppercase text-[10px]">Phụ tùng</th>
                                                <th className="px-4 py-3 text-center font-bold uppercase text-[10px] w-28">Số lượng</th>
                                                <th className="px-4 py-3 text-right font-bold uppercase text-[10px] w-40">Giá nhập</th>
                                                <th className="px-4 py-3 text-right font-bold uppercase text-[10px] w-40">Thành tiền</th>
                                                <th className="px-4 py-3 w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                            {fields.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="py-20 text-center text-slate-400">
                                                        Chưa có sản phẩm nào
                                                    </td>
                                                </tr>
                                            ) : (
                                                fields.map((field: any, index: number) => (
                                                    <tr key={field.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="font-bold text-slate-800 dark:text-slate-100">{field.product?.TenHang}</div>
                                                            <div className="font-mono text-[10px] text-slate-400 uppercase">{field.product?.MaHang}</div>

                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Checkbox
                                                                    checked={field.updateGlobalPrice}
                                                                    onCheckedChange={(checked) => {
                                                                        update(index, { ...field, updateGlobalPrice: checked === true });
                                                                    }}
                                                                />
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Cập nhật giá bán toàn hệ thống</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Input
                                                                type="number"
                                                                {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                                className="h-8 text-center font-bold font-mono"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Input
                                                                type="number"
                                                                {...form.register(`items.${index}.costPrice`, { valueAsNumber: true })}
                                                                className="h-8 text-right font-bold font-mono"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-black text-slate-800 dark:text-slate-100 font-mono">
                                                            {formatCurrency(field.quantity * field.costPrice)}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <Button type="button" onClick={() => remove(index)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </DashboardLayout>
    );
}
