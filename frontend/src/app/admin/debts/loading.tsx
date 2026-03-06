
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Công nợ" subtitle="Quản lý công nợ khách hàng">
            <TableSkeleton />
        </DashboardLayout>
    );
}
