'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, Phone, Lock, ArrowLeft } from 'lucide-react';

function CustomerLoginForm() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                username: phone.trim(),
                password: password,
                redirect: false,
            });

            if (result?.error) {
                setError('Số điện thoại hoặc mật khẩu không đúng.');
            } else {
                router.push('/customer/home');
            }
        } catch (err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const registered = searchParams.get('registered');

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
            {/* Background Image with Overlay */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20000ms] hover:scale-110"
                style={{ backgroundImage: 'url("/bg-customer.png")' }}
            />
            <div className="absolute inset-0 z-10 bg-stone-950/80 backdrop-blur-[2px]" />

            {/* Back Button - Top Left */}
            <div className="absolute top-6 left-6 z-20">
                <Link 
                    href="/" 
                    className="flex items-center gap-2 text-stone-400 hover:text-white transition-all bg-stone-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-stone-800 hover:border-orange-500/50 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                    <span className="text-sm font-medium">Trang chủ</span>
                </Link>
            </div>

            <div className="relative z-20 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Đăng nhập</h1>
                    <p className="text-stone-400 mt-2 font-medium">Cổng thông tin dành cho Quý khách hàng</p>
                    <div className="w-12 h-1 bg-orange-600 mx-auto mt-4 rounded-full"></div>
                </div>

                {/* Success message from register */}
                {registered && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md rounded-xl p-4 mb-6 text-emerald-400 text-sm text-center flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-stone-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 space-y-6 shadow-2xl">
                    {error && (
                        <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 flex items-center gap-2 text-red-300 text-sm">
                            <AlertCircle size={16} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-1.5">Số điện thoại</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="0912 345 678"
                                className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-stone-600"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-1.5">Mật khẩu</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••"
                                className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-stone-600"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</> : 'Đăng nhập'}
                    </button>

                    <div className="text-center text-sm text-stone-500">
                        Chưa có tài khoản?{' '}
                        <Link href="/customer/register" className="text-orange-400 hover:text-orange-300 font-medium">
                            Đăng ký ngay
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CustomerLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-stone-950 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={32} /></div>}>
            <CustomerLoginForm />
        </Suspense>
    );
}
