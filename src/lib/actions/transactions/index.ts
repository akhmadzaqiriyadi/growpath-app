'use server';

import { createAdminClient } from '@/lib/supabase/server';

export async function getAllTransactions() {
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
    .is('deleted_at', null)
    .order('transaction_date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
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
