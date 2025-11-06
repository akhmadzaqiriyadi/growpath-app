'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTransactionById } from '@/lib/actions/transactions';
import { Database } from '@/types/database.types';
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  Store,
  FileText,
  Receipt,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  tenant: {
    id: string;
    full_name: string;
    tenant_name: string | null;
    email: string;
    phone: string | null;
  };
  items: Array<
    Database['public']['Tables']['transaction_items']['Row'] & {
      product: {
        id: number;
        name: string;
        category: string | null;
        sku: string | null;
      };
    }
  >;
};

interface TransactionDetailClientProps {
  id: number;
}

export function TransactionDetailClient({ id }: TransactionDetailClientProps) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    setLoading(true);
    const result = await getTransactionById(id);

    if (result.data) {
      setTransaction(result.data as Transaction);
    } else {
      // Transaction not found
      alert('Transaksi tidak ditemukan');
      router.push('/tenants/transactions');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 bg-gray-200 rounded animate-pulse w-64"></div>
        <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (!transaction) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/tenants/transactions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Transaksi</h1>
          <p className="text-gray-600 mt-1">ID: #{transaction.id}</p>
        </div>
      </div>

      {/* Transaction Summary Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-semibold ${
                  transaction.type === 'PEMASUKAN'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {transaction.type === 'PEMASUKAN' ? (
                  <ArrowUpRight className="h-5 w-5" />
                ) : (
                  <ArrowDownRight className="h-5 w-5" />
                )}
                {transaction.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(transaction.transaction_date)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p
              className={`text-3xl font-bold ${
                transaction.type === 'PEMASUKAN' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(transaction.total_amount)}
            </p>
          </div>
        </div>

        {/* Transaction Info Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">Dibuat Pada</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDateTime(transaction.created_at)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Terakhir Diupdate</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDateTime(transaction.updated_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Tenant Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Informasi Tenant
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Store className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Nama Usaha</p>
              <p className="text-sm font-medium text-gray-900">
                {transaction.tenant.tenant_name || transaction.tenant.full_name}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Nama Lengkap</p>
              <p className="text-sm font-medium text-gray-900">
                {transaction.tenant.full_name}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">{transaction.tenant.email}</p>
            </div>
          </div>

          {transaction.tenant.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Telepon</p>
                <p className="text-sm font-medium text-gray-900">
                  {transaction.tenant.phone}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Detail Produk ({transaction.items.length} item)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transaction.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      {item.product.category && (
                        <p className="text-xs text-gray-500">{item.product.category}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">{item.product.sku || '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm text-gray-900">{formatCurrency(item.unit_price)}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                  Total:
                </td>
                <td className="px-4 py-3 text-right">
                  <p
                    className={`text-lg font-bold ${
                      transaction.type === 'PEMASUKAN' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(transaction.total_amount)}
                  </p>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes & Receipt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Catatan
          </h2>
          {transaction.note ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{transaction.note}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Tidak ada catatan</p>
          )}
        </div>

        {/* Receipt */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Bukti Transaksi
          </h2>
          {transaction.receipt_url ? (
            <a
              href={transaction.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Lihat Bukti Transaksi
            </a>
          ) : (
            <p className="text-sm text-gray-400 italic">Tidak ada bukti transaksi</p>
          )}
        </div>
      </div>
    </div>
  );
}
