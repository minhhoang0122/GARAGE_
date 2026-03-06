'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueChartProps {
    data: any[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    const { theme } = useTheme();

    if (!data || data.length === 0) {
        return <div className="h-[300px] flex items-center justify-center text-slate-400">Chưa có dữ liệu doanh thu</div>;
    }

    const isDark = theme === 'dark';
    const gridColor = isDark ? '#334155' : '#E2E8F0';
    const textColor = isDark ? '#94a3b8' : '#64748B';
    const tooltipBg = isDark ? '#1e293b' : '#ffffff';
    const tooltipBorder = isDark ? '#334155' : 'none';
    const tooltipText = isDark ? '#f1f5f9' : '#1e293b';

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: textColor }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: textColor }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value / 1000000}M`}
                    />
                    <Tooltip
                        formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))}
                        contentStyle={{
                            backgroundColor: tooltipBg,
                            borderRadius: '8px',
                            border: isDark ? `1px solid ${tooltipBorder}` : 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            color: tooltipText
                        }}
                        itemStyle={{ color: tooltipText }}
                        labelStyle={{ color: textColor, marginBottom: '0.25rem' }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Doanh thu" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
