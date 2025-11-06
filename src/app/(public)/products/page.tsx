import { Suspense } from 'react';
import { ProductsPageClient } from './ProductsPageClient';

export const metadata = {
  title: 'Produk | Growpath Tenant',
  description: 'Kelola produk Anda',
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ProductsPageClient />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
}
