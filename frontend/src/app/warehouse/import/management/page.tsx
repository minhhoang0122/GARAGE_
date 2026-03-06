'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { ArrowLeft, Check, X, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { api } from '@/lib/api';
import { Badge } from "@/modules/shared/components/ui/badge";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import { useToast } from '@/modules/shared/components/ui/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/modules/shared/components/ui/table";

interface ImportNote {
    id: number;
    maPhieu: string;
    ngayNhap: string;
    nhaCungCap: string;
    tongTien: number;
    nguoiNhap?: {
        hoTen: string;
    };
    trangThai: string;
    chiTietNhap: any[];
}

export default function ImportManagementPage() {
    const { data: session } = useSession();
    // @ts-ignore
    const role = session?.user?.role as string;
    const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';

    const [imports, setImports] = useState<ImportNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('PENDING'); // Default to PENDING
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchImports = async () => {
        setIsLoading(true);
        try {
            // @ts-ignore
            const token = session?.user?.accessToken;
            if (!token) return;

            const query = statusFilter === 'ALL' ? '' : `?status=${statusFilter}`;
            const res = await api.get(`/warehouse/imports${query}`, token);
            setImports(res);
        } catch (error) {
            console.error(error);
            toast({ title: "Lỗi", description: "Không thể tải danh sách phiếu nhập", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchImports();
        }
    }, [session, statusFilter]);

    const handleApprove = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn duyệt phiếu nhập này? Kho và giá sẽ được cập nhật.')) return;

        try {
            const token = (session?.user as any)?.accessToken;
            await api.post(`/warehouse/import/${id}/approve`, {}, token);
            toast({ title: "Thành công", description: "Đã duyệt phiếu nhập thành công", variant: "default" });
            fetchImports();
        } catch (error: any) {
            toast({ title: "Lỗi", description: error.message || "Lỗi khi duyệt", variant: "destructive" });
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn từ chối phiếu nhập này?')) return;

        try {
            const token = (session?.user as any)?.accessToken;
            await api.post(`/warehouse/import/${id}/reject`, {}, token);
            toast({ title: "Thành công", description: "Đã từ chối phiếu nhập", variant: "default" });
            fetchImports();
        } catch (error: any) {
            toast({ title: "Lỗi", description: error.message || "Lỗi khi từ chối", variant: "destructive" });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Đã duyệt</Badge>;
            case 'PENDING':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Chờ duyệt</Badge>;
            case 'REJECTED':
                return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Đã từ chối</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredImports = imports.filter(item =>
        item.nhaCungCap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.maPhieu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout title="Quản lý nhập kho" subtitle="Duyệt và quản lý các phiếu nhập hàng">
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Link href="/warehouse" className="text-slate-500 hover:text-slate-700 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Danh sách phiếu nhập</h2>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Tìm theo mã, nhà cung cấp..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 w-full sm:w-[300px]"
                            />
                        </div>

                        <div className="relative w-[180px]">
                            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none"
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="PENDING">Chờ duyệt</option>
                                <option value="COMPLETED">Đã duyệt</option>
                                <option value="REJECTED">Đã từ chối</option>
                            </select>
                        </div>

                        <Link href="/warehouse/import">
                            <Button className="w-full sm:w-auto">
                                + Tạo phiếu nhập
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã phiếu</TableHead>
                                <TableHead>Ngày nhập</TableHead>
                                <TableHead>Nhà cung cấp</TableHead>
                                <TableHead>Người nhập</TableHead>
                                <TableHead className="text-right">Tổng tiền</TableHead>
                                <TableHead className="text-center">Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : filteredImports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                        Không tìm thấy phiếu nhập nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredImports.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.maPhieu}</TableCell>
                                        <TableCell>{formatDate(item.ngayNhap)}</TableCell>
                                        <TableCell>{item.nhaCungCap}</TableCell>
                                        <TableCell>{item.nguoiNhap?.hoTen || 'N/A'}</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency(item.tongTien)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getStatusBadge(item.trangThai)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {item.trangThai === 'PENDING' && isAdminOrManager && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                                            onClick={() => handleApprove(item.id)}
                                                            title="Duyệt"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                                                            onClick={() => handleReject(item.id)}
                                                            title="Từ chối"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DashboardLayout>
    );
}
