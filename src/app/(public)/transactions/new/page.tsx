import { Suspense } from 'react';
import { NewTransactionClient } from './NewTransactionClient';

export const metadata = {
  title: 'Catat Transaksi | Growpath Tenant',
  description: 'Catat transaksi penjualan atau pengeluaran',
};

export default function NewTransactionPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <NewTransactionClient />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-3">
      <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  );
}
