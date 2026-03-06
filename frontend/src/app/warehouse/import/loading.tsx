
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Nhập kho" subtitle="Quản lý phiếu nhập kho">
            <TableSkeleton />
        </DashboardLayout>
    );
}
