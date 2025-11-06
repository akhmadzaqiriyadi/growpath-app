'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Users, 
  UserCheck,
  Package,
  BarChart3,
} from 'lucide-react';
import {
  getAnalyticsOverview,
  getRevenueByMonth,
  getTopTenants,
  getTransactionTypeDistribution,
  getProductPerformance,
  type AnalyticsOverview,
  type RevenueByMonth,
  type TopTenant,
  type TransactionTypeDistribution,
  type ProductPerformance,
} from '@/lib/actions/analytics';

export function AnalyticsClient() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [revenueByMonth, setRevenueByMonth] = useState<RevenueByMonth[]>([]);
  const [topTenants, setTopTenants] = useState<TopTenant[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<TransactionTypeDistribution[]>([]);
  const [topProducts, setTopProducts] = useState<ProductPerformance[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewData, revenueData, tenantsData, typesData, productsData] = await Promise.all([
        getAnalyticsOverview(),
        getRevenueByMonth(),
        getTopTenants(10),
        getTransactionTypeDistribution(),
        getProductPerformance(10),
      ]);

      setOverview(overviewData);
      setRevenueByMonth(revenueData);
      setTopTenants(tenantsData);
      setTransactionTypes(typesData);
      setTopProducts(productsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!overview) return null;

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...revenueByMonth.map(m => m.revenue));

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            {overview.revenueGrowth !== 0 && (
              <span className={`flex items-center text-xs font-medium ${
                overview.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {overview.revenueGrowth > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                {Math.abs(overview.revenueGrowth).toFixed(1)}%
              </span>
            )}
          </div>
          <h3 className="text-xs text-gray-600 mb-1">Total Revenue</h3>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(overview.totalRevenue)}</p>
        </div>

        {/* Total Transactions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            {overview.transactionGrowth !== 0 && (
              <span className={`flex items-center text-xs font-medium ${
                overview.transactionGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {overview.transactionGrowth > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                {Math.abs(overview.transactionGrowth).toFixed(1)}%
              </span>
            )}
          </div>
          <h3 className="text-xs text-gray-600 mb-1">Total Transaksi</h3>
          <p className="text-lg font-bold text-gray-900">{formatNumber(overview.totalTransactions)}</p>
        </div>

        {/* Total Tenants */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <h3 className="text-xs text-gray-600 mb-1">Total Tenant</h3>
          <p className="text-lg font-bold text-gray-900">{formatNumber(overview.totalTenants)}</p>
        </div>

        {/* Active Tenants */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <h3 className="text-xs text-gray-600 mb-1">Tenant Aktif (Bulan Ini)</h3>
          <p className="text-lg font-bold text-gray-900">{formatNumber(overview.activeTenants)}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend (7 Hari Terakhir)</h3>
        <div className="space-y-4">
          {revenueByMonth.map((month, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">{month.month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">{month.transactions} transaksi</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(month.revenue)}</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-500"
                  style={{ width: `${maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Type Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Distribusi Tipe Transaksi
          </h3>
          <div className="space-y-4">
            {transactionTypes.map((type, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${
                    type.type === 'PEMASUKAN' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {type.type}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(type.total_amount)}</p>
                    <p className="text-xs text-gray-500">{type.count} transaksi</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-full rounded-full ${
                      type.type === 'PEMASUKAN' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${transactionTypes.length > 0 
                        ? (type.total_amount / Math.max(...transactionTypes.map(t => t.total_amount))) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tenants */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Top 10 Tenant
          </h3>
          <div className="space-y-3">
            {topTenants.map((tenant, index) => (
              <div key={tenant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tenant.tenant_name}</p>
                    <p className="text-xs text-gray-500">{tenant.full_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(tenant.total_revenue)}</p>
                  <p className="text-xs text-gray-500">{tenant.transaction_count} transaksi</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Top 10 Produk Terlaris
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produk</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kategori</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tenant</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Terjual</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.product_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-600">{product.tenant_name}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="text-sm font-medium text-gray-900">{formatNumber(product.total_sold)} unit</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.total_revenue)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
