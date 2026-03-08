
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Báo giá" subtitle="Danh sách báo giá chờ duyệt">
            <TableSkeleton />
        </DashboardLayout>
    );
}
