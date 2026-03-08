
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Nhật ký hệ thống" subtitle="Theo dõi hoạt động người dùng">
            <TableSkeleton />
        </DashboardLayout>
    );
}
