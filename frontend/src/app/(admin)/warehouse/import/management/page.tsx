'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { ArrowLeft, Check, X, Search, Filter, Loader2, AlertTriangle, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { warehouseApi } from '@/api';
import { Badge } from "@/modules/shared/components/ui/badge";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import { useToast } from '@/modules/shared/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/modules/shared/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/modules/shared/components/ui/table";
import { usePermission } from '@/hooks/usePermission';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealtimeUpdate } from '@/hooks/useRealtimeUpdate';

// Interface matching backend ImportHistoryDto fields
interface ImportNote {
    id: number;
    code: string;
    date: string;
    supplier: string;
    total: number;
    creator: string;
    status: string;
    items: any[];
}

export function ImportManagementContent() {
    const queryClient = useQueryClient();
    const { hasPermission, isAdmin } = usePermission();

    const isAdminOrManager = isAdmin || hasPermission('MANAGE_INVENTORY');
    const { toast } = useToast();

    // Default to ALL to avoid "disappearing" items after approval
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: 'approve' | 'reject';
        item: ImportNote | null;
    }>({ open: false, type: 'approve', item: null });

    const { data: imports = [], isLoading } = useQuery({
        queryKey: ['warehouse-imports', statusFilter],
        queryFn: async () => {
            const response = await warehouseApi.getImports({ 
                status: statusFilter === 'ALL' ? undefined : statusFilter 
            });
            const data = (response as any)?.data || response;
            return (Array.isArray(data) ? data : []) as ImportNote[];
        }
    });

    // Subscribing to warehouse and stats events to make the list real-time
    useRealtimeUpdate(['warehouse-imports'], {
        filter: (data) => ['IMPORT_SUBMITTED', 'IMPORT_APPROVED', 'IMPORT_REJECTED'].includes(data.sseType),
        onUpdate: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouse-imports'] });
        }
    });

    const approveMutation = useMutation({
        mutationFn: (id: number) => warehouseApi.approveImport({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouse-imports'] });
            toast({ title: "Thành công", description: "Đã duyệt phiếu nhập thành công", variant: "default" });
            setConfirmDialog({ open: false, type: 'approve', item: null });
        },
        onError: (error: any) => {
            toast({ title: "Lỗi", description: error.message || "Lỗi khi duyệt", variant: "destructive" });
            setConfirmDialog({ open: false, type: 'approve', item: null });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: (id: number) => warehouseApi.rejectImport({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouse-imports'] });
            toast({ title: "Thành công", description: "Đã từ chối phiếu nhập", variant: "default" });
            setConfirmDialog({ open: false, type: 'reject', item: null });
        },
        onError: (error: any) => {
            toast({ title: "Lỗi", description: error.message || "Lỗi khi từ chối", variant: "destructive" });
            setConfirmDialog({ open: false, type: 'reject', item: null });
        }
    });

    const openConfirm = (type: 'approve' | 'reject', item: ImportNote) => {
        setConfirmDialog({ open: true, type, item });
    };

    const handleConfirm = () => {
        if (!confirmDialog.item) return;
        if (confirmDialog.type === 'approve') {
            approveMutation.mutate(confirmDialog.item.id);
        } else {
            rejectMutation.mutate(confirmDialog.item.id);
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

    const filteredImports = imports.filter((item: ImportNote) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const supplier = (item.supplier || '').toLowerCase();
        const code = (item.code || '').toLowerCase();
        return supplier.includes(term) || code.includes(term);
    });

    const isPending = approveMutation.isPending || rejectMutation.isPending;

    return (
        <>
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
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredImports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                        Không tìm thấy phiếu nhập nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredImports.map((item: ImportNote) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium font-mono text-xs">{item.code}</TableCell>
                                        <TableCell>{formatDate(item.date)}</TableCell>
                                        <TableCell>{item.supplier}</TableCell>
                                        <TableCell>{item.creator || 'N/A'}</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency(item.total)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getStatusBadge(item.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {item.status === 'PENDING' && isAdminOrManager && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                                            onClick={() => openConfirm('approve', item)}
                                                            disabled={isPending}
                                                            title="Duyệt"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                                                            onClick={() => openConfirm('reject', item)}
                                                            disabled={isPending}
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

            {/* Custom Confirm Dialog */}
            <Dialog open={confirmDialog.open} onOpenChange={(open) => !isPending && setConfirmDialog(prev => ({ ...prev, open }))}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            {confirmDialog.type === 'approve' ? (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <PackageCheck className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <span>Xác nhận duyệt phiếu nhập</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                                    </div>
                                    <span>Xác nhận từ chối phiếu nhập</span>
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {confirmDialog.item && (
                        <div className="space-y-3 py-2">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Mã phiếu:</span>
                                    <span className="font-mono font-bold">{confirmDialog.item.code}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Nhà cung cấp:</span>
                                    <span className="font-semibold">{confirmDialog.item.supplier}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Tổng tiền:</span>
                                    <span className="font-bold text-blue-600">{formatCurrency(confirmDialog.item.total)}</span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {confirmDialog.type === 'approve'
                                    ? 'Sau khi duyệt, tồn kho và giá vốn sẽ được cập nhật theo phiếu nhập này.'
                                    : 'Phiếu nhập sẽ bị từ chối và không ảnh hưởng đến tồn kho.'
                                }
                            </p>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDialog({ open: false, type: 'approve', item: null })}
                            disabled={isPending}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isPending}
                            className={confirmDialog.type === 'approve'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-600 hover:bg-rose-700 text-white'
                            }
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {confirmDialog.type === 'approve' ? 'Duyệt phiếu nhập' : 'Từ chối'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function ImportManagementPage() {
    return (
        <DashboardLayout title="Duyệt phiếu nhập kho" subtitle="Quản lý và phê duyệt danh sách phiếu nhập hàng vào kho">
            <ImportManagementContent />
        </DashboardLayout>
    );
}
