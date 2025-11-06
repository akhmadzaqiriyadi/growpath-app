import { TenantMobileLayout } from '@/components/tenant/layout/TenantMobileLayout';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TenantMobileLayout>{children}</TenantMobileLayout>
}