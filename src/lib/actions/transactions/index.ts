'use server';

import { createAdminClient } from '@/lib/supabase/server';

export async function getAllTransactions({
  page = 1,
  itemsPerPage = 10,
  searchQuery = '',
  selectedTenant = 'all',
  selectedType = 'all',
  dateFrom = '',
  dateTo = '',
}: {
  page: number;
  itemsPerPage: number;
  searchQuery?: string;
  selectedTenant?: string;
  selectedType?: 'all' | 'PEMASUKAN' | 'PENGELUARAN';
  dateFrom?: string;
  dateTo?: string;
}) {
  const supabase = await createAdminClient();

  // 1. Hitung rentang paginasi
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // 2. Mulai bangun query
  // Kita pakai 'let' karena query ini akan dimodifikasi
  let query = supabase
    .from('transactions')
    .select(
      `
      *,
      tenant:profiles!transactions_tenant_id_fkey(
        id,
        full_name,
        tenant_name,
        email
      )
    `,
      { count: 'exact' } // Selalu minta total count untuk paginasi
    );

  // 3. Tambahkan filter Wajib
  query = query.is('deleted_at', null);

  // 4. Tambahkan filter Dinamis berdasarkan parameter

  // Filter Tipe (Pemasukan / Pengeluaran)
  if (selectedType !== 'all') {
    query = query.eq('type', selectedType);
  }

  // Filter Tenant
  if (selectedTenant !== 'all') {
    query = query.eq('tenant_id', selectedTenant);
  }

  // Filter Tanggal (Dari)
  if (dateFrom) {
    // gte = Greater Than or Equal
    query = query.gte('transaction_date', dateFrom);
  }

  // Filter Tanggal (Sampai)
  if (dateTo) {
    // lte = Less Than or Equal
    query = query.lte('transaction_date', dateTo);
  }

  // Filter Pencarian (Search Query)
  // Ini memfilter di tabel 'profiles' yang ter-join
  if (searchQuery) {
    // ilike = case-insensitive search
    const searchPattern = `%${searchQuery}%`;
    query = query.or(
      `tenant_name.ilike.${searchPattern},` +
      `full_name.ilike.${searchPattern},` +
      `email.ilike.${searchPattern}`,
      { foreignTable: 'profiles' } // Beri tahu Supabase ini filter untuk tabel 'profiles'
    );
  }

  // 5. Tambahkan Pengurutan dan Paginasi di akhir
  query = query
    .order('transaction_date', { ascending: false })
    .range(from, to);

  // 6. Eksekusi query yang sudah lengkap
  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching transactions:', error);
    return { data: null, error: error.message, count: 0 };
  }

  return { data, error: null, count: count ?? 0 };
}

export async function getTransactionById(id: number) {
  const supabase = await createAdminClient();

  // Get transaction with tenant info
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .select(`
      *,
      tenant:profiles!transactions_tenant_id_fkey(
        id,
        full_name,
        tenant_name,
        email,
        phone
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (transactionError) {
    console.error('Error fetching transaction:', transactionError);
    return { data: null, error: transactionError.message };
  }

  // Get transaction items with product info
  const { data: items, error: itemsError } = await supabase
    .from('transaction_items')
    .select(`
      *,
      product:products(
        id,
        name,
        category,
        sku
      )
    `)
    .eq('transaction_id', id);

  if (itemsError) {
    console.error('Error fetching transaction items:', itemsError);
    return { data: null, error: itemsError.message };
  }

  return {
    data: {
      ...transaction,
      items,
    },
    error: null,
  };
}

export async function getTransactionsStats({
  searchQuery = '',
  selectedTenant = 'all',
  selectedType = 'all',
  dateFrom = '',
  dateTo = '',
}: {
  // Parameter filter yang sama, TAPI TANPA paginasi
  searchQuery?: string;
  selectedTenant?: string;
  selectedType?: 'all' | 'PEMASUKAN' | 'PENGELUARAN';
  dateFrom?: string;
  dateTo?: string;
}) {
  const supabase = await createAdminClient();

  // 1. Mulai bangun query (LOGIKA FILTER SAMA PERSIS dengan getAllTransactions)
  let query = supabase.from('transactions').select(
    `
    total_amount, 
    type, 
    tenant_id,
    tenant:profiles!transactions_tenant_id_fkey(tenant_name, full_name, email)
  `
    // Kita tidak perlu { count: 'exact' } di sini
  );

  // 2. Tambahkan filter Wajib
  query = query.is('deleted_at', null);

  // 3. Tambahkan filter Dinamis (KODE INI SAMA PERSIS)
  if (selectedType !== 'all') {
    query = query.eq('type', selectedType);
  }
  if (selectedTenant !== 'all') {
    query = query.eq('tenant_id', selectedTenant);
  }
  if (dateFrom) {
    query = query.gte('transaction_date', dateFrom);
  }
  if (dateTo) {
    query = query.lte('transaction_date', dateTo);
  }
  if (searchQuery) {
    const searchPattern = `%${searchQuery}%`;
    query = query.or(
      `tenant_name.ilike.${searchPattern},` +
        `full_name.ilike.${searchPattern},` +
        `email.ilike.${searchPattern}`,
      { foreignTable: 'profiles' }
    );
  }

  // 4. Eksekusi query TANPA .range()
  // Ini akan mengambil SEMUA data yang cocok dengan filter
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching stats:', error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      activeTenants: 0,
      totalTransactions: 0,
    };
  }

  // 5. Hitung stats di server
  let totalIncome = 0;
  let totalExpense = 0;
  const uniqueTenants = new Set<string>();

  for (const t of data) {
    uniqueTenants.add(t.tenant_id);
    if (t.type === 'PEMASUKAN') {
      totalIncome += t.total_amount;
    } else if (t.type === 'PENGELUARAN') {
      totalExpense += t.total_amount;
    }
  }

  // 6. Kembalikan hasil perhitungan
  return {
    totalIncome,
    totalExpense,
    activeTenants: uniqueTenants.size,
    totalTransactions: data.length, // Total data yang cocok filter
  };
}

export async function getTransactionsByTenant(tenantId: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      tenant:profiles!transactions_tenant_id_fkey(
        id,
        full_name,
        tenant_name,
        email
      )
    `)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('transaction_date', { ascending: false });

  if (error) {
    console.error('Error fetching tenant transactions:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getTenantsList() {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, tenant_name, email')
    .eq('role', 'tenant')
    .is('deleted_at', null)
    .order('tenant_name');

  if (error) {
    console.error('Error fetching tenants:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
