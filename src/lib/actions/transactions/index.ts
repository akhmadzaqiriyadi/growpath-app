'use server';

import { createAdminClient } from '@/lib/supabase/server';

// ... getAllTransactions ...
export async function getAllTransactions({
  page = 1,
  itemsPerPage = 10,
  searchTenantQuery = '',
  searchNoteQuery = '',
  selectedTenant = 'all',
  selectedType = 'all',
  dateFrom = '',
  dateTo = '',
}: {
  page: number;
  itemsPerPage: number;
  searchTenantQuery?: string;
  searchNoteQuery?: string;
  selectedTenant?: string;
  selectedType?: 'all' | 'PEMASUKAN' | 'PENGELUARAN';
  dateFrom?: string;
  dateTo?: string;
}) {
  const supabase = await createAdminClient();

  // Memanggil fungsi database 'get_all_transactions_filtered'
  const { data, error } = await supabase.rpc('get_all_transactions_filtered', {
    p_page: page,
    p_items_per_page: itemsPerPage,
    p_search_tenant_query: searchTenantQuery || null,
    p_search_note_query: searchNoteQuery || null,
    p_selected_tenant: selectedTenant,
    p_selected_type: selectedType,
    p_date_from: dateFrom || null,
    p_date_to: dateTo || null,
  });

  if (error) {
    console.error('Error fetching transactions RPC:', error);
    return { data: null, error: error.message, count: 0 };
  }

  // data dari RPC adalah JSON tunggal yang berisi 'data' dan 'count'
  return {
    data: data.data,
    error: data.error,
    count: data.count ?? 0,
  };
}

// ... getTransactionById ...
// (Tidak berubah, masih sama seperti kode asli Anda)
export async function getTransactionById(id: number) {
  const supabase = await createAdminClient();

  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .select(
      `
      *,
      tenant:profiles!transactions_tenant_id_fkey(
        id,
        full_name,
        tenant_name,
        email,
        phone
      )
    `
    )
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (transactionError) {
    console.error('Error fetching transaction:', transactionError);
    return { data: null, error: transactionError.message };
  }

  if (!transaction) {
    console.error('Transaction not found with id:', id);
    return { data: null, error: 'Transaction not found' };
  }

  const { data: items, error: itemsError } = await supabase
    .from('transaction_items')
    .select(
      `
      *,
      product:products(
        id,
        name,
        category,
        sku
      )
    `
    )
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

// ... getTransactionsStats ...
export async function getTransactionsStats({
  searchTenantQuery = '',
  searchNoteQuery = '',
  selectedTenant = 'all',
  selectedType = 'all',
  dateFrom = '',
  dateTo = '',
}: {
  searchTenantQuery?: string;
  searchNoteQuery?: string;
  selectedTenant?: string;
  selectedType?: 'all' | 'PEMASUKAN' | 'PENGELUARAN';
  dateFrom?: string;
  dateTo?: string;
}) {
  const supabase = await createAdminClient();

  // Memanggil fungsi database 'get_transactions_stats_filtered'
  const { data, error } = await supabase.rpc(
    'get_transactions_stats_filtered',
    {
      p_search_tenant_query: searchTenantQuery || null,
      p_search_note_query: searchNoteQuery || null,
      p_selected_tenant: selectedTenant,
      p_selected_type: selectedType,
      p_date_from: dateFrom || null,
      p_date_to: dateTo || null,
    }
  );

  if (error) {
    console.error('Error fetching stats RPC:', error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      activeTenants: 0,
      totalTransactions: 0,
    };
  }

  // 'data' sudah berisi objek JSON dengan format yang kita inginkan
  return data;
}

// ... getTransactionsByTenant ...
// (Tidak berubah, masih sama seperti kode asli Anda)
export async function getTransactionsByTenant(tenantId: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
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
    `
    )
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('transaction_date', { ascending: false });

  if (error) {
    console.error('Error fetching tenant transactions:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// ... getTenantsList ...
// (Tidak berubah, masih sama seperti kode asli Anda)
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