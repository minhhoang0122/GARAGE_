'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, ArrowLeft, ShieldCheck, LayoutDashboard, KeyRound, UserCircle2, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { getHomeRoute } from '@/lib/routes';
import { useTheme } from '@/contexts/ThemeContext';

function LoginForm() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'AccountLocked') {
      setError('Tài khoản của bạn đã bị khóa từ hệ thống.');
    } else if (errorParam === 'SessionExpired') {
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    } else if (errorParam === 'CredentialsSignin') {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      } else if (result?.ok) {
        const session = await getSession();
        const roles = (session?.user as any)?.roles || [];
        const target = callbackUrl && callbackUrl !== '/' && callbackUrl !== '/login' 
          ? callbackUrl 
          : getHomeRoute(roles);
          
        router.push(target);
        router.refresh();
      }
    } catch (err: any) {
      setError('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background with Subtle Spotlight - NO AI SLOP */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Header Actions */}
      <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-20">
        <Link 
          href="/login" 
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Về trang chọn vai trò</span>
        </Link>
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-8 sm:p-10">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
               <div className="relative">
                  <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full" />
                  <div className="relative w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 border border-blue-400/20">
                    <LayoutDashboard size={28} className="text-white" />
                  </div>
               </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Hệ thống Quản trị
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-[10px] font-bold opacity-80">
              Truy cập mạng nội bộ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3 p-4 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50 rounded-xl mb-4"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1">
                  Tên đăng nhập
                </label>
                <div className="relative group/input font-inter">
                  <UserCircle2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-600/5 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 font-medium"
                    placeholder="Nhập tên đăng nhập của bạn"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline px-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    Mật khẩu
                  </label>
                  <Link href="#" className="text-[9px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">Quên mật khẩu?</Link>
                </div>
                <div className="relative group/input font-inter">
                  <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-600/5 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 font-medium"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-slate-950 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-slate-950/10 active:scale-[0.98] mt-8 border border-white/10"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Xác thực & Truy cập</span>
                  <ShieldCheck size={16} className="opacity-70" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800/50 text-center">
            <div className="flex items-center justify-center gap-3 mb-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="h-px w-8 bg-slate-300 dark:bg-slate-700" />
               <p className="text-[9px] font-bold text-slate-400">
                  Giao thức bảo mật
               </p>
               <div className="h-px w-8 bg-slate-300 dark:bg-slate-700" />
            </div>
            <p className="text-[8px] font-medium text-slate-400 dark:text-slate-600 leading-relaxed">
                Phiên bản v4.0.0-Ent <span className="mx-2 hidden sm:inline">•</span> © 2026 Hệ thống GaraMaster
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-500">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin relative" />
          </div>
            <p className="text-slate-400 font-bold text-[10px]">Đang khởi tạo...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
