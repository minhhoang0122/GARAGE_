import { DashboardLayout } from '@/modules/common/components/layout';
import { getJobDetails, getAvailableMechanics } from '@/modules/service/mechanic';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AssignBoard from './AssignBoard';
import { auth } from '@/lib/auth';
import ClaimJobButton from '../../jobs/[id]/ClaimJobButton';

export const dynamic = 'force-dynamic';

export default async function AssignBoardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) notFound();

    const [job, mechanics, session] = await Promise.all([
        getJobDetails(orderId),
        getAvailableMechanics(),
        auth(),
    ]);

    if (!job) notFound();

    const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;
    const isClaimedByMe = job.claimedById === currentUserId;
    const isJobActive = !['CHO_THAN_TOAN', 'HOAN_THANH', 'DONG', 'HUY'].includes(job.status || '');

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
