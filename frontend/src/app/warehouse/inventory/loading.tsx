
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Tồn kho" subtitle="Quản lý danh mục hàng hóa">
            <TableSkeleton />
        </DashboardLayout>
    );
}
