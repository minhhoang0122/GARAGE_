
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Quản lý dịch vụ" subtitle="Danh sách dịch vụ và gói sửa chữa">
            <TableSkeleton />
        </DashboardLayout>
    );
}
