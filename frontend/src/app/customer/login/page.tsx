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
        <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-white mb-6 transition-colors text-sm">
                        <ArrowLeft size={14} /> Trang chủ
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Đăng nhập</h1>
                    <p className="text-stone-400 mt-1">Dành cho Quý khách hàng</p>
                </div>

                {/* Success message from register */}
                {registered && (
                    <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg p-3 mb-4 text-emerald-300 text-sm text-center">
                        Đăng ký thành công! Vui lòng đăng nhập.
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-5">
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
