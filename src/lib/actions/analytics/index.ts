'use server';

import { createAdminClient } from '@/lib/supabase/server';

export interface AnalyticsOverview {
  totalRevenue: number;
  totalTransactions: number;
  totalTenants: number;
  activeTenants: number;
  revenueGrowth: number;
  transactionGrowth: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  transactions: number;
}

export interface TopTenant {
  id: string;
  tenant_name: string;
  full_name: string;
  total_revenue: number;
  transaction_count: number;
}

export interface TransactionTypeDistribution {
  type: string;
  count: number;
  total_amount: number;
}

export interface ProductPerformance {
  product_id: string;
  product_name: string;
  category: string;
  total_sold: number;
  total_revenue: number;
  tenant_name: string;
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const supabase = await createAdminClient();
  
  // Get current month data
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

  // Total revenue
  const { data: transactions } = await supabase
    .from('transactions')
    .select('total_amount, type, transaction_date')
    .is('deleted_at', null);

  const totalRevenue = transactions?.reduce((sum, t) => {
    return t.type === 'PEMASUKAN' ? sum + t.total_amount : sum - t.total_amount;
  }, 0) || 0;

  // Current month revenue
  const currentMonthRevenue = transactions?.filter(t => t.transaction_date >= currentMonthStart.split('T')[0])
    .reduce((sum, t) => t.type === 'PEMASUKAN' ? sum + t.total_amount : sum - t.total_amount, 0) || 0;

  // Last month revenue
  const lastMonthRevenue = transactions?.filter(t => 
    t.transaction_date >= lastMonthStart.split('T')[0] && t.transaction_date <= lastMonthEnd.split('T')[0]
  ).reduce((sum, t) => t.type === 'PEMASUKAN' ? sum + t.total_amount : sum - t.total_amount, 0) || 0;

  const revenueGrowth = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  // Total transactions
  const totalTransactions = transactions?.length || 0;
  const currentMonthTransactions = transactions?.filter(t => t.transaction_date >= currentMonthStart.split('T')[0]).length || 0;
  const lastMonthTransactions = transactions?.filter(t => 
    t.transaction_date >= lastMonthStart.split('T')[0] && t.transaction_date <= lastMonthEnd.split('T')[0]
  ).length || 0;

  const transactionGrowth = lastMonthTransactions > 0
    ? ((currentMonthTransactions - lastMonthTransactions) / lastMonthTransactions) * 100
    : 0;

  // Total tenants
  const { data: tenants } = await supabase
    .from('profiles')
    .select('id, created_at')
    .eq('role', 'tenant')
    .is('deleted_at', null);

  const totalTenants = tenants?.length || 0;

  // Active tenants (who have transactions this month)
  const { data: activeTenantsData } = await supabase
    .from('transactions')
    .select('tenant_id')
    .gte('transaction_date', currentMonthStart.split('T')[0])
    .is('deleted_at', null);

  const activeTenants = new Set(activeTenantsData?.map(t => t.tenant_id)).size;

  return {
    totalRevenue,
    totalTransactions,
    totalTenants,
    activeTenants,
    revenueGrowth,
    transactionGrowth,
  };
}

export async function getRevenueByMonth(): Promise<RevenueByMonth[]> {
  const supabase = await createAdminClient();
  
  // Get last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
    });
  }

  const { data: transactions } = await supabase
    .from('transactions')
    .select('total_amount, type, transaction_date')
    .is('deleted_at', null);

  const result = days.map(day => {
    const dayTransactions = transactions?.filter(t => t.transaction_date === day.date) || [];

    const revenue = dayTransactions.reduce((sum, t) => {
      return t.type === 'PEMASUKAN' ? sum + t.total_amount : sum - t.total_amount;
    }, 0);

    return {
      month: day.label, // Keep the property name for compatibility
      revenue,
      transactions: dayTransactions.length,
    };
  });

  return result;
}

export async function getTopTenants(limit = 10): Promise<TopTenant[]> {
  const supabase = await createAdminClient();

  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      tenant_id,
      total_amount,
      type,
      profiles!transactions_tenant_id_fkey (
        tenant_name,
        full_name
      )
    `)
    .is('deleted_at', null);

  // Group by tenant
  const tenantMap = new Map<string, { 
    tenant_name: string;
    full_name: string;
    total_revenue: number;
    transaction_count: number;
  }>();

  transactions?.forEach(t => {
    const profile = t.profiles as any;
    const existingData = tenantMap.get(t.tenant_id) || {
      tenant_name: profile?.tenant_name || '',
      full_name: profile?.full_name || '',
      total_revenue: 0,
      transaction_count: 0,
    };

    existingData.total_revenue += t.type === 'PEMASUKAN' ? t.total_amount : -t.total_amount;
    existingData.transaction_count += 1;
    tenantMap.set(t.tenant_id, existingData);
  });

  // Convert to array and sort
  const topTenants = Array.from(tenantMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, limit);

  return topTenants;
}

export async function getTransactionTypeDistribution(): Promise<TransactionTypeDistribution[]> {
  const supabase = await createAdminClient();

  const { data: transactions } = await supabase
    .from('transactions')
    .select('type, total_amount')
    .is('deleted_at', null);

  const distribution = transactions?.reduce((acc, t) => {
    const existing = acc.find(d => d.type === t.type);
    if (existing) {
      existing.count += 1;
      existing.total_amount += t.total_amount;
    } else {
      acc.push({
        type: t.type,
        count: 1,
        total_amount: t.total_amount,
      });
    }
    return acc;
  }, [] as TransactionTypeDistribution[]);

  return distribution || [];
}

export async function getProductPerformance(limit = 10): Promise<ProductPerformance[]> {
  const supabase = await createAdminClient();

  const { data: items, error } = await supabase
    .from('transaction_items')
    .select(`
      product_id,
      product_name,
      quantity,
      unit_price,
      subtotal
    `);

  if (error) {
    console.error('Error fetching transaction items:', error);
    return [];
  }

  if (!items || items.length === 0) {
    return [];
  }

  // Group by product_id
  const productMap = new Map<string, {
    product_name: string;
    category: string;
    tenant_name: string;
    total_sold: number;
    total_revenue: number;
  }>();

  // First, collect unique product_ids
  const productIds = [...new Set(items.map(item => item.product_id).filter(Boolean))];

  // Fetch product details
  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      name,
      category,
      tenant_id,
      profiles!products_tenant_id_fkey (
        tenant_name
      )
    `)
    .in('id', productIds);

  // Create product lookup map
  const productLookup = new Map();
  products?.forEach(p => {
    const profile = p.profiles as any;
    productLookup.set(p.id, {
      name: p.name,
      category: p.category || 'Uncategorized',
      tenant_name: profile?.tenant_name || 'Unknown',
    });
  });

  // Process transaction items
  items.forEach(item => {
    if (!item.product_id) return;

    const productInfo = productLookup.get(item.product_id);
    const key = item.product_id.toString();
    
    const existingData = productMap.get(key) || {
      product_name: productInfo?.name || item.product_name || 'Unknown Product',
      category: productInfo?.category || 'Uncategorized',
      tenant_name: productInfo?.tenant_name || 'Unknown',
      total_sold: 0,
      total_revenue: 0,
    };

    existingData.total_sold += item.quantity;
    existingData.total_revenue += item.subtotal;
    productMap.set(key, existingData);
  });

  // Convert to array and sort by revenue
  const topProducts = Array.from(productMap.entries())
    .map(([product_id, data]) => ({ product_id, ...data }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, limit);

  return topProducts;
}
