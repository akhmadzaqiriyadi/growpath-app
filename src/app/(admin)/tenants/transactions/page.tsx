import { Suspense } from 'react';
import { AdminTransactionsClient } from './AdminTransactionsClient';

export const metadata = {
  title: 'Transactions | Admin Dashboard',
  description: 'Kelola semua transaksi dari tenant',
};

export default function AdminTransactionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30">
      <Suspense fallback={<TransactionsSkeleton />}>
        <AdminTransactionsClient />
      </Suspense>
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-10 bg-gray-200 rounded animate-pulse w-64"></div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  );
}
