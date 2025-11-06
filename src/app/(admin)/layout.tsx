import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/layout/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Jika user ada tapi tidak punya profile / bukan admin
  if (!profile || profile.role !== 'admin') {
    // Kita redirect ke tenant. Jika dia tenant, dia akan lolos di layout tenant.
    // Jika dia bukan apa-apa, dia akan mental lagi dari sana.
    redirect('/tenant/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      {/* Kita tambahkan padding kiri seukuran sidebar (w-64) 
        hanya di layar 'md' ke atas 
      */}
      <main className="md:pl-64">
        {/* Nanti di sini bisa ditambah Header/Navbar */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}