'use client';

import { DashboardLayout } from '@/modules/common/components/layout';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AssignBoard from './AssignBoard';
import ClaimJobButton from '../../jobs/[id]/ClaimJobButton';
import { useSession } from 'next-auth/react';
import { useJobDetails, useAvailableMechanics } from '@/modules/mechanic/hooks/useMechanic';
import { use } from 'react';

export default function AssignBoardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const orderId = parseInt(id, 10);
    const { data: session } = useSession();

    const { data: job, isLoading: jobLoading, isError: jobError } = useJobDetails(orderId);
    const { data: mechanics = [], isLoading: mechLoading } = useAvailableMechanics();

    if (isNaN(orderId)) notFound();
    if (jobLoading || mechLoading) {
        return (
            <DashboardLayout title="Đang tải..." subtitle="Vui lòng đợi">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </DashboardLayout>
        );
    }

    if (jobError || !job) notFound();

    const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;
    const isClaimedByMe = job.claimedById === currentUserId;
    const isJobActive = !['CHO_THANH_TOAN', 'HOAN_THANH', 'DONG', 'HUY'].includes(job.status || '');

    return (
        <DashboardLayout 
            title={`Phân công: ${job.plate}`} 
            subtitle={`${job.vehicleBrand} ${job.vehicleModel} - ${job.customerName}`}
        >
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/mechanic/assign" 
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-semibold text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> QUAY LẠI DANH SÁCH ĐIỀU PHỐI
                    </Link>
                </div>
                
                {isJobActive && (
                    <ClaimJobButton
                        orderId={job.id}
                        claimedByName={job.claimedByName}
                        isClaimedByMe={isClaimedByMe}
                    />
                )}
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <AssignBoard initialJob={job} mechanics={mechanics} />
            </div>
        </DashboardLayout>
    );
}
