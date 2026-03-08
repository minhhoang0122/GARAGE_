'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight, MapPin, PhoneCall, Clock, ShieldCheck, Wrench, Settings, Search, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
    const { data: session } = useSession();

    return (
        <div className="flex flex-col min-h-screen bg-[#fafaf8] selection:bg-orange-200">
            {/* Top Bar - Trust Signal First */}
            <div className="bg-[#1C1917] text-stone-300 py-2.5 px-4 text-xs md:text-sm font-medium">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2"><MapPin size={16} className="text-orange-500" /> 123 Đường Láng, Hà Nội</span>
                        <span className="flex items-center gap-2 hidden sm:flex"><Clock size={16} className="text-orange-500" /> T2 - T7: 8:00 - 18:00</span>
                    </div>
                    <div className="flex items-center gap-2 text-white bg-orange-600/20 px-3 py-1 rounded-full border border-orange-500/30">
                        <PhoneCall size={14} className="text-orange-500" />
                        <span className="tracking-wide">Hotline Kỹ Thuật: <strong className="text-orange-400">098.765.4321</strong></span>
                    </div>
                </div>
            </div>

            {/* Hero Section - Visceral Impact */}
            <header className="relative w-full h-[85vh] min-h-[600px] flex items-center">
                {/* Background Image - Real Photography */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Mechanic working on car engine"
                        className="w-full h-full object-cover object-center grayscale-[20%]"
                    />
                    {/* Dark gradient overlay so text is readable, stronger on the left */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 w-full pt-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-sm mb-8">
                            <ShieldCheck size={18} className="text-orange-500" />
                            <span className="text-white text-sm font-medium tracking-wide uppercase">Garage Dịch Vụ Chuyên Nghiệp Đời Thực</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white leading-[1.1] tracking-tight">
                            Bắt đúng bệnh.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">
                                Báo đúng giá.
                            </span><br />
                            Giao đúng hẹn.
                        </h1>

                        <p className="text-lg md:text-xl mb-12 text-stone-300 max-w-xl leading-relaxed font-light">
                            Không vẽ việc, không chặt chém. Chúng tôi là đội thợ máy thực dụng, sửa xe bằng vật tư chính hãng và thâm niên nghề nghiệp.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5">
                            {session?.user ? (
                                <Link href="/admin" className="group bg-orange-600 hover:bg-orange-500 text-white px-8 py-5 rounded-sm font-bold transition-all shadow-lg hover:shadow-orange-600/20 hover:-translate-y-0.5 flex items-center justify-center gap-3 w-fit">
                                    Vào khu vực quản lý
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <Link href="/booking" className="group bg-orange-600 hover:bg-orange-500 text-white px-8 py-5 rounded-sm font-bold transition-all shadow-[0_8px_30px_rgb(234,88,12,0.3)] hover:shadow-[0_8px_30px_rgb(234,88,12,0.5)] hover:-translate-y-1 flex items-center justify-center gap-3 w-fit text-lg">
                                    Đặt lịch sửa chữa ngay
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}

                            <div className="flex items-center gap-4 text-stone-400">
                                <div className="flex -space-x-4">
                                    <img className="w-12 h-12 border-2 border-black rounded-full object-cover" src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=100&q=80" alt="Customer" />
                                    <img className="w-12 h-12 border-2 border-black rounded-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Customer" />
                                    <img className="w-12 h-12 border-2 border-black rounded-full object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Customer" />
                                </div>
                                <div className="text-sm font-medium leading-tight">
                                    <strong className="text-white">1,500+</strong><br />
                                    Xe đã phục vụ
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Visual Storytelling Section - Asymmetric Layout (Anti-Grid) */}
            <section className="py-24 md:py-32 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6">
                    {/* Story Block 1 */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 mb-32">
                        <div className="w-full lg:w-1/2 order-2 lg:order-1 relative">
                            {/* Real Image, Imperfect Shape */}
                            <div className="relative z-10 before:absolute before:inset-0 before:-translate-x-4 before:translate-y-4 before:bg-stone-100 before:-z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Sửa chữa gầm xe thực tế"
                                    className="w-full h-auto object-cover shadow-2xl"
                                />
                            </div>

                            {/* Floating Stats Block */}
                            <div className="absolute -bottom-8 -right-8 bg-[#1C1917] text-white p-6 shadow-xl z-20 max-w-xs border-l-4 border-orange-500 hover:-translate-y-1 transition-transform">
                                <div className="flex items-start gap-4">
                                    <CheckCircle2 size={32} className="text-orange-500 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Kiểm tra miễn phí 36 hạng mục</h4>
                                        <p className="text-stone-400 text-sm">Chỉ làm việc khi quý khách đồng ý báo giá.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-1/2 order-1 lg:order-2">
                            <h2 className="text-sm font-bold text-orange-600 tracking-widest uppercase mb-4 uppercase">Quy trình thực tế</h2>
                            <h3 className="text-4xl md:text-5xl font-extrabold text-[#111] mb-8 leading-tight">
                                Giao xe cho chúng tôi,<br />bạn yên tâm đi làm việc khác.
                            </h3>

                            <ul className="space-y-8">
                                <li className="flex items-start gap-5">
                                    <div className="w-12 h-12 shrink-0 bg-stone-100 border border-stone-200 flex items-center justify-center text-xl font-bold text-stone-800">01</div>
                                    <div>
                                        <h4 className="text-xl font-bold text-stone-900 mb-2">Tiếp nhận & Chẩn đoán bằng máy</h4>
                                        <p className="text-stone-600 leading-relaxed">Kết hợp giữa máy quét lỗi chuyên sâu (OBD2) và kinh nghiệm thâm niên để xác định chính xác bộ phận hư hỏng, không mò mẫm.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-5">
                                    <div className="w-12 h-12 shrink-0 bg-stone-100 border border-stone-200 flex items-center justify-center text-xl font-bold text-stone-800">02</div>
                                    <div>
                                        <h4 className="text-xl font-bold text-stone-900 mb-2">Báo giá rõ ràng vật tư & Công cán</h4>
                                        <p className="text-stone-600 leading-relaxed">Chúng tôi liệt kê rành mạch: Cái gì hỏng cần thay, cái gì còn dùng được chỉ cần bảo dưỡng. Có hình ảnh/video gửi qua Zalo chứng minh.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-5">
                                    <div className="w-12 h-12 shrink-0 bg-orange-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-orange-600/20">03</div>
                                    <div>
                                        <h4 className="text-xl font-bold text-stone-900 mb-2">Triển khai sửa chữa & Bàn giao</h4>
                                        <p className="text-stone-600 leading-relaxed">Bạn có thể theo dõi tiến độ qua hệ thống hoặc Zalo. Phụ tùng cũ được gói lại trả khách. Xe rửa sạch sẽ trước khi giao.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof - Raw Typography style, No sliders */}
            <section className="py-24 bg-[#1C1917] text-stone-300">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Không mua review, không đánh bóng.</h2>
                        <p className="text-lg text-stone-400">Đây là những gì khách hàng ruột nói về chúng tôi sau khi lấy xe.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                        <div className="p-8 border-l-4 border-stone-700 bg-stone-900/50 hover:bg-stone-800/80 transition-colors">
                            <p className="text-xl text-white font-serif italic mb-6 leading-relaxed">
                                "Sáng mang chiếc Mazda 3 vào bị xì lốc điều hòa thợ hãng báo thay nguyên côm, qua anh em ở đây kiểm tra tháo ra chỉ bị mục ống tuy ô hàn lại hết 4 lít. Chạy mát rượi 2 năm nay."
                            </p>
                            <div className="flex items-center gap-4">
                                <div>
                                    <h4 className="font-bold text-white">Anh Tuấn - Hoàng Mai</h4>
                                    <p className="text-sm text-stone-500">Khách quen 3 năm • Mazda 3 2018</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-l-4 border-stone-700 bg-stone-900/50 hover:bg-stone-800/80 transition-colors">
                            <p className="text-xl text-white font-serif italic mb-6 leading-relaxed">
                                "Làm cái máy xe mà anh chủ cập nhật từng công đoạn một qua Zalo. Nhìn tay thợ vặn ốc có lực kế đàng hoàng là ưng rồi. Chi phí bằng 60% làm trong hãng mà chất lượng tôi thấy ngang hoặc hơn."
                            </p>
                            <div className="flex items-center gap-4">
                                <div>
                                    <h4 className="font-bold text-white">Bác Hùng - Ba Đình</h4>
                                    <p className="text-sm text-stone-500">Đại tu động cơ • Fortuner máy dầu</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-24 bg-orange-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10 mix-blend-multiply">
                    <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="garage texture" className="w-full h-full object-cover" />
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-8">Xe đang bệnh? Để thợ chúng tôi khám.</h2>
                    <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">Gọi hotline báo tình trạng hoặc đặt lịch mang xe qua xưởng. Chúng tôi cắm máy đọc lỗi miễn phí.</p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link href="/booking" className="bg-[#111] hover:bg-black text-white px-10 py-5 font-bold transition-all shadow-2xl hover:-translate-y-1 text-lg shrink-0">
                            Mang xe qua xưởng ngay
                        </Link>
                        <a href="tel:0987654321" className="bg-transparent border-2 border-white/30 hover:border-white text-white px-10 py-5 font-bold transition-all text-lg flex items-center justify-center gap-3">
                            <PhoneCall size={20} />
                            Gọi 098.765.4321
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 bg-[#111] text-stone-500">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-6 text-white text-xl font-bold">
                                GARAGEMASTER
                            </div>
                            <p className="max-w-md mb-6 leading-relaxed">
                                Xưởng dịch vụ ô tô cung cấp giải pháp sửa chữa thực dụng, chính xác với chi phí cực kỳ hợp lý cho chủ xe tại Hà Nội.
                            </p>
                            <div className="space-y-2">
                                <p className="flex items-center gap-3"><MapPin size={18} /> 123 Đường Láng, Đống Đa, Hà Nội</p>
                                <p className="flex items-center gap-3"><PhoneCall size={18} /> 098.765.4321</p>
                            </div>
                        </div>
                        <div className="md:text-right">
                            <a href="/admin" className="text-orange-500 hover:text-orange-400 font-medium underline underline-offset-4 decoration-orange-500/30">Cổng đăng nhập hệ thống (Nội bộ)</a>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-stone-800 text-sm flex justify-between items-center">
                        <p>© 2026 Garage Master. Coder bằng cơm, hỏng xe bằng mỏ lết.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

