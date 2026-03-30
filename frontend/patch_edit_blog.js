const fs = require('fs');

const file1 = 'src/app/(admin)/admin/cms/blog/[id]/page.tsx';
let content = fs.readFileSync(file1, 'utf8');

// Imports
content = content.replace(
    "import { useToast } from '@/contexts/ToastContext';",
    "import { useToast } from '@/contexts/ToastContext';\nimport dynamic from 'next/dynamic';\n\nconst TiptapEditor = dynamic(() => import('@/modules/common/components/TiptapEditor'), { ssr: false });"
);

// Preview state
content = content.replace(
    "const [previewMode, setPreviewMode] = useState(false);",
    "// Preview format removed. Tiptap is WYSIWYG."
);

// Remove preview button
content = content.replace(
    /<button\s+onClick=\{\(\) \=\> setPreviewMode\(\!previewMode\)\}[\s\S]*?<\/button>/,
    ""
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
console.log('Patched [id]/page.tsx check');
