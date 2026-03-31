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

export default function UsersPage() {
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

    // Queries
    const { data: users = [], isLoading, refetch } = useQuery({
        queryKey: ['users', 'staff'],
        queryFn: identityService.getStaffUsers
    });

    const filteredUsers = users.filter((u: any) => 
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mutations
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
        },
        onError: () => {
            toast.error('Lỗi hệ thống, vui lòng thử lại sau');
        }
    });

    const toggleMutation = useMutation({
        mutationFn: identityService.toggleUserActive,
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
            username: user.username,
            password: '',
            fullName: user.fullName,
            phone: user.phone || '',
            roleCodes: user.roles ? user.roles.map((r: any) => r.name) : []
        });
        setIsModalOpen(true);
    };

    const handleToggle = async (user: any) => {
        const confirmed = await confirm({
            title: user.isActive ? 'Khóa tài khoản?' : 'Kích hoạt tài khoản?',
            message: `Xác nhận ${user.isActive ? 'KHÓA' : 'KÍCH HOẠT'} tài khoản của ${user.fullName}?`,
            type: user.isActive ? 'danger' : 'warning',
            confirmText: 'Xác nhận'
        });
        if (confirmed) {
            toggleMutation.mutate(user.id);
        }
    };

    const columns = [
        {
            header: 'Nhân viên',
            accessorKey: 'fullName',
            render: (value: any, user: any) => (
                <div className="flex items-center gap-4">
                    <BaseAvatar 
                        src={user.avatar} 
                        name={user.fullName} 
                        size="md"
                        showStatus={false}
                        showBorder={false}
                        className="shadow-sm"
                    />
                    <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{user.fullName}</p>
                        <p className="text-[10px] font-medium text-slate-400">ID: #{user.id}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Tài khoản',
            accessorKey: 'username',
            className: 'hidden md:table-cell',
            render: (value: any) => (
                <div className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">{value}</span>
                </div>
            )
        },
        {
            header: 'Liên hệ',
            accessorKey: 'phone',
            className: 'hidden lg:table-cell',
            render: (value: any) => (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{value || 'N/A'}</span>
                </div>
            )
        },
        {
            header: 'Vai trò',
            accessorKey: 'roles',
            className: 'hidden md:table-cell',
            render: (roles: any) => (
                <div className="flex flex-wrap gap-1.5">
                    {roles?.map((role: any) => (
                        <span key={role.name} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            role.name === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' :
                            role.name === 'KHO' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' :
                            'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                        }`}>
                            {ROLE_DISPLAY_NAMES[role.name] || role.name}
                        </span>
                    ))}
                </div>
            )
        },
        {
            header: 'Trạng thái',
            accessorKey: 'isActive',
            className: 'text-center',
            render: (isActive: boolean) => isActive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                    <CheckCircle2 className="w-3 h-3" /> <span className="hidden sm:inline">Hoạt động</span>
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50">
                    <XCircle className="w-3 h-3" /> <span className="hidden sm:inline">Đã khóa</span>
                </span>
            )
        },
        {
            header: 'Thao tác',
            accessorKey: 'id',
            className: 'text-right',
            render: (value: any, user: any) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(user); }} className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Edit className="w-4 h-4" />
                    </Button>
                    {!(user.roles?.some((r: any) => r.name === 'ADMIN')) && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.stopPropagation(); handleToggle(user); }} 
                            className={`h-9 w-9 ${user.isActive ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                        >
                            {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Quản lý nhân sự" subtitle="Kế hoạch và phân quyền tài khoản gara">
            <div className="max-w-7xl mx-auto space-y-6">
                <AdvancedDataTable
                    data={filteredUsers}
                    columns={columns}
                    isLoading={isLoading}
                    searchPlaceholder="Tìm nhân viên theo tên hoặc tài khoản..."
                    onSearch={setSearchTerm}
                    emptyState={{
                        title: 'Không tìm thấy nhân viên',
                        description: 'Không tìm thấy nhân viên nào phù hợp với từ khóa tìm kiếm.'
                    }}
                    actionButton={
                        <Button 
                            onClick={() => { setEditingUser(null); form.reset(); setIsModalOpen(true); }} 
                            className="h-11 px-6 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:scale-[1.02] transition-transform gap-2 font-bold shadow-lg"
                        >
                            <Plus className="w-5 h-5" /> Thêm nhân viên
                        </Button>
                    }
                />
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
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel className="text-xs font-bold text-slate-500">Họ và tên</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nguyễn Văn A" className="h-11 rounded-xl" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold text-slate-500">Tên đăng nhập</FormLabel>
                                                <FormControl>
                                                    <Input disabled={!!editingUser} placeholder="username" className="h-11 rounded-xl font-mono" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold text-slate-500">Số điện thoại</FormLabel>
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
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-slate-500">{editingUser ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu ban đầu'}</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" className="h-11 rounded-xl font-mono" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div>
                                    <FormLabel className="text-xs font-bold text-slate-500 mb-3 block text-center">Vai trò & Phân quyền</FormLabel>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
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
                </div>
            )}
        </DashboardLayout>
    );
}
