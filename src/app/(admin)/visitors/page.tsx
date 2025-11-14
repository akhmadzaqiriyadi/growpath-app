// src/app/(admin)/visitors/page.tsx
import { Suspense } from 'react';
import { VisitorsClient } from './VisitorsClient';
import { Loader2, QrCode } from 'lucide-react';

export const metadata = {
  title: 'Visitor Analytics | Admin Dashboard',
  description: 'Overview statistik pengunjung yang melakukan scan QR code',
};

export default function VisitorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Visitor Analytics</h1>
          <p className="text-gray-600 mt-1">
            Statistik pengunjung yang melakukan scan QR code
          </p>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <VisitorsClient />
        </Suspense>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
      </div>
      <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
    </div>
  );
}