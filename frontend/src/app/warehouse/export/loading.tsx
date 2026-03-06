
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Xuất kho" subtitle="Quản lý phiếu xuất kho">
            <TableSkeleton />
        </DashboardLayout>
    );
}
