
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Tiếp nhận xe" subtitle="Tạo phiếu tiếp nhận mới">
            <TableSkeleton />
        </DashboardLayout>
    );
}
