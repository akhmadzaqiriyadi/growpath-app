// Business categories
export const BUSINESS_CATEGORIES = [
  'Kuliner',
  'Fashion',
  'Kerajinan',
  'Jasa',
  'Industri',
  'Bisnis Digital',
  'Other',
] as const

export type BusinessCategory = typeof BUSINESS_CATEGORIES[number]

// Transaction types
export const TRANSACTION_TYPES = {
  INCOME: 'PEMASUKAN',
  EXPENSE: 'PENGELUARAN',
} as const

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TENANT: 'tenant',
} as const

// Currency formatter
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Date formatter
export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}
