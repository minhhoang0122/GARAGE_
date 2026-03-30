'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import Portal from '../ui/Portal';

interface AvatarUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAvatar: string | null | undefined;
    onUpload: (file: File) => Promise<void>;
}

export default function AvatarUploadModal({ isOpen, onClose, currentAvatar, onUpload }: AvatarUploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Reset state when opening/closing
    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setPreviewUrl(null);
            setIsSubmitting(false);
            setIsDragging(false);
        }
    }, [isOpen]);

    const handleFileChange = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn tệp hình ảnh');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ảnh không được vượt quá 5MB');
            return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileChange(file);
    }, []);

    const handleSave = async () => {
        if (!selectedFile) return;
        setIsSubmitting(true);
        try {
            await onUpload(selectedFile);
            onClose();
        } catch (error) {
            // Error handled by parent
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Portal>
                    <div className="fixed inset-0 z-[99999] overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl"
                        />

                        <div className="min-h-full flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-200/50 dark:border-slate-800 pointer-events-auto"
                            >
                                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Cập nhật ảnh đại diện</h3>
                                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-8">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Xem trước</div>
                                        <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-indigo-500/20 ring-8 ring-indigo-500/5 shadow-2xl">
                                            {previewUrl || currentAvatar ? (
                                                <Image
                                                    src={previewUrl || currentAvatar || ''}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized={previewUrl ? true : currentAvatar?.startsWith('http')}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <Camera className="w-10 h-10 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={onDrop}
                                        className={`
                                            border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 transition-all duration-300
                                            ${isDragging 
                                                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 scale-95' 
                                                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'}
                                        `}
                                    >
                                        <div className={`p-4 rounded-2xl ${isDragging ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'} transition-colors duration-300`}>
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                Kéo thả ảnh vào đây hoặc
                                            </p>
                                            <label className="text-sm font-black text-indigo-600 hover:text-indigo-500 cursor-pointer underline-offset-4 hover:underline">
                                                Chọn tệp từ máy tính
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileChange(file);
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Định dạng: JPG, PNG, WEBP (Max 5MB)</p>
                                    </div>
                                </div>

                                <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
                                    <button
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="px-6 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={!selectedFile || isSubmitting}
                                        className={`
                                            px-8 py-3 rounded-2xl text-sm font-black text-white shadow-xl transition-all duration-300
                                            flex items-center gap-3
                                            ${!selectedFile || isSubmitting
                                                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-50'
                                                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30 hover:shadow-indigo-500/40 active:scale-95'}
                                        `}
                                    >
                                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {isSubmitting ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </Portal>
            )}
        </AnimatePresence>
    );
}
