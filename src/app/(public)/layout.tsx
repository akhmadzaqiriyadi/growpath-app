import { TenantMobileLayout } from '@/components/tenant/layout/TenantMobileLayout';
import { Toaster } from '@/components/ui/sonner';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TenantMobileLayout>{children} <Toaster/> </TenantMobileLayout>
}