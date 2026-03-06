
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Khách hàng" subtitle="Quản lý thông tin khách hàng">
            <TableSkeleton />
        </DashboardLayout>
    );
}
