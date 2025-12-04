import { Suspense } from 'react';
import QRGeneratorClient from './QRGeneratorClient';

export default function AdminQRGeneratorPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    }>
      <QRGeneratorClient />
    </Suspense>
  );
}
