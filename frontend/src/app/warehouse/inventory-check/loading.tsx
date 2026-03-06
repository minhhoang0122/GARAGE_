
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Kiểm kê kho" subtitle="Đối chiếu số lượng thực tế">
            <TableSkeleton />
        </DashboardLayout>
    );
}
