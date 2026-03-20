'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarPlus, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function CustomerBookingPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [form, setForm] = useState({ bienSoXe: '', ghiChu: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authStatus === 'unauthenticated') { router.push('/customer/login'); }
    }, [authStatus, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const token = (session?.user as any)?.accessToken;

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/customer/booking`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        bienSoXe: form.bienSoXe.trim(),
                        modelXe: null,
                        ngayHen: null,
                        ghiChu: form.ghiChu || null,
                        selectedServiceIds: [],
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.message || 'Đặt lịch thất bại.');
                return;
            }
            setSuccess(true);
        } catch {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (authStatus === 'loading') {
        return <div className="min-h-screen bg-stone-950 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
    }

    return (
        <div className="min-h-screen bg-stone-950">
            <header className="bg-stone-900 border-b border-stone-800 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Link href="/customer/home" className="text-stone-500 hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
                    <h1 className="text-white font-bold">Đặt lịch hẹn</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                {success ? (
                    <div className="text-center py-12">
                        <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">Đặt lịch thành công!</h3>
                        <p className="text-stone-400 mb-6">Đội ngũ Cố vấn dịch vụ sẽ liên hệ xác nhận với Quý khách.</p>
                        <Link href="/customer/home"
                            className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-3 rounded-lg transition-colors inline-block">
                            Quay về mục lục
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-5">
                        {error && (
                            <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 flex items-center gap-2 text-red-300 text-sm">
                                <AlertCircle size={16} className="shrink-0" />{error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-1.5">Biển số xe <span className="text-red-400">*</span></label>
                            <input
                                type="text"
                                value={form.bienSoXe}
                                onChange={(e) => setForm({ ...form, bienSoXe: e.target.value })}
                                placeholder="51A-123.45"
                                className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-stone-600"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-1.5">Ghi chú / Mô tả yêu cầu</label>
                            <textarea
                                value={form.ghiChu}
                                onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                                placeholder="Xe bị rò rỉ dầu, cần kiểm tra..."
                                rows={3}
                                className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-stone-600 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 size={18} className="animate-spin" /> Đang gửi...</> : <><CalendarPlus size={18} /> Đặt lịch</>}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}
