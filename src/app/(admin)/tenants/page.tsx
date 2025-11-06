import { Suspense } from 'react';
import { TenantsPageClient } from './TenantsPageClient';

export const metadata = {
  title: 'Manajemen Tenant | UTY Growpath',
  description: 'Kelola akun tenant untuk aplikasi cashflow',
};

export default function TenantsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Tenant</h1>
          <p className="text-gray-600 mt-1">
            Kelola akun tenant untuk pencatatan cashflow
          </p>
        </div>

        <Suspense fallback={<LoadingState />}>
          <TenantsPageClient />
        </Suspense>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-white rounded-lg border p-12 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-gray-600 mt-4">Memuat data tenant...</p>
    </div>
  );
}
