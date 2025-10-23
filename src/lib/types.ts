// src/lib/types.ts

// 1. Impor "kamus mentah" dari file yang di-generate Supabase
import { Database } from "@/types/database.types"; // Pastikan path ini benar

// 2. Buat alias untuk tipe dasar agar lebih mudah digunakan
export type TransactionRow = Database['public']['Tables']['transactions']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

// 3. Buat dan ekspor tipe "racikan" kita sendiri

// Tipe untuk dropdown filter tenant. Kita hanya butuh `id` dan `tenant_name`.
// `Pick` adalah utilitas TypeScript untuk "memetik" properti tertentu dari tipe lain.
export type ProfileForFilter = Pick<ProfileRow, 'id' | 'tenant_name'>;

// Tipe gabungan yang AKURAT untuk query kita yang menggunakan JOIN.
// Ini adalah tipe TransactionRow DITAMBAH (`&`) objek profiles di dalamnya.
export type TransactionWithProfile = TransactionRow & {
  profiles: Pick<ProfileRow, 'tenant_name'> | null;
};