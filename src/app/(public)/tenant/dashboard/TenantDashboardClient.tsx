'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';
import { ArrowUpRight, ArrowDownRight, Package, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

export function TenantDashboardClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalProducts: 0,
    transactionsToday: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasProducts, setHasProducts] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const supabase = createClient();
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Get profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profileData || profileData.role !== 'tenant') {
      router.push('/login');
      return;
    }

    setProfile(profileData);

    // Check if tenant has products (for first-time setup)
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('tenant_id', user.id)
      .is('deleted_at', null);

    setHasProducts((products?.length || 0) > 0);

    // Get transactions stats
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('tenant_id', user.id)
      .is('deleted_at', null);

    if (transactions) {
      const income = transactions
        .filter(t => t.type === 'PEMASUKAN')
        .reduce((sum, t) => sum + t.total_amount, 0);
      
      const expense = transactions
        .filter(t => t.type === 'PENGELUARAN')
        .reduce((sum, t) => sum + t.total_amount, 0);

      const today = new Date().toISOString().split('T')[0];
      const todayTransactions = transactions.filter(t => t.transaction_date === today);

      setStats({
        totalIncome: income,
        totalExpense: expense,
        totalProducts: products?.length || 0,
        transactionsToday: todayTransactions.length,
      });

      // Get recent 5 transactions
      setRecentTransactions(transactions.slice(0, 5));
    }

    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  // First-time setup: no products yet
  if (!hasProducts) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Selamat Datang, {profile?.full_name}!
          </h2>
          <p className="text-gray-600 mb-6">
            Ayo mulai dengan menambahkan produk Anda terlebih dahulu
          </p>
          <Link href="/products/setup">
            <Button className="w-full" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Setup Produk
            </Button>
          </Link>
        </div>

        <div className="mt-6 bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h3 className="font-semibold text-primary mb-2">Tips Setup:</h3>
          <ul className="text-sm text-primary/80 space-y-1">
            <li>• Tambahkan semua produk yang akan dijual</li>
            <li>• Isi harga dan stock awal dengan benar</li>
            <li>• Produk bisa diubah kapan saja nanti</li>
          </ul>
        </div>
      </div>
    );
  }

  const netIncome = stats.totalIncome - stats.totalExpense;

  return (
    <div className="p-4 space-y-4">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-5 text-white">
        <p className="text-primary-foreground/80 text-sm mb-1">Selamat Datang Kembali</p>
        <p className="text-primary-foreground font-bold text-xl">{profile?.tenant_name}</p>
        <h2 className="text-sm mb-1">{profile?.full_name}</h2>
        <div className="mt-4 pt-4 border-t border-primary-foreground/30">
          <p className="text-primary-foreground/80 text-xs mb-1">Net Cashflow</p>
          <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-white' : 'text-red-200'}`}>
            {formatCurrency(netIncome)}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-[10px] text-gray-600">Pemasukan</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(stats.totalIncome)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-[10px] text-gray-600">Pengeluaran</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(stats.totalExpense)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs text-gray-600">Total Produk</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{stats.totalProducts}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-xs text-gray-600">Transaksi Hari Ini</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{stats.transactionsToday}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/transactions/new">
            <Button className="w-full text-[11px]" variant="default" size="sm">
              <Plus className="h-3 w-3" />
              Catat Transaksi
            </Button>
          </Link>
          <Link href="/products">
            <Button className="w-full text-[11px]" variant="outline" size="sm">
              <Package className="h-3 w-3 mr-1" />
              Kelola Produk
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">Transaksi Terakhir</h3>
            <Link href="/transactions" className="text-sm text-primary">
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-2">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      transaction.type === 'PEMASUKAN'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {transaction.type === 'PEMASUKAN' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.transaction_date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    transaction.type === 'PEMASUKAN'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(transaction.total_amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
