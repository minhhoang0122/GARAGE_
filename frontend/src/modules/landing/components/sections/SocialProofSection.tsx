'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SocialProofSectionProps {
    title?: string;
    content?: string;
}

const mechanicalSpring = {
    type: "spring",
    stiffness: 120,
    damping: 14,
    mass: 1.2
} as const;

export default function SocialProofSection({
    title,
    content
}: SocialProofSectionProps) {
    const displayTitle = title || "Đánh giá từ khách hàng";
    const displaySubtitle = content || "Gara đã đón nhận sự tin tưởng của đông đảo các hội nhóm xe tại Hà Nội.";

    const testimonials = [
        {
            name: "Anh Dũng - Thanh Xuân",
            car: "Khách vãng lai • Honda CR-V 2020",
            text: "\"Xe CRV của tôi gặp sự cố lên dốc bị giật cục. Mặc dù tình trạng khá nan giải nhưng kỹ thuật viên tại Garage Master đã chẩn đoán chính xác bằng thiết bị chuyên dùng. Thay thế cụm bướm ga theo đúng khuyến cáo giúp xe hoạt động êm ái trở lại. Cố vấn dịch vụ tư vấn rất chuẩn xác.\""
        },
        {
            name: "Chú Cường - Đống Đa",
            car: "Làm đồng sơn mâm xe • GLC 200",
            text: "\"Không gian xưởng rất chuyên nghiệp, quy trình tiếp nhận và đưa xe lên cầu nâng rõ ràng, bài bản. Bề mặt sơn sau khi xử lý tại phòng sấy tiêu chuẩn cho màu sắc tiệp 99% so với nguyên bản. Rất đáng tin cậy.\""
        },
        {
            name: "Anh Việt - Long Biên",
            car: "Bảo dưỡng định kỳ • Mazda CX-5",
            text: "\"Tới bảo dưỡng mốc 4 vạn km. Cố vấn dịch vụ báo giá công khai minh bạch ngay từ đầu. Thao tác tháo lắp của đội ngũ kỹ thuật rất chuẩn xác. Chắc chắn tôi sẽ tiếp tục ủng hộ Trung tâm vào lần tới.\""
        }
    ];

    return (
        <section className="py-24 bg-[#1C1917] text-stone-300">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={mechanicalSpring}
                    viewport={{ once: true, amount: 0.8 }}
                    className="text-center max-w-2xl mx-auto mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold !text-white mb-6 leading-tight">{displayTitle}</h2>
                    <p className="text-lg !text-stone-300 leading-relaxed font-medium">{displaySubtitle}</p>
                </motion.div>

                {/* Infinite Marquee Container */}
                <div className="relative w-full overflow-hidden flex py-4">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[#1C1917] to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[#1C1917] to-transparent z-10 pointer-events-none"></div>

                    <motion.div
                        className="flex gap-8 whitespace-nowrap min-w-max"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
                    >
                        {[1, 2].map((loopIndex) => (
                            <div key={loopIndex} className="flex gap-8">
                                {testimonials.map((t, idx) => (
                                    <div key={idx} className="w-[350px] md:w-[450px] whitespace-normal p-8 border-l-4 border-stone-700 bg-stone-900/50 hover:bg-stone-800/80 transition-colors shrink-0">
                                        <p className="text-lg md:text-xl !text-stone-200 italic font-medium mb-6 leading-relaxed">
                                            {t.text}
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h4 className="font-bold !text-white uppercase tracking-wide">{t.name}</h4>
                                                <p className="text-sm !text-orange-500/90 font-bold uppercase tracking-tighter">{t.car}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
