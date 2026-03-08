
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Chẩn đoán xe" subtitle="Tiếp nhận và lập báo giá sửa chữa">
            <TableSkeleton />
        </DashboardLayout>
    );
}
