
import { Skeleton } from "@/modules/shared/components/ui/skeleton";
import { Card, CardContent } from '@/modules/shared/components/ui/card';

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <Skeleton className="h-10 w-64 mb-2 bg-slate-200 dark:bg-slate-700" />
                    <Skeleton className="h-5 w-48 bg-slate-200 dark:bg-slate-700" />
                </header>

                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-slate-700" />
                                            <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-700" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Skeleton className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
                                        <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-slate-700" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
