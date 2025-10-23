'use client'; 

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { DateRange } from 'react-day-picker';
import { RotateCcw, PlusCircle } from "lucide-react";
import { Button } from '@/components/ui/button';

// Impor komponen anak
import TenantFilter from '../../../../components/features/admin/transactions/filter/TenantFilter';
import TransactionTable from '../../../../components/features/admin/transactions/TransactionTable';
import TransactionSummary from '../../../../components/features/admin/transactions/TransactionSummary';
import TransactionTypeFilter from '../../../../components/features/admin/transactions/filter/TransactionTypeFilter';
import DateRangeFilter from '@/components/features/admin/transactions/filter/DateRangeFilter';
import DateSortControl from '@/components/features/admin/transactions/filter/DateSortControl';
import AmountSortControl from '@/components/features/admin/transactions/filter/AmountSortControl';
import TransactionDonutChart from '@/components/features/admin/transactions/charts/TransactionDonutChart';
import AddEditTransactionModal from '@/components/features/admin/transactions/AddEditTransactionModal';

// --- 1. Impor tipe terpusat dari lib/types.ts ---
import { ProfileForFilter, TransactionWithProfile } from '../../../../lib/types';

export default function AdminDashboardPage() {
  // --- 2. Gunakan tipe yang benar dan akurat untuk state ---
  const [transactions, setTransactions] = useState<TransactionWithProfile[]>([]);
  const [profiles, setProfiles] = useState<ProfileForFilter[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithProfile | null>(null);

  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [dateSort, setDateSort] = useState<'desc' | 'asc'>('desc');
  const [amountSort, setAmountSort] = useState<'desc' | 'asc' | 'off'>('off');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<string>('all');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('id, tenant_name');
    setProfiles(data || []);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    let query = supabase.from('transactions').select(`*, profiles(tenant_name)`);

    // Logika Filter
    if (selectedTenant !== 'all') query = query.eq('tenant_id', selectedTenant);
    if (selectedType !== 'all') query = query.eq('type', selectedType);
    if (dateRange?.from) query = query.gte('transaction_date', dateRange.from.toISOString());
    if (dateRange?.to) query = query.lte('transaction_date', dateRange.to.toISOString());
    
    // Logika Urutan
    if (amountSort !== 'off') {
      query = query.order('amount', { ascending: amountSort === 'asc' });
    } else {
      query = query
        .order('transaction_date', { ascending: dateSort === 'asc' })
        .order('amount', { ascending: false });
    }
    
    const { data } = await query;
    setTransactions(data || []);
    setLoading(false);
  };
  
  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedTenant, selectedType, dateRange, dateSort, amountSort]);

  // Handlers
  const handleAmountSortChange = (value: 'desc' | 'asc' | 'off') => {
    setAmountSort(value);
    if (value !== 'off') setDateSort('desc');
  };

  const handleDateSortChange = (value: 'desc' | 'asc') => {
    setDateSort(value);
    setAmountSort('off');
  };
  
  const handleResetFilters = () => {
    setSelectedTenant('all');
    setSelectedType('all');
    setDateRange(undefined);
    setDateSort('desc');
    setAmountSort('off');
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (transaction: TransactionWithProfile) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    fetchTransactions();
    handleCloseModal();
  };
  
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Transaksi</h1>
          <p className="text-gray-500">Kelola dan analisis semua data transaksi.</p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Transaksi
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <TenantFilter 
          profiles={profiles}
          selectedValue={selectedTenant}
          onValueChange={setSelectedTenant}
        />
        <TransactionTypeFilter
          selectedValue={selectedType}
          onValueChange={setSelectedType}
        />
        <DateRangeFilter date={dateRange} onDateChange={setDateRange} />
        <DateSortControl selectedValue={dateSort} onValueChange={handleDateSortChange} />
        <AmountSortControl selectedValue={amountSort} onValueChange={handleAmountSortChange} />
        <Button onClick={handleResetFilters} variant="ghost" className="w-full justify-center">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Filter
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TransactionDonutChart transactions={transactions} />
        </div>
        <div className="lg:col-span-2">
          {/* Anda bisa letakkan kartu ringkasan lain di sini */}
        </div>
      </div>
      
      {loading ? (
        <p className="text-center py-10">Memuat data...</p>
      ) : (
        <TransactionTable transactions={transactions} onEdit={handleOpenEditModal} />
      )}
      
      {!loading && (
        <TransactionSummary 
          totalAmount={totalAmount} 
          transactionCount={transactions.length} 
        />
      )}

      <AddEditTransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        transactionToEdit={editingTransaction}
        allTenants={profiles}
      />
    </main>
  );
}