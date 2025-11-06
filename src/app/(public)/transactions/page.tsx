import { Suspense } from 'react';
import { TransactionsPageClient } from './TransactionsPageClient';

export const metadata = {
  title: 'Transaksi | Growpath Tenant',
  description: 'History transaksi Anda',
};

export default function TransactionsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TransactionsPageClient />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
}
