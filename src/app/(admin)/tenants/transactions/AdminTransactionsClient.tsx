'use client';

import { useEffect, useState } from 'react';
import { getAllTransactions, getTenantsList, getTransactionsStats } from '@/lib/actions/transactions'; // Pastikan path ini benar
import { Database } from '@/types/database.types';
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react'; // Hapus TrendingUp jika tidak dipakai
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// --- (Tipe tidak berubah) ---
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

// --- KOMPONEN UTAMA ---
export function AdminTransactionsClient() {
  // --- State Data & Loading ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true); // Untuk loading tabel transaksi
  const [loadingTenants, setLoadingTenants] = useState(true); // Untuk loading dropdown tenant
  const [loadingStats, setLoadingStats] = useState(true);

  // --- State Paginasi ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Kamu bisa sesuaikan ini
  const [totalItemsCount, setTotalItemsCount] = useState(0); // BARU: Total data dari server

  // --- State Filters ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'PEMASUKAN' | 'PENGELUARAN'>(
    'all'
  );
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // --- State Stats (⚠️ DATANYA TIDAK AKURAT SETELAH PERUBAHAN INI) ---
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalIncome: 0,
    totalExpense: 0,
    activeTenants: 0,
  });

  // --- EFEK 1: Ambil data tenant (hanya sekali saat komponen dimuat) ---
  useEffect(() => {
    const loadTenants = async () => {
      setLoadingTenants(true);
      const tenantsResult = await getTenantsList();
      if (tenantsResult.data) {
        setTenants(tenantsResult.data);
      }
      setLoadingTenants(false);
    };
    loadTenants();
  }, []); // <-- Dependency array kosong, hanya jalan sekali

  // --- EFEK 2: Ambil data transaksi (setiap kali filter atau halaman berubah) ---
  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);

      // Siapkan semua parameter untuk Server Action
      const params = {
        page: currentPage,
        itemsPerPage: itemsPerPage,
        searchQuery: searchQuery,
        selectedTenant: selectedTenant,
        selectedType: selectedType,
        dateFrom: dateFrom,
        dateTo: dateTo,
      };

      // Panggil Server Action baru dengan semua parameter filter
      const transactionsResult = await getAllTransactions(params);

      if (transactionsResult.data && transactionsResult.count != null) {
        setTransactions(transactionsResult.data as Transaction[]);
        setTotalItemsCount(transactionsResult.count); // Simpan total data

        // ⚠️ PERINGATAN: Kalkulasi Stats di bawah ini TIDAK AKURAT
        // Ini hanya menghitung stats dari 10 item yang tampil, BUKAN dari total data.
        // Ini perlu dipindahkan ke Server Action terpisah nanti.
        const totalIncome = transactionsResult.data
          .filter((t: any) => t.type === 'PEMASUKAN')
          .reduce((sum: number, t: any) => sum + t.total_amount, 0);
        const totalExpense = transactionsResult.data
          .filter((t: any) => t.type === 'PENGELUARAN')
          .reduce((sum: number, t: any) => sum + t.total_amount, 0);
        const uniqueTenants = new Set(
          transactionsResult.data.map((t: any) => t.tenant_id)
        );

        setStats({
          totalTransactions: transactionsResult.count, // Setidaknya ini akurat
          totalIncome, // SALAH
          totalExpense, // SALAH
          activeTenants: uniqueTenants.size, // SALAH
        });
        // --- Akhir dari kode yang tidak akurat ---
      } else {
        // Jika error atau tidak ada data
        setTransactions([]);
        setTotalItemsCount(0);
      }

      setLoading(false);
    };

    loadTransactions();
  }, [
    currentPage,
    itemsPerPage,
    searchQuery,
    selectedTenant,
    selectedType,
    dateFrom,
    dateTo,
  ]); // <-- EFEK INI JALAN JIKA SALAH SATU DARI INI BERUBAH

  // EFEK 2: Ambil DATA STATS (setiap kali FILTER berubah)
useEffect(() => {
  const loadStats = async () => {
    setLoadingStats(true); // Mulai loading stats

    const filterParams = {
      searchQuery: searchQuery,
      selectedTenant: selectedTenant,
      selectedType: selectedType,
      dateFrom: dateFrom,
      dateTo: dateTo,
    };

    // Panggil Server Action STATS yang baru
    const statsResult = await getTransactionsStats(filterParams);

    // Update state stats dengan data AKURAT dari server
    setStats(statsResult);
    setLoadingStats(false); // Selesai loading stats
  };

  loadStats();
}, [searchQuery, selectedTenant, selectedType, dateFrom, dateTo]); // <-- HANYA bergantung pada filter

