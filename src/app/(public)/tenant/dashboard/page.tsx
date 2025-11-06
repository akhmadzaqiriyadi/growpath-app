import { Suspense } from 'react';
import { TenantDashboardClient } from './TenantDashboardClient';

export const metadata = {
  title: 'Dashboard | Growpath Tenant',
  description: 'Dashboard cashflow untuk tenant',
};

export default function TenantDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <TenantDashboardClient />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  );
}
