import { Suspense } from 'react';
import { AnalyticsClient } from '@/app/(admin)/analytics/AnalyticsClient';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview performa bisnis dan tenant</p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <AnalyticsClient />
        </Suspense>
      </div>
    </div>
  );
}
