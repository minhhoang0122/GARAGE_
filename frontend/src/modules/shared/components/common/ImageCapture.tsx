'use client';

import { useState, useRef } from 'react';
import { Camera, X, ImageIcon, Loader2, Plus } from 'lucide-react';

interface ImageCaptureProps {
    onImagesChange?: (files: File[]) => void;
    label?: string;
    isUploading?: boolean;
    maxImages?: number;
    disabled?: boolean;
}

export default function ImageCapture({
    onImagesChange,
    label = "Hình ảnh hiện trạng",
    isUploading = false,
    maxImages = 5,
    disabled = false
}: ImageCaptureProps) {
    const [previews, setPreviews] = useState<{ id: string; url: string; file: File }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newImages = files.slice(0, maxImages - previews.length).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
            file
        }));

        const updatedPreviews = [...previews, ...newImages];
        setPreviews(updatedPreviews);

        if (onImagesChange) {
            onImagesChange(updatedPreviews.map(p => p.file));
        }

        // Reset input so the same file can be picked again if removed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (id: string) => {
        const imageToRemove = previews.find(p => p.id === id);
        if (imageToRemove) {
            URL.revokeObjectURL(imageToRemove.url);
        }

        const updatedPreviews = previews.filter(p => p.id !== id);
        setPreviews(updatedPreviews);

        if (onImagesChange) {
            onImagesChange(updatedPreviews.map(p => p.file));
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
                <span className="text-xs text-slate-500">{previews.length}/{maxImages} ảnh</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previews.map((img) => (
                    <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                        <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}

                {previews.length < maxImages && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-video border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Camera className="w-6 h-6 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500">Thêm ảnh</span>
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
            />
        </div>
    );
}
