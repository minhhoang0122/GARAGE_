
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Lịch sử công việc" subtitle="Các xe đã hoàn thành sửa chữa">
            <TableSkeleton />
        </DashboardLayout>
    );
}
