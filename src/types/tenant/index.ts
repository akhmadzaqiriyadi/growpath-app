// Tenant-specific types
export interface ProductFormData {
  name: string
  description?: string
  price: number
  stock: number
  category?: string
}

export interface TransactionFormData {
  type: 'PEMASUKAN' | 'PENGELUARAN'
  items: TransactionItemFormData[]
  note?: string
}

export interface TransactionItemFormData {
  product_id: number
  quantity: number
}
