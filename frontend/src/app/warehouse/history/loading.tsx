
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Lịch sử kho" subtitle="Nhật ký nhập xuất tồn">
            <TableSkeleton />
        </DashboardLayout>
    );
}
