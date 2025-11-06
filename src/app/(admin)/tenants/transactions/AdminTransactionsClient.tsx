'use client';

import { useEffect, useState } from 'react';
import { getAllTransactions, getTenantsList } from '@/lib/actions/transactions';
import { Database } from '@/types/database.types';
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  tenant: {
    id: string;
    full_name: string;
    tenant_name: string | null;
    email: string;
  };
};

type Tenant = {
  id: string;
  full_name: string;
  tenant_name: string | null;
  email: string;
};

export function AdminTransactionsClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'PEMASUKAN' | 'PENGELUARAN'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalIncome: 0,
    totalExpense: 0,
    activeTenants: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, selectedTenant, selectedType, dateFrom, dateTo]);

  const loadData = async () => {
    setLoading(true);

    const [transactionsResult, tenantsResult] = await Promise.all([
      getAllTransactions(),
      getTenantsList(),
    ]);

    if (transactionsResult.data) {
      setTransactions(transactionsResult.data as Transaction[]);
      
      // Calculate stats
      const totalIncome = transactionsResult.data
        .filter((t: any) => t.type === 'PEMASUKAN')
        .reduce((sum: number, t: any) => sum + t.total_amount, 0);
      
      const totalExpense = transactionsResult.data
        .filter((t: any) => t.type === 'PENGELUARAN')
        .reduce((sum: number, t: any) => sum + t.total_amount, 0);

      const uniqueTenants = new Set(transactionsResult.data.map((t: any) => t.tenant_id));

      setStats({
        totalTransactions: transactionsResult.data.length,
        totalIncome,
        totalExpense,
        activeTenants: uniqueTenants.size,
      });
    }

    if (tenantsResult.data) {
      setTenants(tenantsResult.data);
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search by tenant name or email
    if (searchQuery) {
      filtered = filtered.filter(
        t =>
          t.tenant.tenant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tenant.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tenant.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tenant
    if (selectedTenant !== 'all') {
      filtered = filtered.filter(t => t.tenant_id === selectedTenant);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(t => t.transaction_date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(t => t.transaction_date <= dateTo);
    }

    setFilteredTransactions(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTenant('all');
    setSelectedType('all');
    setDateFrom('');
    setDateTo('');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 bg-gray-200 rounded animate-pulse w-64"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-1">Kelola dan monitor semua transaksi tenant</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <ArrowUpRight className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pemasukan</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <ArrowDownRight className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pengeluaran</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tenant Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeTenants}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Filter Transaksi</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tenant Filter */}
          <div className="md:col-span-1">
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.tenant_name || tenant.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="md:col-span-1">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Tipe</option>
              <option value="PEMASUKAN">Pemasukan</option>
              <option value="PENGELUARAN">Pengeluaran</option>
            </select>
          </div>
        </div>

        {/* Date Range Filters - Separate Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Date From */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || selectedTenant !== 'all' || selectedType !== 'all' || dateFrom || dateTo) && (
          <div className="mt-4">
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Menampilkan <span className="font-semibold">{filteredTransactions.length}</span> dari{' '}
          <span className="font-semibold">{transactions.length}</span> transaksi
        </p>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catatan
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada transaksi ditemukan
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatDate(transaction.transaction_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.tenant.tenant_name || transaction.tenant.full_name}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.tenant.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'PEMASUKAN'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transaction.type === 'PEMASUKAN' ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-semibold ${
                          transaction.type === 'PEMASUKAN' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(transaction.total_amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {transaction.note || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/tenants/transactions/${transaction.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
