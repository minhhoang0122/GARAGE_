'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProcessSectionProps {
    title?: string;
    content?: string;
}

export default function ProcessSection({
    title,
    content
}: ProcessSectionProps) {
    const displayTitle = title || "Quy trình 4 bước <br className=\"hidden md:block\" /> bảo dưỡng chuyên sâu";
    const displayDesc = content || "Khách hàng chốt phương án trước khi thi công. Trung tâm cam kết chất lượng phụ tùng chính hãng và minh bạch tuyệt đối về chi phí.";

    const defaultSteps = [
        { step: '01', title: 'Khảo Sát Nhu Cầu', desc: 'Cố vấn dịch vụ tiếp nhận xe, lắng nghe yêu cầu của Quý khách và sử dụng máy chẩn đoán chuyên sâu để xác định tình trạng.' },
        { step: '02', title: 'Tư Vấn & Báo Giá', desc: 'Đưa ra phương án sửa chữa tối ưu, minh bạch báo giá phụ tùng và nhân công. Chỉ tiến hành khi Quý khách chốt phương án.' },
        { step: '03', title: 'Thực Hiện Dịch Vụ', desc: 'Đội ngũ Kỹ thuật viên chuyên nghiệp tiến hành bảo dưỡng chuyên sâu, thay thế phụ tùng chính hãng tại khu vực cầu nâng.' },
        { step: '04', title: 'Quy Trình KCS', desc: 'Kiểm tra chất lượng (KCS) toàn diện, vệ sinh buồng đốt/khoang máy, vận hành thử xe trên đường thực tế trước khi bàn giao.' }
    ];

    return (
        <section id="quy-trinh" className="py-24 bg-stone-100/50 border-y border-stone-200 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-xs font-black !text-orange-600 uppercase tracking-[0.3em] mb-4 block"
                    >
                        Professional Workflow
                    </motion.span>
                    <motion.h3 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black !text-stone-900 leading-[1.1] mb-6 tracking-tight" 
                        dangerouslySetInnerHTML={{ __html: displayTitle }} 
                    />
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-stone-700 text-lg leading-relaxed font-medium"
                    >
                        {displayDesc}
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
                    {defaultSteps.map((item, idx) => (
                        <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-8 md:p-10 rounded-2xl border border-stone-200 hover:border-orange-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] transition-all relative group cursor-default overflow-hidden"
                        >
                            <div className="text-8xl font-black text-stone-100/80 absolute -top-4 -right-4 z-0 transition-all group-hover:text-orange-50 group-hover:-translate-y-2 group-hover:scale-110 pointer-events-none select-none font-mono tracking-tighter">
                                {item.step}
                            </div>
                            
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-900 font-bold mb-8 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                    {item.step}
                                </div>
                                <h4 className="text-xl font-bold mb-4 !text-stone-900 group-hover:text-orange-600 transition-colors tracking-tight">{item.title}</h4>
                                <p className="text-stone-700 text-sm leading-relaxed font-bold opacity-100">{item.desc}</p>
                            </div>

                            <div className="absolute bottom-0 left-0 h-1 w-0 bg-orange-600 group-hover:w-full transition-all duration-500" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
