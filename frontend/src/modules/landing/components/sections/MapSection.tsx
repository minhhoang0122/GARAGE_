'use client';

import React from 'react';
import { MapPin, Phone, Clock, Mail, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

interface MapSectionProps {
    title?: string;
    content?: string;
}

export default function MapSection({
    title,
    content
}: MapSectionProps) {
    const displayTitle = title || "Vị trí của chúng tôi tại Yên Lãng";
    const displaySubtitle = content || "Số 120 Yên Lãng, Đống Đa, Hà Nội. Chúng tôi luôn sẵn sàng đón tiếp Quý khách.";

    const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.5901594967396!2d105.8152573153319!3d21.009047993828956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac842526e061%3A0xe53dec8c7a6e129e!2zMTIwIFnDqm4gTMSDbmcsIFRo4bu‹bmggUXVhbmcsIMSQ4buRbmcgxJBhLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1711710000000!5m2!1svi!2s";

    return (
        <section className="py-24 bg-stone-50 border-t border-stone-200">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Info Side */}
                    <div className="lg:w-1/3 flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-orange-600 font-black uppercase text-xs tracking-widest mb-4 block">
                                Ghé thăm Trung tâm
                            </span>
                            <h2 className="text-4xl font-black mb-8 leading-tight tracking-tight !text-stone-900">
                                {displayTitle}
                            </h2>
                            <p className="text-stone-700 text-lg leading-relaxed mb-12 font-medium">
                                {displaySubtitle}
                            </p>

                            <div className="space-y-8">
                                <ContactItem 
                                    icon={MapPin} 
                                    title="Địa chỉ" 
                                    text="120 Yên Lãng, Đống Đa, Hà Nội" 
                                />
                                <ContactItem 
                                    icon={Phone} 
                                    title="Hotline" 
                                    text="0912 345 678" 
                                />
                                <ContactItem 
                                    icon={Clock} 
                                    title="Giờ làm việc" 
                                    text="08:00 - 18:00 (Tất cả các ngày)" 
                                />
                            </div>

                            <div className="mt-12">
                                <a 
                                    href="https://maps.app.goo.gl/tV9j6G5H7W9X9Z9A6" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-black/10 hover:shadow-orange-500/30"
                                >
                                    <Navigation size={16} />
                                    Chỉ đường trên Google Maps
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Map Side */}
                    <div className="lg:w-2/3">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="h-[500px] lg:h-full min-h-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl shadow-black/[0.05] border border-stone-200 relative group"
                        >
                            <iframe 
                                src={mapSrc}
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen={true} 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                className="transition-all duration-700"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ContactItem({ icon: Icon, title, text }: { icon: any, title: string, text: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="bg-white p-3 rounded-xl shadow-lg shadow-black/[0.03] border border-stone-100 flex-shrink-0">
                <Icon size={20} className="text-orange-600" />
            </div>
            <div>
                <h4 className="font-black !text-stone-600 text-[10px] uppercase tracking-widest mb-1">{title}</h4>
                <p className="!text-stone-900 font-bold">{text}</p>
            </div>
        </div>
    );
}
