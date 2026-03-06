
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Thanh toán" subtitle="Xử lý thanh toán đơn hàng">
            <TableSkeleton />
        </DashboardLayout>
    );
}
