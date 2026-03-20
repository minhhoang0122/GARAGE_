'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Plus, Edit, Lock, Unlock } from 'lucide-react';
import { getCustomerAccounts as getUsers, toggleUserActive } from '@/modules/identity/user';
import { getStatusBadge } from '@/lib/status';
import { Card } from '@/modules/shared/components/ui/card';
import { Button } from '@/modules/shared/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/modules/shared/components/ui/table';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';
import { useToast } from '@/contexts/ToastContext';

export default function CustomerAccountsPage() {
    const [users, setUsers] = useState<any[]>([]);
    const confirm = useConfirm();
    const { showToast } = useToast();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const data = await getUsers();
        if (Array.isArray(data)) setUsers(data);
    };

    const handleToggle = async (id: number) => {
        const confirmed = await confirm({
            title: 'Đổi trạng thái tài khoản',
            message: 'Bạn có chắc muốn đổi trạng thái tài khoản này?',
            type: 'warning',
            confirmText: 'Xác nhận'
        });
        if (confirmed) {
            await toggleUserActive(id);
            loadUsers();
            showToast('success', 'Đã cập nhật trạng thái tài khoản');
        }
    };

    return (
        <DashboardLayout title="Quản lý tài khoản khách" subtitle="Danh sách người dùng là khách hàng">
            <Card className="overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-transparent">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Cổng khách hàng</h3>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Tên đăng nhập</TableHead>
                                <TableHead>Họ tên khách</TableHead>
                                <TableHead>Số điện thoại</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                                        Không tìm thấy tài khoản khách hàng nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">#{user.id}</TableCell>
                                        <TableCell className="font-semibold text-slate-700 dark:text-slate-300">{user.tenDangNhap}</TableCell>
                                        <TableCell>{user.hoTen}</TableCell>
                                        <TableCell>{user.soDienThoai}</TableCell>
                                        <TableCell>
                                            {getStatusBadge(user.trangThaiHoatDong ? 'ACTIVE' : 'INACTIVE')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                onClick={() => handleToggle(user.id)} 
                                                className={`h-8 w-8 ${user.trangThaiHoatDong ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                            >
                                                {user.trangThaiHoatDong ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </DashboardLayout>
    );
}
