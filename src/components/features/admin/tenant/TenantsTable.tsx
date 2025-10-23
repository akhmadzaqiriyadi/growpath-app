'use client';

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

import { TransactionRow, ProfileRow } from "@/lib/types"

// Tipe data ini tidak berubah
type TenantPerformance = {
  id: string;
  tenant_name: string | null;
  full_name: string | null;
  category: string | null;
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_bersih: number;
  jumlah_transaksi: number;
  transaksi_terakhir: string | null;
};

// Tipe dasar dari database
// type Profile = { id: string; tenant_name: string | null; full_name: string | null; category: string | null; };
// type Transaction = { id: number; tenant_id: string; type: string; amount: number; transaction_date: string; };

export default function TenantsTable() {
  const [performanceData, setPerformanceData] = useState<TenantPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchDataAndProcess = async () => {
      setLoading(true);

      // 1. Fetch semua profiles dan semua transactions secara bersamaan
      const [profilesRes, transactionsRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('transactions').select('*')
      ]);

      if (profilesRes.error || transactionsRes.error) {
        console.error('Error fetching data:', profilesRes.error || transactionsRes.error);
        setLoading(false);
        return;
      }

      const profiles: ProfileRow[] = profilesRes.data || [];
      const transactions: TransactionRow[] = transactionsRes.data || [];

      // 2. Proses dan kalkulasi data menggunakan JavaScript
      const performanceMap = new Map<string, TenantPerformance>();

      // Inisialisasi map dengan data dari profiles
      profiles.forEach(profile => {
        performanceMap.set(profile.id, {
          ...profile,
          total_pemasukan: 0,
          total_pengeluaran: 0,
          saldo_bersih: 0,
          jumlah_transaksi: 0,
          transaksi_terakhir: null,
        });
      });

      // Iterasi melalui transaksi untuk mengkalkulasi metrik
      transactions.forEach(transaction => {
        const tenant = performanceMap.get(transaction.tenant_id);
        if (tenant) {
          tenant.jumlah_transaksi += 1;
          tenant.saldo_bersih += transaction.amount;
          if (transaction.type === 'PEMASUKAN') {
            tenant.total_pemasukan += transaction.amount;
          } else {
            tenant.total_pengeluaran += Math.abs(transaction.amount);
          }
          // Update tanggal transaksi terakhir
          if (!tenant.transaksi_terakhir || new Date(transaction.transaction_date) > new Date(tenant.transaksi_terakhir)) {
            tenant.transaksi_terakhir = transaction.transaction_date;
          }
        }
      });
      
      // Ubah map kembali menjadi array dan urutkan
      const finalData = Array.from(performanceMap.values())
        .sort((a, b) => b.total_pemasukan - a.total_pemasukan);

      setPerformanceData(finalData);
      setLoading(false);
    };

    fetchDataAndProcess();
  }, []);

 const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) {return '-'}
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return <p className="text-center py-10">Memuat data performa tenant...</p>;
  }

  // (JSX untuk render tabel tetap sama seperti sebelumnya, menggunakan `performanceData` sebagai sumber)
  return (
    <div className="border rounded-lg">
      <Table>
        <TableCaption>Performa semua tenant berdasarkan data transaksi.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Tenant</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Total Pemasukan</TableHead>
            <TableHead className="text-right">Total Pengeluaran</TableHead>
            <TableHead className="text-right">Saldo Bersih</TableHead>
            <TableHead className="text-center">Jml. Transaksi</TableHead>
            <TableHead>Transaksi Terakhir</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {performanceData.map((tenant) => (
            <TableRow key={tenant.id}>
              <TableCell className="font-medium">{tenant.tenant_name}</TableCell>
              <TableCell>{tenant.category}</TableCell>
              <TableCell className="text-right text-green-600 font-semibold">{formatCurrency(tenant.total_pemasukan)}</TableCell>
              <TableCell className="text-right text-red-600 font-semibold">{formatCurrency(tenant.total_pengeluaran)}</TableCell>
              <TableCell className={`text-right font-semibold ${tenant.saldo_bersih >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(tenant.saldo_bersih)}
              </TableCell>
              <TableCell className="text-center">{tenant.jumlah_transaksi}</TableCell>
              <TableCell>{formatDate(tenant.transaksi_terakhir)}</TableCell>
              <TableCell className="text-center">
                <Button variant="outline" size="sm">
                  Detail <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}