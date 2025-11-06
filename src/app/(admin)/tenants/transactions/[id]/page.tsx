import { Suspense } from 'react';
import { TransactionDetailClient } from './TransactionDetailClient';

export const metadata = {
  title: 'Transaction Detail | Admin Dashboard',
  description: 'Detail transaksi tenant',
};

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30">
      <Suspense fallback={<DetailSkeleton />}>
        <TransactionDetailClient id={parseInt(id)} />
      </Suspense>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-10 bg-gray-200 rounded animate-pulse w-64"></div>
      <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  );
}
