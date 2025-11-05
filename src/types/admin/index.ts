// Admin-specific types
export interface TenantWithStats {
  id: string
  full_name: string
  tenant_name: string
  npm: string
  business_category: string
  total_transactions: number
  total_revenue: number
}

export interface DashboardStats {
  totalTenants: number
  totalRevenue: number
  totalTransactions: number
  activeToday: number
}
