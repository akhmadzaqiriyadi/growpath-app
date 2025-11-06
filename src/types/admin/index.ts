import type { Database, Tables, TablesInsert } from '@/types/database.types'

// Tipe ini sekarang 100% cocok dengan VIEW `tenant_revenue_summary`
// DIPERBAIKI: Kita gunakan 'Tables' untuk mengakses Tables DAN Views
export type TenantWithStats = Tables<'tenant_revenue_summary'>

// Tipe ini masih relevan untuk data kalkulasi di dashboard
export interface DashboardStats {
  totalTenants: number
  totalRevenue: number
  totalTransactions: number
  activeToday: number
}

// Tipe untuk form saat Admin membuat tenant baru
// DIPERBAIKI: Sekarang 'TablesInsert' sudah di-import
export type NewTenantFormData = Pick<
  TablesInsert<'profiles'>,
  | 'full_name'
  | 'email'
  | 'phone'
  | 'npm'
  | 'prodi'
  | 'tenant_name'
  | 'business_category'
> & {
  // Kita tambahkan field password di sini, meskipun tidak disimpan di tabel `profiles`
  // Ini akan digunakan untuk `supabase.auth.admin.createUser()`
  password: string
}