// EFEK 3: Ambil DATA TABEL (setiap kali FILTER atau HALAMAN berubah)
useEffect(() => {
  const loadTransactions = async () => {
    setLoading(true); // Mulai loading tabel

    const params = {
      page: currentPage,
      itemsPerPage: itemsPerPage,
      searchQuery: searchQuery,
      selectedTenant: selectedTenant,
      selectedType: selectedType,
      dateFrom: dateFrom,
      dateTo: dateTo,
    };

    // Panggil Server Action TABEL
    const transactionsResult = await getAllTransactions(params);

    if (transactionsResult.data && transactionsResult.count != null) {
      setTransactions(transactionsResult.data as Transaction[]);
      // SINKRONISASI totalItemsCount dari data tabel
      setTotalItemsCount(transactionsResult.count);

      // !!! HAPUS SEMUA LOGIKA KALKULASI STATS LAMA DARI SINI !!!
      // setStats({ ... }) <--- HAPUS BLOK INI DARI SINI
    } else {
      setTransactions([]);
      setTotalItemsCount(0);
    }

    setLoading(false); // Selesai loading tabel
  };

  loadTransactions();
}, [
  currentPage,
  itemsPerPage,
  searchQuery,
  selectedTenant,
  selectedType,
  dateFrom,
  dateTo,
]);

  // --- EFEK 3: Reset halaman ke 1 jika filter berubah ---
  // Ini penting agar user tidak terjebak di halaman 5 saat hasil filternya hanya 1 halaman
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTenant, selectedType, dateFrom, dateTo]); // <-- Hanya state filter

  // --- HAPUS: useEffect(applyFilters, ...) & fungsi applyFilters() ---
  // Logika ini sudah pindah ke server

  // --- (Fungsi helper format tidak berubah) ---
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

  // Fungsi clearFilters tetap, EFEK 3 akan otomatis menangani reset halaman
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTenant('all');
    setSelectedType('all');
    setDateFrom('');
    setDateTo('');
  };

  // --- HITUNG PAGINASI ---
  // Logika ini sekarang menggunakan total data dari server
  const totalPages = Math.ceil(totalItemsCount / itemsPerPage);

  // --- HAPUS: const paginatedTransactions = ... ---
  // Data di state `transactions` sudah terpaginasi oleh server

  // Handler paginasi (tidak berubah)
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // --- RENDER ---

  // Tampilkan skeleton loading besar hanya saat data tenant (dropdown) belum siap
  if (loadingTenants) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 bg-gray-200 rounded animate-pulse w-64"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-lg animate-pulse"
            ></div>
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
        <p className="text-gray-600 mt-1">
          Kelola dan monitor semua transaksi tenant
        </p>
      </div>

      {/* Stats Cards (⚠️ INGAT: TIDAK AKURAT!) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card Total Transaksi */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Transaksi</p>
              {loadingStats ? (
                <div className="h-7 w-20 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalTransactions}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Card Total Pemasukan */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <ArrowUpRight className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pemasukan (Halaman Ini)</p> {/* (Beri tanda) */}
              {loadingStats ? (
                <div className="h-7 w-28 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(stats.totalIncome)}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Card Total Pengeluaran */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <ArrowDownRight className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pengeluaran (Halaman Ini)</p> {/* (Beri tanda) */}
              {loadingStats ? (
                <div className="h-7 w-28 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(stats.totalExpense)}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Card Tenant Aktif */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tenant Aktif (Halaman Ini)</p> {/* (Beri tanda) */}
              {loadingStats ? (
                <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeTenants}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters (Tidak ada perubahan di JSX filter) */}
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

      {/* Results Count (MODIFIKASI) */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Menampilkan <span className="font-semibold">{transactions.length}</span>{' '}
          dari <span className="font-semibold">{totalItemsCount}</span> transaksi
        </p>
      </div>

      {/* Transactions Table (MODIFIKASI) */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto relative"> {/* Tambah 'relative' untuk overlay loading */}
          
          {/* Overlay Loading */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <p>Memuat data...</p> {/* Ganti dengan spinner jika punya */}
            </div>
          )}
          
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
              {/* Ganti filteredTransactions.length -> transactions.length */}
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {loading ? 'Memuat...' : 'Tidak ada transaksi ditemukan'}
                  </td>
                </tr>
              ) : (
                // Ganti filteredTransactions.map -> transactions.map
                transactions.map((transaction) => (
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

      {/* Pagination Controls (MODIFIKASI) */}
      {/* Logika totalPages sekarang sudah benar */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <div>
            <span className="text-sm text-gray-600">
              Halaman <span className="font-semibold">{currentPage}</span> dari{' '}
              <span className="font-semibold">{totalPages}</span>
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1 || loading} // Tambah disable saat loading
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading} // Tambah disable saat loading
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}