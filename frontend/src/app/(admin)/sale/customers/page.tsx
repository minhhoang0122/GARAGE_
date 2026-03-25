'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card';
import { Button } from '@/modules/shared/components/ui/button';
import { Input } from '@/modules/shared/components/ui/input';
import { SearchInput } from '@/modules/shared/components/ui/search-input';
import { Search, Plus, MapPin, Phone, Mail, User, RefreshCw, ChevronRight, X, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { createCustomer } from '@/modules/service/sale';
import { useToast } from '@/contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Customer {
    id: number;
    hoTen: string;
    soDienThoai: string;
    email?: string;
    diaChi?: string;
    ngayTao: string;
}

export default function SaleCustomersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    const keyword = searchParams.get('q') || '';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        hoTen: '',
        soDienThoai: '',
        email: '',
        diaChi: ''
    });

    // @ts-ignore
    const token = session?.user?.accessToken;

    const { data: customers = [], isFetching, refetch } = useQuery({
        queryKey: ['customers', keyword],
        queryFn: async () => {
            return await api.get(`/sale/customers?search=${keyword}`, token);
        },
        enabled: !!token
    });

    const createMutation = useMutation({
        mutationFn: createCustomer,
        onSuccess: (res) => {
            if (res.success) {
                setIsModalOpen(false);
                setFormData({ hoTen: '', soDienThoai: '', email: '', diaChi: '' });
                showToast('success', 'Thêm khách hàng thành công!');
                queryClient.invalidateQueries({ queryKey: ['customers'] });
            } else {
                showToast('error', res.error || 'Có lỗi xảy ra');
            }
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    return (
        <DashboardLayout title="Quản lý Khách hàng" subtitle="Danh sách khách hàng trong hệ thống">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Search Bar & Add Button */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 transition-colors">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex gap-2 items-center flex-1 w-full">
                            <div className="relative flex-1">
                                <SearchInput
                                    placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                                />
                            </div>
                            <Button variant="outline" type="button" onClick={() => refetch()} disabled={isFetching}>
                                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white gap-2 w-full md:w-auto font-bold shadow-sm dark:bg-white dark:text-slate-900"
                        >
                            <Plus className="w-4 h-4" /> Thêm khách hàng
                        </Button>
                    </div>
                </div>

                {/* Customers List */}
                {/* Customers List - Responsive */}
                <div className="space-y-4">
                    {/* Desktop Grid View */}
                    <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {customers.map((customer: Customer) => (
                            <Card key={customer.id} className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2 px-6 pt-6">
                                    <div className="w-12 h-12 flex-shrink-0 rounded border-2 border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] group-hover:-translate-y-1 transition-transform">
                                        {customer.hoTen ? customer.hoTen.substring(0, 1).toUpperCase() : 'K'}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100">{customer.hoTen}</CardTitle>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-bold">
                                            <Phone className="w-3.5 h-3.5" /> {customer.soDienThoai}
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm space-y-3 px-6 pb-6">
                                    {customer.email && (
                                        <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300 font-medium">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <span>{customer.email}</span>
                                        </div>
                                    )}
                                    {customer.diaChi && (
                                        <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300 font-medium">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <span className="line-clamp-1">{customer.diaChi}</span>
                                        </div>
                                    )}
                                    <div className="pt-3 flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 mt-2 uppercase tracking-widest font-black">
                                        <span>ID: #{customer.id}</span>
                                        <span>Gia nhập: {new Date(customer.ngayTao).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Mobile List View */}
                    <div className="md:hidden space-y-3">
                        {customers.map((customer: Customer) => (
                            <div key={customer.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                                    {customer.hoTen ? customer.hoTen.substring(0, 1).toUpperCase() : 'K'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">{customer.hoTen}</h3>
                                    <a href={`tel:${customer.soDienThoai}`} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center gap-1 mt-0.5">
                                        <Phone className="w-3 h-3" /> {customer.soDienThoai}
                                    </a>
                                </div>
                                {(customer.email || customer.diaChi) && (
                                    <div className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400">
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {!isFetching && customers.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
                        <User className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-700" />
                        <h3 className="text-lg font-bold text-slate-400">Chưa có khách hàng nào</h3>
                        <p className="text-slate-400 text-sm mt-1">Bắt đầu bằng cách thêm khách hàng mới hoặc tiếp nhận xe.</p>
                    </div>
                )}
            </div>

            {/* Modal Thêm Khách Hàng */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-wider">Thêm khách hàng mới</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 px-0.5">Họ và tên *</label>
                                <Input
                                    required
                                    value={formData.hoTen}
                                    onChange={e => setFormData({ ...formData, hoTen: e.target.value })}
                                    placeholder="Nguyễn Văn A"
                                    className="bg-slate-50 dark:bg-slate-950 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 px-0.5">Số điện thoại *</label>
                                <Input
                                    required
                                    value={formData.soDienThoai}
                                    onChange={e => setFormData({ ...formData, soDienThoai: e.target.value })}
                                    placeholder="0901234567"
                                    className="bg-slate-50 dark:bg-slate-950 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 px-0.5">Email</label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="khachhang@example.com"
                                    className="bg-slate-50 dark:bg-slate-950 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 px-0.5">Địa chỉ</label>
                                <Input
                                    value={formData.diaChi}
                                    onChange={e => setFormData({ ...formData, diaChi: e.target.value })}
                                    placeholder="Số 123, Đường ABC, TP.HCM"
                                    className="bg-slate-50 dark:bg-slate-950 font-medium"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 font-bold border-2"
                                >
                                    Hủy bỏ
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg dark:bg-white dark:text-slate-900"
                                >
                                    {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu khách hàng'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
