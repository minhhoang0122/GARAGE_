'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Button } from '@/modules/shared/components/ui/button';
import { Input } from '@/modules/shared/components/ui/input';
import { 
    Plus, Search, Edit2, Trash2, Building2, Phone, Mail, 
    CheckCircle2, XCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { supplierService } from '@/modules/warehouse/services/supplier';
import { Supplier } from '@/modules/warehouse/types/supplier';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/modules/shared/components/ui/dialog";
import { Label } from "@/modules/shared/components/ui/label";

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState({
        maNcc: '',
        tenNcc: '',
        phone: '',
        email: '',
        diaChi: '',
        maSoThue: '',
        ghiChu: ''
    });

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const data = await supplierService.getAll();
            setSuppliers(data);
        } catch (error) {
            toast.error('Không thể tải danh sách nhà cung cấp');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleOpenAddDialog = () => {
        setEditingSupplier(null);
        setFormData({
            maNcc: 'NCC-' + Math.floor(1000 + Math.random() * 9000),
            tenNcc: '',
            phone: '',
            email: '',
            diaChi: '',
            maSoThue: '',
            ghiChu: ''
        });
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            maNcc: supplier.maNcc || '',
            tenNcc: supplier.tenNcc || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            diaChi: supplier.diaChi || '',
            maSoThue: supplier.maSoThue || '',
            ghiChu: supplier.ghiChu || ''
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await supplierService.update(editingSupplier.id, formData);
                toast.success('Cập nhật nhà cung cấp thành công');
            } else {
                await supplierService.create(formData);
                toast.success('Thêm nhà cung cấp thành công');
            }
            setIsDialogOpen(false);
            fetchSuppliers();
        } catch (error) {
            toast.error('Lỗi khi lưu thông tin');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
            try {
                await supplierService.delete(id);
                toast.success('Xóa nhà cung cấp thành công');
                fetchSuppliers();
            } catch (error) {
                toast.error('Lỗi khi xóa nhà cung cấp');
            }
        }
    };

    const filteredSuppliers = suppliers.filter(s => 
        (s.tenNcc?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.maNcc?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.phone && s.phone.includes(searchTerm))
    );

    return (
        <DashboardLayout title="Nhà cung cấp" subtitle="Quản lý danh mục đối tác vật tư">
            <div className="space-y-6">
                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Tìm theo tên, mã hoặc SĐT..." 
                            className="pl-10 h-10 bg-white border-slate-200 focus:ring-slate-400 transition-all rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleOpenAddDialog} className="bg-slate-900 hover:bg-slate-800 text-white gap-2 px-6 h-10 shadow-sm rounded-lg transition-all">
                        <Plus className="h-4 w-4" />
                        Thêm nhà cung cấp
                    </Button>
                </div>

                {/* Table Section */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Thông tin nhà cung cấp</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Liên hệ</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã số thuế</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-300">Đang tải...</td>
                                        </tr>
                                    ))
                                ) : filteredSuppliers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Building2 className="h-12 w-12 opacity-20" />
                                                <p>Chưa có dữ liệu nhà cung cấp</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSuppliers.map((supplier) => (
                                        <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition-all">
                                                        <Building2 className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{supplier.tenNcc}</div>
                                                        <div className="text-xs font-mono text-slate-400">{supplier.maNcc}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Phone className="h-3 w-3 text-slate-400" />
                                                        {supplier.phone || '---'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Mail className="h-3 w-3 text-slate-400" />
                                                        {supplier.email || '---'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                                                {supplier.maSoThue || '---'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {supplier.active ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <CheckCircle2 className="h-3 w-3" /> Đang hợp tác
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
                                                        <XCircle className="h-3 w-3" /> Ngừng
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => handleOpenEditDialog(supplier)}
                                                        className="h-8 w-8 p-0 hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => handleDelete(supplier.id)}
                                                        className="h-8 w-8 p-0 hover:bg-red-50 text-slate-500 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Navigation (Placeholder) */}
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-slate-500">Hiển thị {filteredSuppliers.length} đối tác</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50" disabled>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50" disabled>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Dialog Form */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingSupplier ? 'Sửa thông tin đối tác' : 'Thêm nhà cung cấp mới'}
                                </DialogTitle>
                                <DialogDescription>
                                    Điền các thông tin cơ bản về đơn vị cung cấp vật tư cho Gara.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="maNcc">Mã nhà cung cấp</Label>
                                        <Input 
                                            id="maNcc" 
                                            value={formData.maNcc} 
                                            onChange={e => setFormData({...formData, maNcc: e.target.value})}
                                            className="font-mono bg-slate-50" 
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tenNcc">Tên đơn vị</Label>
                                        <Input 
                                            id="tenNcc" 
                                            value={formData.tenNcc} 
                                            onChange={e => setFormData({...formData, tenNcc: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Số điện thoại</Label>
                                        <Input 
                                            id="phone" 
                                            value={formData.phone} 
                                            onChange={e => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maSoThue">Mã số thuế</Label>
                                        <Input 
                                            id="maSoThue" 
                                            value={formData.maSoThue} 
                                            onChange={e => setFormData({...formData, maSoThue: e.target.value})}
                                            className="font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input 
                                        id="email" 
                                        type="email"
                                        value={formData.email} 
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="diaChi">Địa chỉ xưởng/văn phòng</Label>
                                    <Input 
                                        id="diaChi" 
                                        value={formData.diaChi} 
                                        onChange={e => setFormData({...formData, diaChi: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ghiChu">Ghi chú thêm</Label>
                                    <textarea 
                                        id="ghiChu" 
                                        value={formData.ghiChu} 
                                        onChange={e => setFormData({...formData, ghiChu: e.target.value})}
                                        className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300" 
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                                    Hủy bỏ
                                </Button>
                                <Button type="submit" className="bg-slate-900 text-white">
                                    {editingSupplier ? 'Lưu thay đổi' : 'Tạo mới'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
