const fs = require('fs');

const file1 = 'src/app/(admin)/admin/cms/blog/new/page.tsx';
let content = fs.readFileSync(file1, 'utf8');

// Imports
content = content.replace(
    "import { useToast } from '@/contexts/ToastContext';",
    "import { useToast } from '@/contexts/ToastContext';\nimport { useEffect } from 'react';\nimport dynamic from 'next/dynamic';\n\nconst TiptapEditor = dynamic(() => import('@/modules/common/components/TiptapEditor'), { ssr: false });"
);

// Preview state
content = content.replace(
    "const [previewMode, setPreviewMode] = useState(false);",
    "// Preview format removed. Tiptap is WYSIWYG."
);

// Auto-save logic
content = content.replace(
    "const handleTitleChange",
    `
    // Restore logic
    useEffect(() => {
        const draft = localStorage.getItem('draft_blog_post');
        if (draft) {
            if (window.confirm('Quý khách có một bản nháp bài viết chưa lưu. Cố vấn Dịch vụ muốn khôi phục lại không?')) {
                try {
                    const parsed = JSON.parse(draft);
                    setForm(parsed);
                } catch(e) {}
            }
        }
    }, [setForm]);

    // Auto-save logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (form.title || form.content) {
                localStorage.setItem('draft_blog_post', JSON.stringify(form));
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [form]);

    const handleTitleChange`
);

// Remove preview button
content = content.replace(
    /<button\s+onClick=\{\(\) \=\> setPreviewMode\(\!previewMode\)\}[\s\S]*?<\/button>/,
    ""
);

// Update submit to remove draft
content = content.replace(
    /createMutation\.mutate\(form, \{\s*onSuccess: \(\) \=\> \{\s*router\.push\('\/admin\/cms\/blog'\);\s*\}\s*\}\);/,
    "createMutation.mutate(form, { onSuccess: () => { localStorage.removeItem('draft_blog_post'); router.push('/admin/cms/blog'); } });"
);

// Update HTML Textarea block
const textTbr = /<div className="space-y-2 pt-4">\s*<label.*?Nội dung bài viết \(HTML\).*?<\/label>\s*\{previewMode \? \([\s\S]*?\) : \([\s\S]*?\)\}\s*<\/div>/g;
content = content.replace(textTbr,
    `<div className="space-y-2 pt-4">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Nội dung bài viết <span className="text-rose-500">*</span></label>
                                <TiptapEditor 
                                    value={form.content}
                                    onChange={(val) => {
                                        // Auto excerpt
                                        let excerpt = form.excerpt;
                                        if (!excerpt || excerpt.length < 10) {
                                            const bodyText = val.replace(/<[^>]+>/g, ' ');
                                            excerpt = bodyText.substring(0, 160).trim();
                                            if (bodyText.length > 160) excerpt += '...';
                                        }
                                        setForm(prev => ({...prev, content: val, excerpt}));
                                    }}
                                />
                            </div>`
);

fs.writeFileSync(file1, content);
console.log('Patched new/page.tsx check');
