'use client';

import { Suspense, useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Save, RefreshCw } from 'lucide-react';
import { useAdminConfigs, useUpdateConfigs } from '@/modules/admin/hooks/useAdmin';

export default function ConfigurationPage() {
    return (
        <DashboardLayout title="Cấu hình hệ thống" subtitle="Thiết lập Email và Thông báo">
            <Suspense fallback={<div>Loading...</div>}>
                <ConfigurationContent />
            </Suspense>
        </DashboardLayout>
    );
}

function ConfigurationContent() {
    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Notification Config Only */}
            <NotificationConfigTab />
        </div>
    );
}

function NotificationConfigTab() {
    const [configs, setConfigs] = useState<Record<string, string>>({});

    const { data: initialConfigs, isLoading: loading } = useAdminConfigs();
    const updateConfigsMutation = useUpdateConfigs();

    // Sync local state when query finishes
    useEffect(() => {
        if (initialConfigs) {
            setConfigs(initialConfigs);
        }
    }, [initialConfigs]);

    const handleSave = async () => {
        updateConfigsMutation.mutate(configs);
    };

    const handleChange = (key: string, value: string) => {
        setConfigs(prev => ({ ...prev, [key]: value }));
    };

    if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Đang tải cấu hình...</div>;
    const saving = updateConfigsMutation.isPending;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6 transition-colors">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">Cấu hình kênh thông báo</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Bật/tắt các kênh thông báo chính cho khách hàng</p>
            </div>

            <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-slate-900 focus:ring-slate-500"
                        checked={configs['NOTIFY_EMAIL'] === 'true'}
                        onChange={(e) => handleChange('NOTIFY_EMAIL', String(e.target.checked))}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Gửi Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-slate-900 focus:ring-slate-500"
                        checked={configs['NOTIFY_SMS'] === 'true'}
                        onChange={(e) => handleChange('NOTIFY_SMS', String(e.target.checked))}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Gửi SMS</span>
                </label>
            </div>

            {configs['NOTIFY_EMAIL'] === 'true' && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-medium text-slate-800 dark:text-slate-200">Cấu hình Email (SMTP Gmail)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">SMTP Host</label>
                            <input
                                className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                                value="smtp.gmail.com"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">SMTP Port</label>
                            <input
                                className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                                value="587"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email gửi (Gmail)</label>
                            <input
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
                                placeholder="example@gmail.com"
                                value={configs['MAIL_USERNAME'] || ''}
                                onChange={(e) => handleChange('MAIL_USERNAME', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Mật khẩu ứng dụng (App Password)</label>
                            <input
                                type="password"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
                                placeholder="xxxx xxxx xxxx xxxx"
                                value={configs['MAIL_PASSWORD'] || ''}
                                onChange={(e) => handleChange('MAIL_PASSWORD', e.target.value)}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Lưu ý: Sử dụng App Password, không phải mật khẩu đăng nhập Gmail.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Lưu cấu hình
                </button>
            </div>
        </div>
    );
}
