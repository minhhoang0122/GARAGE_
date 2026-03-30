'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CustomerRegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Chuyển hướng sang trang login với chế độ đăng ký
    router.replace('/customer/login?mode=register');
  }, [router]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f16] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
