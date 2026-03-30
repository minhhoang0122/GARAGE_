'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, AlertCircle, Phone, Lock, ArrowLeft, 
  User, Mail, MapPin, CheckCircle, ArrowRight, ShieldCheck,
  Moon, Sun
} from 'lucide-react';
import { useRegisterCustomer, useVerifyRegistration } from '@/modules/customer/hooks/useCustomer';
import { useTheme } from '@/contexts/ThemeContext';

type AuthMode = 'login' | 'register' | 'verify';

function CustomerAuthContent() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get('mode') as AuthMode) || 'login';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const registerMutation = useRegisterCustomer();
  const verifyMutation = useVerifyRegistration();
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    password: '',
    xacNhanMatKhau: '',
  });
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (searchParams.get('registered') === '1') {
      setMode('login');
    }
  }, [searchParams]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username: loginPhone.trim(),
        password: loginPassword,
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (registerForm.password !== registerForm.xacNhanMatKhau) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự.');
      return;
    }

    registerMutation.mutate({
      fullName: registerForm.fullName.trim(),
      phone: registerForm.phone.trim(),
      email: registerForm.email.trim(),
      address: registerForm.address || null,
      password: registerForm.password,
    }, {
      onSuccess: (data) => {
        if (!data.success) {
          setError(data.message || 'Đăng ký thất bại.');
          return;
        }
        setMode('verify');
      },
      onError: (err: any) => {
        setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    });
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    verifyMutation.mutate({
      email: registerForm.email.trim(),
      code: otp.trim(),
    }, {
      onSuccess: (data) => {
        if (!data.success) {
          setError(data.message || 'Xác thực thất bại.');
          return;
        }
        setMode('login');
        setError(''); // Clear error on success
      },
      onError: (err: any) => {
        setError(err.message || 'Có lỗi xảy ra trong quá trình xác thực.');
      }
    });
  };

  const isMutationLoading = registerMutation.isPending || verifyMutation.isPending;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f16] font-inter overflow-hidden transition-colors duration-500">
      {/* Left Side: Visual Branding - High-end Automotive Detail */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 border-r border-slate-200 dark:border-slate-800">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[40000ms] hover:scale-110"
          style={{ backgroundImage: 'url("/auth-bg.png")' }}
        />
        {/* Grain Overlay - Subtle Realism */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        
        {/* Branding Overlay */}
        <div className="absolute bottom-20 left-20 right-20 z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-4 mb-4">
               <div className="h-px w-10 bg-blue-500" />
               <span className="text-xs font-black text-blue-400 uppercase tracking-[0.4em]">Official Portal</span>
            </div>
            <h2 className="text-6xl font-black text-white leading-tight mb-6 tracking-tighter uppercase italic">
              Garage<br />Master
            </h2>
            <p className="text-slate-300 text-xl font-medium leading-relaxed max-w-lg mb-10 opacity-70">
              Kiến tạo chuẩn mực mới trong dịch vụ kỹ thuật <br /> và trải nghiệm chăm sóc xế cưng.
            </p>

            <div className="grid grid-cols-2 gap-12">
               <div>
                  <p className="text-white text-4xl font-black tracking-tighter italic">250+</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Điểm dịch vụ đạt chuẩn</p>
               </div>
               <div>
                  <p className="text-white text-4xl font-black tracking-tighter italic">98%</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Mức độ hài lòng</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Auth Content - Sharp Enterprise Style */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 relative bg-white dark:bg-[#0a0f16]">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <span className="text-xl font-black dark:text-white tracking-tighter uppercase italic">
              GarageMaster
            </span>
        </div>

        {/* Global Navigation */}
        <div className="absolute top-10 right-8 flex items-center gap-8">
          <Link 
            href="/login" 
            className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 group uppercase tracking-[0.2em]"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Thoát</span>
          </Link>
          <div className="h-4 w-px bg-slate-100 dark:bg-slate-800" />
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>

        <div className="w-full h-full max-w-[480px] mx-auto flex flex-col justify-center py-20">
          <AnimatePresence mode="wait">
            {/* LOGIN MODE */}
            {mode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div className="mb-12">
                   <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">Đăng nhập</h1>
                   <div className="h-1.5 w-12 bg-blue-600 rounded-full mb-4" />
                   <p className="text-slate-500 dark:text-slate-400 font-medium">Truy cập hệ thống quản lý xe dành cho khách hàng.</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wide">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Số điện thoại đăng ký</label>
                    <div className="relative group/input">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                      <input
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="VD: 0912345678"
                        className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Mật mã bảo mật</label>
                      <Link href="#" className="text-[9px] font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 uppercase tracking-widest transition-colors">Quên mã?</Link>
                    </div>
                    <div className="relative group/input">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 px-4 bg-slate-950 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl dark:shadow-blue-900/20 active:scale-[0.98] uppercase text-[11px] tracking-[0.3em] mt-8"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Tiếp tục truy cập</span>}
                  </button>
                </form>

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                    Lần đầu tham gia hệ thống?{' '}
                    <button 
                      onClick={() => setMode('register')}
                      className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest hover:text-blue-700 ml-1 transition-colors"
                    >
                      Đăng ký ngay
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* REGISTER MODE */}
            {mode === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div className="mb-8">
                   <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">Đăng ký</h1>
                   <div className="h-1.5 w-12 bg-blue-600 rounded-full mb-4" />
                   <p className="text-slate-500 dark:text-slate-400 font-medium">Cung cấp thông tin để chúng tôi phục vụ Quý khách tốt nhất.</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {error && (
                    <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 flex items-center gap-3 text-orange-700 dark:text-orange-400 text-xs font-bold uppercase tracking-wide">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Họ tên chủ xe</label>
                       <div className="relative group/input">
                         <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                          <input
                            type="text"
                            value={registerForm.fullName}
                            onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                            placeholder="VD: Nguyen Van A"
                            className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                            required
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Số điện thoại</label>
                       <div className="relative group/input">
                         <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                          <input
                            type="tel"
                            value={registerForm.phone}
                            onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                            placeholder="VD: 091xxx"
                            className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                            required
                          />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Email nhận mã OTP</label>
                    <div className="relative group/input">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                        placeholder="VD: name@company.com"
                        className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Địa chỉ (Tùy chọn)</label>
                    <input
                      type="text"
                      value={registerForm.address}
                      onChange={(e) => setRegisterForm({...registerForm, address: e.target.value})}
                      placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                      className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Thiết lập mật mã</label>
                       <input
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                        placeholder="••••••"
                        className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Xác nhận mật mã</label>
                      <input
                        type="password"
                        value={registerForm.xacNhanMatKhau}
                        onChange={(e) => setRegisterForm({...registerForm, xacNhanMatKhau: e.target.value})}
                        placeholder="••••••"
                        className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isMutationLoading}
                    className="w-full py-5 px-4 bg-slate-950 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl dark:shadow-blue-900/20 active:scale-[0.98] uppercase text-[11px] tracking-[0.3em] mt-6"
                  >
                    {isMutationLoading ? <Loader2 size={18} className="animate-spin" /> : <span>Tạo tài khoản hồ sơ</span>}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                    Đã là thành viên?{' '}
                    <button 
                      onClick={() => setMode('login')}
                      className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest hover:text-blue-700 ml-1 transition-colors"
                    >
                      Quay lại đăng nhập
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* VERIFY MODE */}
            {mode === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div className="mb-10 text-center">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-100 dark:border-blue-900/50 text-blue-600">
                    <Mail size={32} />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">Xác thực hồ sơ</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Mã bảo mật gồm 6 chữ số đã được gửi tới: <br />
                    <span className="text-slate-900 dark:text-white font-bold inline-block border-b-2 border-blue-600/30 pb-0.5 mt-1">{registerForm.email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifySubmit} className="space-y-8">
                  {error && (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase justify-center">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  <div className="relative font-inter">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000 000"
                      className="w-full bg-slate-50/50 dark:bg-slate-900/30 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white text-center text-5xl font-black tracking-[0.4em] rounded-3xl py-6 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-200 dark:placeholder:text-slate-800 sm:tracking-[0.6em]"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={isMutationLoading || otp.length !== 6}
                      className="w-full py-5 px-4 bg-slate-950 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] uppercase text-[11px] tracking-[0.3em]"
                    >
                      {isMutationLoading ? <Loader2 size={18} className="animate-spin" /> : <span>Hoàn tất xác thực</span>}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="w-full text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 transition-colors"
                    >
                      Thay đổi email nhận mã
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-slate-300 dark:text-slate-800">
                     <div className="h-px w-full bg-slate-100 dark:bg-slate-900" />
                     <ShieldCheck size={20} className="shrink-0" />
                     <div className="h-px w-full bg-slate-100 dark:bg-slate-900" />
                  </div>

                  <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 leading-relaxed font-bold uppercase tracking-[0.2em]">
                    Mã xác thực có hiệu lực trong 15 phút.
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Footer Info */}
        <div className="mt-auto pb-10 flex items-center justify-between text-slate-300 dark:text-slate-800">
            <div className="flex gap-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Privacy Policy</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">System Status</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
               © 2026 GaraMaster Group
            </p>
        </div>
      </div>
    </div>
  );
}

export default function CustomerAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#0a0f16] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>}>
      <CustomerAuthContent />
    </Suspense>
  );
}
