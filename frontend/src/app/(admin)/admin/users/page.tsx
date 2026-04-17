'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
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
import { identityService } from '@/modules/identity/services/identityService';
import { getStatusBadge } from '@/lib/status';
import { ROLE_DISPLAY_NAMES } from '@/config/menu';
import { Button } from '@/modules/shared/components/ui/button';
import { AdvancedDataTable } from '@/modules/shared/components/ui/AdvancedDataTable';
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
import BaseAvatar from '@/modules/shared/components/common/BaseAvatar';
import { VALIDATION_LIMITS } from '@/lib/schemas';

const userSchema = z.object({
    username: z.string().min(3, 'Tên đăng nhập tối thiểu 3 ký tự').max(VALIDATION_LIMITS.USERNAME_MAX, `Tên đăng nhập tối đa ${VALIDATION_LIMITS.USERNAME_MAX} ký tự`),
    password: z.string().max(VALIDATION_LIMITS.PASSWORD_MAX, `Mật khẩu tối đa ${VALIDATION_LIMITS.PASSWORD_MAX} ký tự`).optional().or(z.literal('')),
    fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(VALIDATION_LIMITS.NAME_MAX, `Họ tên tối đa ${VALIDATION_LIMITS.NAME_MAX} ký tự`),
    phone: z.string().max(VALIDATION_LIMITS.PHONE_MAX, `Số điện thoại tối đa ${VALIDATION_LIMITS.PHONE_MAX} ký tự`).optional(),
    roleCodes: z.array(z.string()).min(1, 'Chọn ít nhất 1 vai trò')
});

type UserFormValues = z.infer<typeof userSchema>;

