
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Đơn hàng" subtitle="Quản lý danh sách đơn hàng">
            <TableSkeleton />
        </DashboardLayout>
    );
}
