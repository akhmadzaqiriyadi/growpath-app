'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  FileText,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionItem = Database['public']['Tables']['transaction_items']['Row'];

interface TransactionWithItems extends Transaction {
  items?: TransactionItem[];
}

export function TransactionsPageClient() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PEMASUKAN' | 'PENGELUARAN'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Get transactions with items
    const { data: transactionsData, error } = await supabase
      .from('transactions')
      .select(`
        *,
        transaction_items (*)
      `)
      .eq('tenant_id', user.id)
      .is('deleted_at', null)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading transactions:', error);
      alert('Gagal memuat transaksi');
    } else {
      setTransactions(transactionsData as any || []);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const stats = {
    total: transactions.length,
    income: transactions.filter(t => t.type === 'PEMASUKAN').length,
    expense: transactions.filter(t => t.type === 'PENGELUARAN').length,
    totalIncome: transactions
      .filter(t => t.type === 'PEMASUKAN')
      .reduce((sum, t) => sum + t.total_amount, 0),
    totalExpense: transactions
      .filter(t => t.type === 'PENGELUARAN')
      .reduce((sum, t) => sum + t.total_amount, 0),
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-sm text-gray-600">{filteredTransactions.length} transaksi</p>
        </div>
        <Link href="/transactions/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Catat
          </Button>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="h-4 w-4" />
            <span className="text-xs opacity-90">Pemasukan</span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(stats.totalIncome)}</p>
          <p className="text-xs opacity-75 mt-1">{stats.income} transaksi</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="h-4 w-4" />
            <span className="text-xs opacity-90">Pengeluaran</span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(stats.totalExpense)}</p>
          <p className="text-xs opacity-75 mt-1">{stats.expense} transaksi</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Filter className="h-3 w-3 inline mr-1" />
          Semua ({stats.total})
        </button>
        <button
          onClick={() => setFilter('PEMASUKAN')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            filter === 'PEMASUKAN'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          💰 Pemasukan ({stats.income})
        </button>
        <button
          onClick={() => setFilter('PENGELUARAN')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            filter === 'PENGELUARAN'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          💸 Pengeluaran ({stats.expense})
        </button>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? 'Belum ada transaksi. Mulai catat transaksi pertama Anda!'
              : `Belum ada transaksi ${filter.toLowerCase()}`
            }
          </p>
          <Link href="/transactions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Catat Transaksi
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`p-2 rounded-lg ${
                    transaction.type === 'PEMASUKAN'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}
                >
                  {transaction.type === 'PEMASUKAN' ? (
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {transaction.type}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(transaction.transaction_date)}
                      </p>
                    </div>
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === 'PEMASUKAN'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(transaction.total_amount)}
                    </p>
                  </div>

                  {/* Items */}
                  {transaction.items && transaction.items.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600 mb-1">
                        {transaction.items.length} item:
                      </p>
                      <div className="space-y-1">
                        {transaction.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-xs text-gray-600"
                          >
                            <span>
                              {item.product_name} x{item.quantity}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Note */}
                  {transaction.note && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600 italic">
                        💬 {transaction.note}
                      </p>
                    </div>
                  )}

                  {/* Receipt */}
                  {transaction.receipt_url && (
                    <div className="mt-2">
                      <a
                        href={transaction.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        📎 Lihat Nota
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
