'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Plus, Edit, Lock, Unlock, Key } from 'lucide-react';
import { getUsers, createUser, updateUser, toggleUserActive } from '@/modules/identity/user';
import { getStatusBadge } from '@/lib/status';
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card';
import { Button } from '@/modules/shared/components/ui/button';
import { Input } from '@/modules/shared/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/modules/shared/components/ui/table';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';
import { useToast } from '@/contexts/ToastContext';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        tenDangNhap: '',
        matKhauHash: '',
        hoTen: '',
        soDienThoai: '',
        roleCodes: ['SALE'] as string[]
    });
    const confirm = useConfirm();
    const { showToast } = useToast();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const data = await getUsers();
        if (Array.isArray(data)) setUsers(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = editingUser 
                ? await updateUser(editingUser.id, formData)
                : await createUser(formData);
            
            if (result.success) {
                setIsModalOpen(false);
                setEditingUser(null);
                resetForm();
                loadUsers();
                showToast('success', editingUser ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
            } else {
                showToast('error', result.error || 'Lỗi lưu người dùng');
            }
        } catch (err) {
            showToast('error', 'Lỗi hệ thống, vui lòng thử lại sau');
        }
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setFormData({
            tenDangNhap: user.tenDangNhap,
            matKhauHash: '', // Keep empty
            hoTen: user.hoTen,
            soDienThoai: user.soDienThoai,
            roleCodes: user.roles ? user.roles.map((r: any) => r.name) : []
        });
        setIsModalOpen(true);
    };

    const handleToggle = async (id: number) => {
        const confirmed = await confirm({
            title: 'Đổi trạng thái người dùng',
            message: 'Bạn có chắc muốn đổi trạng thái người dùng này?',
            type: 'warning',
            confirmText: 'Xác nhận'
        });
        if (confirmed) {
            await toggleUserActive(id);
            loadUsers();
        }
    };

    const resetForm = () => {
        setFormData({
            tenDangNhap: '',
            matKhauHash: '',
            hoTen: '',
            soDienThoai: '',
            roleCodes: ['SALE']
        });
    }

    return (
        <DashboardLayout title="Quản lý nhân sự" subtitle="Danh sách tài khoản hệ thống">
            <Card className="overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-transparent">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Danh sách nhân viên</h3>
                    <Button onClick={() => { setEditingUser(null); resetForm(); setIsModalOpen(true); }} className="gap-2">
                        <Plus className="w-4 h-4" /> Thêm mới
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Tên đăng nhập</TableHead>
                                <TableHead>Họ tên</TableHead>
                                <TableHead>Vai trò</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">#{user.id}</TableCell>
                                    <TableCell className="font-semibold text-slate-700 dark:text-slate-300">{user.tenDangNhap}</TableCell>
                                    <TableCell>{user.hoTen}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles && user.roles.length > 0 ? (
                                                user.roles.map((role: any) => (
                                                    <span key={role.name} className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold border ${role.name === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' :
                                                        role.name === 'THO_SUA_CHUA' ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' :
                                                            role.name === 'KHO' ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' :
                                                                'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                                        }`}>
                                                        {role.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">Chưa có</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(user.trangThaiHoatDong ? 'ACTIVE' : 'INACTIVE')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => handleEdit(user)} className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            {!(user.roles && user.roles.some((r: any) => r.name === 'ADMIN')) && (
                                                <Button size="icon" variant="ghost" onClick={() => handleToggle(user.id)} className={`h-8 w-8 ${user.trangThaiHoatDong ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}>
                                                    {user.trangThaiHoatDong ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-[400px] shadow-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">{editingUser ? 'Sửa nhân viên' : 'Thêm nhân viên'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tên đăng nhập</label>
                                <Input
                                    value={formData.tenDangNhap}
                                    onChange={(e: any) => setFormData({ ...formData, tenDangNhap: e.target.value })}
                                    disabled={!!editingUser}
                                    required
                                    className="dark:bg-slate-950 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">{editingUser ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu'}</label>
                                <Input
                                    type="password"
                                    value={formData.matKhauHash}
                                    onChange={(e: any) => setFormData({ ...formData, matKhauHash: e.target.value })}
                                    required={!editingUser}
                                    className="dark:bg-slate-950 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Họ tên hiển thị</label>
                                <Input
                                    value={formData.hoTen}
                                    onChange={(e: any) => setFormData({ ...formData, hoTen: e.target.value })}
                                    required
                                    className="dark:bg-slate-950 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Số điện thoại</label>
                                <Input
                                    value={formData.soDienThoai}
                                    onChange={(e: any) => setFormData({ ...formData, soDienThoai: e.target.value })}
                                    className="dark:bg-slate-950 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Vai trò</label>
                                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                    {[
                                        { value: 'SALE', label: 'Sale (Cố vấn)' },
                                        { value: 'QUAN_LY_XUONG', label: 'Quản Đốc Xưởng' },
                                        { value: 'THO_SUA_CHUA', label: 'Thợ sửa chữa' },
                                        { value: 'KHO', label: 'Thủ kho' },
                                        { value: 'ADMIN', label: 'Admin (Chủ gara)' }
                                    ].map(role => (
                                        <label key={role.value} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={formData.roleCodes.includes(role.value)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        roleCodes: checked
                                                            ? [...prev.roleCodes, role.value]
                                                            : prev.roleCodes.filter(r => r !== role.value)
                                                    }));
                                                }}
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">{role.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Hủy</Button>
                                <Button type="submit">Lưu thông tin</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
