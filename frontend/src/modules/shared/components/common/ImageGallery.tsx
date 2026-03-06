'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
    images: string | string[] | undefined;
}

export default function ImageGallery({ images }: ImageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    if (!images) return null;

    const imageList = typeof images === 'string'
        ? images.split(',').filter(url => url.trim() !== '')
        : images;

    if (imageList.length === 0) return null;

    return (
        <div className="space-y-3">
            {/* Gallery Grid */}
            <div className={`grid gap-2 ${imageList.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
                {imageList.map((url, idx) => (
                    <div
                        key={idx}
                        className="relative group aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 cursor-zoom-in bg-slate-100 dark:bg-slate-800"
                        onClick={() => setActiveIndex(idx)}
                    >
                        <img src={url} alt={`Xe ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {activeIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
                    <button
                        onClick={() => setActiveIndex(null)}
                        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-50"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {imageList.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex - 1 + imageList.length) % imageList.length); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-50"
                            >
                                <ChevronLeft className="w-10 h-10" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex + 1) % imageList.length); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-50"
                            >
                                <ChevronRight className="w-10 h-10" />
                            </button>
                        </>
                    )}

                    <div className="relative w-full h-full flex items-center justify-center" onClick={() => setActiveIndex(null)}>
                        <img
                            src={imageList[activeIndex]}
                            alt={`Xe full ${activeIndex + 1}`}
                            className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-300"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
                            {activeIndex + 1} / {imageList.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