export function UsersContent() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const confirm = useConfirm();

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: '',
            password: '',
            fullName: '',
            phone: '',
            roleCodes: ['SALE']
        }
    });

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users', 'staff'],
        queryFn: identityService.getStaffUsers
    });

    const filteredUsers = users.filter((u: any) => 
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const saveMutation = useMutation({
        mutationFn: async (data: UserFormValues) => {
            return editingUser 
                ? await identityService.updateUser(editingUser.id, data)
                : await identityService.createUser(data);
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
        }
    });

    const toggleMutation = useMutation({
        mutationFn: identityService.toggleUserActive,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Đã cập nhật trạng thái tài khoản');
        }
    });

    const handleEdit = (user: any) => {
        setEditingUser(user);
        form.reset({
            username: user.username,
            fullName: user.fullName || '',
            phone: user.phone || '',
            roleCodes: user.roles ? user.roles.map((r: any) => r.name) : []
        });
        setIsModalOpen(true);
    };

    const handleToggle = async (id: number) => {
        const confirmed = await confirm({
            title: 'Đổi trạng thái tài khoản',
            message: 'Bạn có chắc muốn đổi trạng thái tài khoản này?',
            type: 'warning'
        });
        if (confirmed) toggleMutation.mutate(id);
    };

    const columns = [
        {
            header: 'Nhân viên',
            accessorKey: 'fullName',
            render: (value: string, user: any) => (
                <div className="flex items-center gap-3">
                    <BaseAvatar name={value} size="sm" />
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white">{value}</p>
                        <p className="text-[10px] text-slate-500">@{user.username}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Vai trò',
            accessorKey: 'roles',
            render: (roles: any[]) => (
                <div className="flex flex-wrap gap-1">
                    {roles?.map(r => {
                        const roleCode = typeof r === 'string' ? r : (r?.name || '');
                        return (
                            <span key={roleCode} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                                {ROLE_DISPLAY_NAMES[roleCode] || roleCode}
                            </span>
                        );
                    })}
                </div>
            )
        },
        {
            header: 'Liên hệ',
            accessorKey: 'phone',
            render: (value: string) => value ? (
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Phone className="w-3 h-3" />
                    <span className="text-xs font-medium">{value}</span>
                </div>
            ) : <span className="text-slate-400 font-medium italic text-xs">Chưa có</span>
        },
        {
            header: 'Trạng thái',
            accessorKey: 'isActive',
            render: (value: boolean) => getStatusBadge(value ? 'ACTIVE' : 'INACTIVE')
        },
        {
            header: 'Thao tác',
            accessorKey: 'id',
            className: 'text-right',
            render: (id: number, user: any) => (
                <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(user)}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className={`h-8 w-8 ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`} onClick={() => handleToggle(id)}>
                        {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </Button>
                </div>
            )
        }
    ];

    return (
        <>
            <div className="max-w-7xl mx-auto space-y-6 px-4 pb-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input 
                            placeholder="Tìm nhân viên..." 
                            className="pl-10 h-11 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={() => { setEditingUser(null); form.reset(); setIsModalOpen(true); }}
                        className="w-full sm:w-auto h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 px-6 gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Thêm nhân viên
                    </Button>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <AdvancedDataTable 
                        columns={columns}
                        data={filteredUsers}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-slate-50 dark:bg-slate-900 w-full max-w-lg rounded-[2rem] shadow-2xl border border-white dark:border-slate-800 overflow-hidden">
                        <div className="p-8 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        {editingUser ? 'Cập nhật tài khoản' : 'Tạo mới nhân viên'}
                                    </h2>
                                    <p className="text-xs font-bold text-slate-500 mt-0.5">Tiếp nhận và phân quyền hệ thống</p>
                                </div>
                            </div>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))} className="p-8 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="username" render={({ field, fieldState }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[11px] font-bold text-slate-500 uppercase ml-1">Tên đăng nhập</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <User className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors", fieldState.error && "text-red-500")} />
                                                    <Input 
                                                        {...field} 
                                                        disabled={!!editingUser} 
                                                        placeholder="vd: tung.nguyen" 
                                                        className={cn(
                                                            "pl-10 h-12 bg-white dark:bg-slate-950 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 font-bold",
                                                            fieldState.error && "border-red-500 focus:ring-red-500/20"
                                                        )} 
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="password" render={({ field, fieldState }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[11px] font-bold text-slate-500 uppercase ml-1">Mật khẩu</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Key className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400", fieldState.error && "text-red-500")} />
                                                    <Input 
                                                        {...field} 
                                                        type="password" 
                                                        placeholder={editingUser ? '•••••••• (để trống nếu ko đổi)' : '••••••••'} 
                                                        className={cn(
                                                            "pl-10 h-12 bg-white dark:bg-slate-950 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 font-bold",
                                                            fieldState.error && "border-red-500 focus:ring-red-500/20"
                                                        )} 
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )} />
                                </div>

                                <FormField control={form.control} name="fullName" render={({ field, fieldState }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-[11px] font-bold text-slate-500 uppercase ml-1">Họ và Tên</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="Nguyễn Văn A" 
                                                className={cn(
                                                    "h-12 bg-white dark:bg-slate-950 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 font-bold",
                                                    fieldState.error && "border-red-500 focus:ring-red-500/20"
                                                )} 
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="phone" render={({ field, fieldState }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-[11px] font-bold text-slate-500 uppercase ml-1">Số điện thoại</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="090..." 
                                                className={cn(
                                                    "h-12 bg-white dark:bg-slate-950 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 font-bold",
                                                    fieldState.error && "border-red-500 focus:ring-red-500/20"
                                                )} 
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )} />

                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Phân quyền vai trò</label>
                                    <div className="grid grid-cols-2 gap-2 bg-white/50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        {[
                                            { value: 'SALE', label: ROLE_DISPLAY_NAMES.SALE },
                                            { value: 'QUAN_LY_XUONG', label: ROLE_DISPLAY_NAMES.QUAN_LY_XUONG },
                                            { value: 'THO_SUA_CHUA', label: ROLE_DISPLAY_NAMES.THO_SUA_CHUA },
                                            { value: 'KHO', label: ROLE_DISPLAY_NAMES.KHO },
                                            { value: 'ADMIN', label: ROLE_DISPLAY_NAMES.ADMIN }
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
                                    {form.formState.errors.roleCodes?.message && (
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
                </div>,
                document.body
            )}
        </>
    );
}

export default function UsersPage() {
    return (
        <DashboardLayout title="Quản lý nhân sự" subtitle="Quản lý tài khoản nhân viên và phân quyền truy cập">
            <UsersContent />
        </DashboardLayout>
    );
}
