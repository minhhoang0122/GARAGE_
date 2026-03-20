'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, Phone, Lock, User as UserIcon, Mail, MapPin, ArrowLeft, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export default function CustomerRegisterPage() {
    const [form, setForm] = useState({
        hoTen: '',
        soDienThoai: '',
        email: '',
        diaChi: '',
        matKhau: '',
        xacNhanMatKhau: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.matKhau !== form.xacNhanMatKhau) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        if (form.matKhau.length < 6) {
            setError('Mật khẩu tối thiểu 6 ký tự.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/public/customer/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hoTen: form.hoTen.trim(),
                    soDienThoai: form.soDienThoai.trim(),
                    email: form.email || null,
                    diaChi: form.diaChi || null,
                    matKhau: form.matKhau,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.message || 'Đăng ký thất bại.');
                return;
            }

            // Success - redirect to login
            router.push('/customer/login?registered=1');
        } catch (err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
            {/* Background Image with Overlay */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20000ms] hover:scale-110"
                style={{ backgroundImage: 'url("/bg-customer.png")' }}
            />
            <div className="absolute inset-0 z-10 bg-stone-950/80 backdrop-blur-[2px]" />

            {/* Back Button - Top Left */}
            <div className="absolute top-6 left-6 z-20">
                <Link 
                    href="/customer/login" 
                    className="flex items-center gap-2 text-stone-400 hover:text-white transition-all bg-stone-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-stone-800 hover:border-orange-500/50 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                    <span className="text-sm font-medium">Quay lại</span>
                </Link>
            </div>

            <div className="relative z-20 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Đăng ký</h1>
                    <p className="text-stone-400 mt-2 font-medium">Khởi tạo tài khoản Quý khách hàng</p>
                    <div className="w-12 h-1 bg-orange-600 mx-auto mt-4 rounded-full"></div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-stone-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 space-y-4 shadow-2xl">
                    {error && (
                        <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 flex items-center gap-2 text-red-300 text-sm">
                            <AlertCircle size={16} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-1.5">Họ tên <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                            <input
                                type="text" name="hoTen" value={form.hoTen} onChange={handleChange}
                                placeholder="Nguyễn Văn A"
                                className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-stone-600"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-1.5">Số điện thoại <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                            <input
                                type="tel" name="soDienThoai" value={form.soDienThoai} onChange={handleChange}
                                placeholder="0912 345 678"
                                className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-stone-600"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-1.5">Email <span className="text-stone-600">(tuỳ chọn)</span></label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                            <input
                                type="email" name="email" value={form.email} onChange={handleChange}
                                placeholder="email@example.com"
                                className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-stone-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-1.5">Địa chỉ <span className="text-stone-600">(tuỳ chọn)</span></label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                            <input
                                type="text" name="diaChi" value={form.diaChi} onChange={handleChange}
                                placeholder="123 Đường ABC, Q.1, TP.HCM"
                                className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-stone-600"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-1.5">Mật khẩu <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                                <input
                                    type="password" name="matKhau" value={form.matKhau} onChange={handleChange}
                                    placeholder="••••••"
                                    className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-stone-600"
                                    required minLength={6}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-1.5">Xác nhận <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                                <input
                                    type="password" name="xacNhanMatKhau" value={form.xacNhanMatKhau} onChange={handleChange}
                                    placeholder="••••••"
                                    className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-stone-600"
                                    required minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</> : <><CheckCircle size={18} /> Đăng ký</>}
                    </button>

                    <div className="text-center text-sm text-stone-500">
                        Đã có tài khoản?{' '}
                        <Link href="/customer/login" className="text-orange-400 hover:text-orange-300 font-medium">
                            Đăng nhập
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
