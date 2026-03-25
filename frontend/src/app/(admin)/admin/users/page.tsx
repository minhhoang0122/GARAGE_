'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/modules/common/components/layout';
import { 
    Plus, 
    Edit, 
    Lock, 
    Unlock, 
    UserPlus, 
    Shield, 
    Phone, 
    User, 
    Key, 
    RefreshCw,
    Search,
    MoreHorizontal,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { getStaffUsers as getUsers, createUser, updateUser, toggleUserActive } from '@/modules/identity/user';
import { getStatusBadge } from '@/lib/status';
import { Button } from '@/modules/shared/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/modules/shared/components/ui/input';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/modules/shared/components/ui/form';

const userSchema = z.object({
    tenDangNhap: z.string().min(3, 'Tên đăng nhập tối thiểu 3 ký tự'),
    matKhauHash: z.string().optional().or(z.literal('')),
    hoTen: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
    soDienThoai: z.string().optional(),
    roleCodes: z.array(z.string()).min(1, 'Chọn ít nhất 1 vai trò')
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UsersPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const confirm = useConfirm();

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            tenDangNhap: '',
            matKhauHash: '',
            hoTen: '',
            soDienThoai: '',
            roleCodes: ['SALE']
        }
    });

    // Queries
    const { data: users = [], isLoading, refetch } = useQuery({
        queryKey: ['users', 'staff'],
        queryFn: getUsers
    });

    const filteredUsers = users.filter((u: any) => 
        u.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.tenDangNhap?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mutations
    const saveMutation = useMutation({
        mutationFn: async (data: UserFormValues) => {
            return editingUser 
                ? await updateUser(editingUser.id, data)
                : await createUser(data);
        },
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['users'] });
                setIsModalOpen(false);
                setEditingUser(null);
                form.reset();
                toast.success(editingUser ? 'Đã cập nhật nhân viên' : 'Đã thêm nhân viên mới');
            } else {
                toast.error(result.error || 'Lỗi xử lý');
            }
        },
        onError: () => {
            toast.error('Lỗi hệ thống, vui lòng thử lại sau');
        }
    });

    const toggleMutation = useMutation({
        mutationFn: toggleUserActive,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Đã cập nhật trạng thái');
        },
        onError: () => {
            toast.error('Không thể cập nhật trạng thái');
        }
    });

    const onSubmit = (data: UserFormValues) => {
        saveMutation.mutate(data);
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        form.reset({
            tenDangNhap: user.tenDangNhap,
            matKhauHash: '',
            hoTen: user.hoTen,
            soDienThoai: user.soDienThoai || '',
            roleCodes: user.roles ? user.roles.map((r: any) => r.name) : []
        });
        setIsModalOpen(true);
    };

    const handleToggle = async (user: any) => {
        const confirmed = await confirm({
            title: user.trangThaiHoatDong ? 'Khóa tài khoản?' : 'Kích hoạt tài khoản?',
            message: `Xác nhận ${user.trangThaiHoatDong ? 'KHÓA' : 'KÍCH HOẠT'} tài khoản của ${user.hoTen}?`,
            type: user.trangThaiHoatDong ? 'danger' : 'warning',
            confirmText: 'Xác nhận'
        });
        if (confirmed) {
            toggleMutation.mutate(user.id);
        }
    };

    return (
        <DashboardLayout title="Quản lý nhân sự" subtitle="Kế hoạch và phân quyền tài khoản gara">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Search & Actions */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Tìm nhân viên theo tên hoặc tài khoản..."
                            className="pl-10 h-11 border-none bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button variant="outline" size="icon" onClick={() => refetch()} className="h-11 w-11 rounded-xl">
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button 
                            onClick={() => { setEditingUser(null); form.reset(); setIsModalOpen(true); }} 
                            className="h-11 px-6 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:scale-[1.02] transition-transform gap-2 font-bold shadow-lg"
                        >
                            <UserPlus className="w-5 h-5" /> Thêm nhân viên
                        </Button>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                                    <th className="text-left px-8 py-5">Nhân viên</th>
                                    <th className="text-left px-8 py-5">Tài khoản</th>
                                    <th className="text-left px-8 py-5">Liên hệ</th>
                                    <th className="text-left px-8 py-5">Vai trò</th>
                                    <th className="text-center px-8 py-5">Trạng thái</th>
                                    <th className="text-right px-8 py-5">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center text-slate-400 font-medium animate-pulse">Đang tải danh sách...</td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center text-slate-400">Không tìm thấy nhân viên phù hợp</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user: any) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-sm">
                                                        {user.hoTen?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-100">{user.hoTen}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">ID: #{user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Key className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">{user.tenDangNhap}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                               <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                   <Phone className="w-3.5 h-3.5" />
                                                   <span>{user.soDienThoai || 'N/A'}</span>
                                               </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {user.roles?.map((role: any) => (
                                                        <span key={role.name} className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                                                            role.name === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' :
                                                            role.name === 'KHO' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' :
                                                            'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                                        }`}>
                                                            {role.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                {user.trangThaiHoatDong ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                                                        <CheckCircle2 className="w-3 h-3" /> Hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50">
                                                        <XCircle className="w-3 h-3" /> Đã khóa
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    {!(user.roles?.some((r: any) => r.name === 'ADMIN')) && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleToggle(user)} 
                                                            className={`h-9 w-9 ${user.trangThaiHoatDong ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                                                        >
                                                            {user.trangThaiHoatDong ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal - Modern Design */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-[480px] shadow-2xl border border-slate-200 dark:border-slate-800 scale-in-center">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">{editingUser ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}</h3>
                                <p className="text-sm text-slate-500">Thông tin nhân sự tham gia hệ thống</p>
                            </div>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="hoTen"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel className="text-xs font-bold text-slate-500 uppercase">Họ và tên</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nguyễn Văn A" className="h-11 rounded-xl" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={form.control}
                                        name="tenDangNhap"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold text-slate-500 uppercase">Tên đăng nhập</FormLabel>
                                                <FormControl>
                                                    <Input disabled={!!editingUser} placeholder="username" className="h-11 rounded-xl font-mono" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="soDienThoai"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold text-slate-500 uppercase">Số điện thoại</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="090..." className="h-11 rounded-xl" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="matKhauHash"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">{editingUser ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu ban đầu'}</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" className="h-11 rounded-xl font-mono" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div>
                                    <FormLabel className="text-xs font-bold text-slate-500 uppercase mb-3 block text-center">Vai trò & Phân quyền</FormLabel>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        {[
                                            { value: 'SALE', label: 'Sale (Cố vấn)' },
                                            { value: 'QUAN_LY_XUONG', label: 'Quản đốc' },
                                            { value: 'THO_SUA_CHUA', label: 'Kỹ thuật viên' },
                                            { value: 'KHO', label: 'Thủ kho' },
                                            { value: 'ADMIN', label: 'Toàn quyền' }
                                        ].map(role => (
                                            <label key={role.value} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                                    checked={form.watch('roleCodes').includes(role.value)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        const current = form.getValues('roleCodes');
                                                        form.setValue('roleCodes', checked 
                                                            ? [...current, role.value] 
                                                            : current.filter(r => r !== role.value)
                                                        );
                                                    }}
                                                />
                                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{role.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {form.formState.errors.roleCodes && (
                                        <p className="text-[10px] text-red-500 mt-2 font-bold text-center">{form.formState.errors.roleCodes.message}</p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        className="flex-1 h-12 rounded-xl font-bold text-slate-500"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Hủy bỏ
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={saveMutation.isPending}
                                        className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                    >
                                        {saveMutation.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Lưu tài khoản'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
