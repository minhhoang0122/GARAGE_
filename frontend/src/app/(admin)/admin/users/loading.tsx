
import { TableSkeleton } from '@/modules/shared/components/ui/table-skeleton';
import { DashboardLayout } from '@/modules/common/components/layout';

export default function Loading() {
    return (
        <DashboardLayout title="Quản lý người dùng" subtitle="Danh sách tài khoản hệ thống">
            <TableSkeleton />
        </DashboardLayout>
    );
}
