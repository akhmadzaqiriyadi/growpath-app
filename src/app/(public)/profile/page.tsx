import { Suspense } from 'react';
import { ProfilePageClient } from './ProfilePageClient';

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="p-4 space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    }>
      <ProfilePageClient />
    </Suspense>
  );
}
