import type { Database, Tables, TablesInsert } from '@/types/database.types'

// Tipe untuk form tambah/edit produk
// DIPERBAIKI: Sekarang 'TablesInsert' sudah di-import
export type ProductFormData = Pick<
  TablesInsert<'products'>,
  'name' | 'description' | 'price' | 'stock' | 'category' | 'sku'
>

// Tipe untuk form transaksi baru
export interface TransactionFormData {
  type: TablesInsert<'transactions'>['type'] // 'PEMASUKAN' | 'PENGELUARAN'
  items: TransactionItemFormData[]
  note?: string | null
  receipt_url?: string | null
  transaction_date: string
}

export interface TransactionItemFormData {
  product_id: TablesInsert<'transaction_items'>['product_id']
  quantity: TablesInsert<'transaction_items'>['quantity']
  // price dan name akan diambil dari product_id saat submit
}

// Tipe untuk menampilkan produk di list, gabungan dari DB dan data UI
export type ProductWithUiState = Tables<'products'> & {
  // bisa ditambahkan properti spesifik UI di sini
  // contoh: isBeingEdited?: boolean
}