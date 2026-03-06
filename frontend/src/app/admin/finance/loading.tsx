
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Tài chính" subtitle="Quản lý thu chi và dòng tiền">
            <TableSkeleton />
        </DashboardLayout>
    );
}
