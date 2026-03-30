'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FacilitiesSectionProps {
    title?: string;
    content?: string;
    imageUrl?: string;
}

const mechanicalSpring = {
    type: "spring",
    stiffness: 120,
    damping: 14,
    mass: 1.2
} as const;

export default function FacilitiesSection({
    title,
    content,
    imageUrl
}: FacilitiesSectionProps) {
    const displayTitle = title || "Hệ thống trang thiết bị<br /> hiện đại, toàn diện.";
    const displayDesc = content || "Được đầu tư bài bản với máy móc nhập khẩu chuyên dụng, Trung tâm chúng tôi cam kết đáp ứng mọi tiêu chuẩn khắt khe nhất trong quá trình chẩn đoán và sửa chữa, đem lại sự an tâm tuyệt đối cho Quý khách.";
    const mainImage = imageUrl || "https://images.unsplash.com/photo-1504222490345-c075b6008014?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

    const stats = [
        { label: "10+", title: "Cầu Nâng Sức Mẻo", desc: "Hệ thống cầu nâng 2 trụ, 4 trụ cân chỉnh thước lái phục vụ gầm cao lẫn sedan hạng D." },
        { label: "02", title: "Phòng Sơn Sấy", desc: "Cách ly hoàn toàn hạt bụi, hệ thống khò sấy bằng hồng ngoại giúp sơn chín tiệp màu 100%." },
        { label: "100%", title: "Test Lỗi Hãng", desc: "Có đủ máy VCI chẩn đoán hộp đen cho Mercedes, BMW, Audi, Lexus đến xe phổ thông." },
        { label: "30+", title: "Đội Ngũ Kỹ Thuật", desc: "Kỹ thuật viên chuyên nghiệp, giàu kinh nghiệm, phân bổ độc lập chuyên môn theo từng mảng: máy-gầm, điện, đồng sơn." }
    ];

    return (
        <section id="co-so" className="py-24 bg-white overflow-hidden relative">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={mechanicalSpring}
                        className="w-full lg:w-5/12"
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold !text-[#111] mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: displayTitle }} />
                        <p className="text-lg text-stone-700 mb-10 leading-relaxed font-medium">{displayDesc}</p>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                            {stats.map((stat, idx) => (
                                <div key={idx}>
                                    <div className="text-4xl font-black !text-orange-600 mb-2">{stat.label}</div>
                                    <div className="font-bold !text-stone-800 text-lg">{stat.title}</div>
                                    <p className="text-stone-700 text-sm mt-3 leading-relaxed font-bold opacity-100">{stat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, ...mechanicalSpring }}
                        className="w-full lg:w-7/12 grid grid-cols-2 gap-4 h-[500px] md:h-[600px] lg:h-[700px]"
                    >
                        <div className="col-span-1 p-2 bg-stone-100 shadow-xl overflow-hidden group">
                            <img src={mainImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Cơ sở vật chất" />
                        </div>
                        <div className="col-span-1 grid grid-rows-2 gap-4 h-full">
                            <div className="p-2 bg-stone-100 shadow-xl overflow-hidden group">
                                <img src="https://images.unsplash.com/photo-1493238792000-8113da705763?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Xưởng dịch vụ" />
                            </div>
                            <div className="p-2 bg-stone-100 shadow-xl overflow-hidden group">
                                <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Quy trình sửa chữa" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
