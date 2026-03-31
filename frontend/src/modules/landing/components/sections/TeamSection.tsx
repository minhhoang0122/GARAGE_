'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Linkedin, Instagram } from 'lucide-react';

interface TeamSectionProps {
    title?: string;
    content?: string;
}

const teamData = [
    {
        name: "Anh Bùi Khánh",
        role: "Trưởng phòng Kỹ thuật",
        spec: "Chuyên gia chẩn đoán Điện - ECU",
        img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        name: "Anh Quốc Việt",
        role: "Cố vấn dịch vụ",
        spec: "Tư vấn bảo dưỡng chuyên sâu",
        img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        name: "Anh Tuấn Anh",
        role: "Kỹ thuật viên trưởng",
        spec: "Chuyên gia Máy - Gầm - Hộp số",
        img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
];

export default function TeamSection({
    title,
    content
}: TeamSectionProps) {
    const displayTitle = title || "Đội ngũ chuyên gia dày dạn kinh nghiệm";
    const displaySubtitle = content || "Quy tụ những cá nhân ưu tú, tận tâm vì sự an toàn của Quý khách.";

    return (
        <section className="py-24 bg-[#1C1917] text-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div className="max-w-xl">
                        <span className="text-orange-500 font-black uppercase text-xs tracking-widest mb-4 block">
                            Con người là nòng cốt
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight !text-white">
                            {displayTitle}
                        </h2>
                        <p className="text-stone-400 text-lg">
                            {displaySubtitle}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-1 w-24 bg-orange-600 rounded-full" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {teamData.map((member, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-stone-900 border border-stone-800 p-6 rounded-3xl group hover:border-orange-500/30 transition-all"
                        >
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-8 relative">
                                <img
                                    src={member.img}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                                    alt={member.name}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="absolute bottom-6 left-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <SocialIcon icon={Phone} />
                                    <SocialIcon icon={Mail} />
                                    <SocialIcon icon={Linkedin} />
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-1 !text-white">{member.name}</h3>
                            <p className="text-orange-500 font-bold text-xs mb-4">
                                {member.role}
                            </p>
                            <p className="text-stone-400 text-sm italic font-medium">
                                "{member.spec}"
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function SocialIcon({ icon: Icon }: { icon: any }) {
    return (
        <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-orange-600 transition-colors">
            <Icon size={18} />
        </button>
    );
}
