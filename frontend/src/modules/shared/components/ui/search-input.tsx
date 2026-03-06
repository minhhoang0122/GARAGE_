'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/modules/shared/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    delay?: number;
}

export function SearchInput({
    className,
    delay = 300,
    placeholder = 'Tìm kiếm...',
    ...props
}: SearchInputProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Local state for immediate input feedback
    const [value, setValue] = React.useState(searchParams.get('q') || '');

    // Sync local state with URL param on mount/update (in case URL changes externally)
    React.useEffect(() => {
        setValue(searchParams.get('q') || '');
    }, [searchParams]);

    // Update URL logic
    const updateUrl = React.useCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, router]);

    // Handle typing with debounce
    React.useEffect(() => {
        const timer = setTimeout(() => {
            // Only update if the value in URL is different from current value
            // (prevents redundant updates/history entries)
            const currentQ = searchParams.get('q') || '';
            if (value !== currentQ) {
                updateUrl(value);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay, updateUrl, searchParams]);

    // Handle immediate Enter key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            updateUrl(value);
        }
        if (props.onKeyDown) {
            props.onKeyDown(e);
        }
    };

    return (
        <div className={cn("relative w-full max-w-md", className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
            <Input
                {...props}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="pl-9"
            />
        </div>
    );
}
