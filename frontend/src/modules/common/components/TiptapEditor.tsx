'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered, Quote, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

import { useEffect, useState } from 'react';

interface TiptapEditorProps {
    value: string;
    onChange: (val: string) => void;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true, // Auto convert pasted images to base64
            }),
            Link.configure({
                openOnClick: false,
            }),
            Placeholder.configure({
                placeholder: 'Viết nội dung bài viết hoặc dán ảnh vào đây...',
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[400px]',
            },
        },
    });

    if (!isClient || !editor) {
        return <div className="min-h-[400px] border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 animate-pulse flex items-center justify-center text-slate-400">Đang khởi tạo trình soạn thảo...</div>;
    }

    const addImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                // Giới hạn kích thước ảnh 5MB nếu cần
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target?.result as string;
                    editor.chain().focus().setImage({ src: dataUrl }).run();
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Nhập link:', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 px-6 py-6">
            {editor && (
                <FloatingMenu editor={editor} options={{ placement: 'top-start' }} className="flex overflow-hidden border border-slate-200 bg-white shadow-xl rounded-lg divide-x divide-slate-100 p-1">
                    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={'p-2 hover:bg-slate-50 text-slate-600'} title="Heading 2">
                        <Heading2 size={16} />
                    </button>
                    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={'p-2 hover:bg-slate-50 text-slate-600'} title="Heading 3">
                        <Heading3 size={16} />
                    </button>
                    <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={'p-2 hover:bg-slate-50 text-slate-600'} title="Danh sách">
                        <List size={16} />
                    </button>
                    <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={'p-2 hover:bg-slate-50 text-slate-600'} title="Danh sách số">
                        <ListOrdered size={16} />
                    </button>
                    <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={'p-2 hover:bg-slate-50 text-slate-600'} title="Trích dẫn">
                        <Quote size={16} />
                    </button>
                    <button type="button" onClick={addImage} className={'p-2 hover:bg-slate-50 text-slate-600'} title="Chèn ảnh">
                        <ImageIcon size={16} />
                    </button>
                </FloatingMenu>
            )}

            {editor && (
                <BubbleMenu editor={editor} options={{ placement: 'top' }} className="flex overflow-hidden border border-slate-200 bg-white shadow-xl rounded-lg divide-x divide-slate-100 p-1">
                    <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 hover:bg-slate-50 ${editor.isActive('bold') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}>
                        <Bold size={16} />
                    </button>
                    <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 hover:bg-slate-50 ${editor.isActive('italic') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}>
                        <Italic size={16} />
                    </button>
                    <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-2 hover:bg-slate-50 ${editor.isActive('strike') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}>
                        <Strikethrough size={16} />
                    </button>
                    <button type="button" onClick={setLink} className={`p-2 hover:bg-slate-50 ${editor.isActive('link') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}>
                        <LinkIcon size={16} />
                    </button>
                </BubbleMenu>
            )}

            <EditorContent editor={editor} />
        </div>
    );
}
