
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Danh sách công việc" subtitle="Các xe đang chờ sửa chữa">
            <TableSkeleton />
        </DashboardLayout>
    );
}
