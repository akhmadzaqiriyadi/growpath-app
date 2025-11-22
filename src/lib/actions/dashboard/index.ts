'use server';

// Pastikan path import ini sesuai dengan lokasi file helper supabase Anda
import { createAdminClient } from '@/lib/supabase/server'; 

export async function getRecentActivity(limit: number = 5) {
  const supabase = await createAdminClient();

  // Memanggil fungsi database yang sudah kita buat tadi
  const { data, error } = await supabase.rpc('get_recent_activity', {
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching recent activity:', error);
    // Mengembalikan array kosong agar frontend tidak error/crash
    return { data: [], error: error.message }; 
  }

  return { data, error: null };
}

export async function getDashboardSummary() {
  const supabase = await createAdminClient();

  // 1. Get total revenue, income, expense from transactions
  const { data: transactionsData, error: transactionsError } = await supabase
    .from('transactions')
    .select('type, total_amount')
    .is('deleted_at', null);

  if (transactionsError) {
    console.error('Error fetching transactions summary:', transactionsError);
    return { error: transactionsError.message };
  }

  let totalIncome = 0;
  let totalExpense = 0;
  let totalTransactions = transactionsData.length;

  transactionsData.forEach((t) => {
    if (t.type === 'PEMASUKAN') {
      totalIncome += t.total_amount;
    } else {
      totalExpense += t.total_amount;
    }
  });

  const netRevenue = totalIncome - totalExpense;

  // 2. Get active tenants count
  const { count: activeTenantsCount, error: tenantsError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'tenant')
    .is('deleted_at', null);

  if (tenantsError) {
    console.error('Error fetching tenants count:', tenantsError);
  }

  // 3. Get total visitors count
  const { count: visitorsCount, error: visitorsError } = await supabase
    .from('visitors')
    .select('*', { count: 'exact', head: true });

  if (visitorsError) {
    console.error('Error fetching visitors count:', visitorsError);
  }

  return {
    data: {
      totalIncome,
      totalExpense,
      netRevenue,
      totalTransactions,
      activeTenants: activeTenantsCount || 0,
      totalVisitors: visitorsCount || 0,
    },
    error: null,
  };
}

export async function getRevenueChartData() {
  const supabase = await createAdminClient();

  // Fetch from daily_transaction_summary view
  // Limit to last 30 days for example
  const { data, error } = await supabase
    .from('daily_transaction_summary')
    .select('*')
    .order('transaction_date', { ascending: true })
    .limit(30);

  if (error) {
    console.error('Error fetching revenue chart data:', error);
    return { data: [], error: error.message };
  }

  return { data, error: null };
}

export async function getTopTenants(limit: number = 5) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('tenant_revenue_summary')
    .select('*')
    .order('net_revenue', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top tenants:', error);
    return { data: [], error: error.message };
  }

  return { data, error: null };
}

export async function getCategoryDistribution() {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('business_category')
    .eq('role', 'tenant')
    .is('deleted_at', null);

  if (error) {
    console.error('Error fetching category distribution:', error);
    return { data: [], error: error.message };
  }

  const distribution: Record<string, number> = {};
  data.forEach((item) => {
    const category = item.business_category || 'Uncategorized';
    distribution[category] = (distribution[category] || 0) + 1;
  });

  const formattedData = Object.entries(distribution).map(([name, value]) => ({
    name,
    value,
  }));

  return { data: formattedData, error: null };
}