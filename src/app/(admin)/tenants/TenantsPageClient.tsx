'use client';

import { useState, useEffect, useCallback } from 'react'; // Tambah useCallback
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import Input untuk Search
import { Plus, Users, Upload, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { TenantTable } from '@/components/admin/tenants/TenantTable';
import { TenantFormModal } from '@/components/admin/tenants/TenantFormModal';
import { BulkCreateModal } from '@/components/admin/tenants/BulkCreateModal';
import { getTenantsList, getTenantStats } from '@/lib/actions/tenants'; // Import Action Baru
import { Database } from '@/types/database.types';

// Helper debounce agar tidak request setiap ketikan huruf
import { useDebounce } from 'use-debounce'; 

type Profile = Database['public']['Tables']['profiles']['Row'];

const ITEMS_PER_PAGE = 10;

export function TenantsPageClient() {
  // --- State Data ---
  const [tenants, setTenants] = useState<Profile[]>([]);
  const [totalTenantsCount, setTotalTenantsCount] = useState(0);
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeToday: 0,
    pendingSetup: 0,
  });

  // --- State UI & Filter ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 500); // Tunggu 500ms sebelum search

  // --- State Modal ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Profile | null>(null);

  // --- 1. Fetch Data (List & Stats) ---
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Jalankan paralel agar cepat
      const [listResult, statsResult] = await Promise.all([
        getTenantsList({ 
          page: currentPage, 
          limit: ITEMS_PER_PAGE, 
          query: debouncedSearch 
        }),
        getTenantStats()
      ]);

      // Set Data List
      if (listResult.error) throw new Error(listResult.error);
      setTenants(listResult.data);
      setTotalTenantsCount(listResult.count);

      // Set Data Stats
      if (statsResult) {
        setStats(statsResult);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat data tenant');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]); // Re-run jika page atau search berubah

  // Trigger fetch saat komponen mount atau filter berubah
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- Handlers ---
  const handleAddTenant = () => {
    setEditingTenant(null);
    setIsFormModalOpen(true);
  };

  const handleEditTenant = (tenant: Profile) => {
    setEditingTenant(tenant);
    setIsFormModalOpen(true);
  };

  const handleSuccess = () => {
    fetchDashboardData(); // Refresh data setelah create/update
    if (!editingTenant) setCurrentPage(1); // Kembali ke page 1 jika create baru
  };

  // --- Pagination Logic ---
  const totalPages = Math.ceil(totalTenantsCount / ITEMS_PER_PAGE);
  
  const handlePreviousPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // Generate page numbers (Logika sama seperti sebelumnya)
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1); pages.push('...'); pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1); pages.push('...'); pages.push(totalPages);
      }
    }
    return pages;
  };

  // --- Render ---
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Kartu 1: Total Tenant */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tenant</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.totalTenants}
              </p>
            </div>
            <div className="bg-primary/10 rounded-full p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Kartu 2: Transaksi Hari Ini */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transaksi Hari Ini</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.activeToday}
              </p>
              <p className="text-xs text-gray-500 mt-1">tenant yang bertransaksi</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Kartu 3: Belum Setup */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Belum Setup</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.pendingSetup}
              </p>
              <p className="text-xs text-gray-500 mt-1">tenant belum add produk</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Daftar Tenant</h2>
          <p className="text-sm text-gray-600">
            Total {totalTenantsCount} tenant terdaftar
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari tenant..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset ke hal 1 saat mencari
              }}
              className="pl-9"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsBulkModalOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button onClick={handleAddTenant}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Tenant
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-gray-600 mt-4">Memuat data...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error}</p>
          <Button onClick={fetchDashboardData} className="mt-4">Coba Lagi</Button>
        </div>
      )}

      {/* Table Content */}
      {!loading && !error && (
        <>
          <TenantTable
            tenants={tenants}
            onEdit={handleEditTenant}
            onRefresh={fetchDashboardData}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-600">
                Hal. {currentPage} dari {totalPages}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                      <Button
                        key={index}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={index} className="px-2 text-gray-400">{page}</span>
                    )
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <TenantFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTenant(null);
        }}
        onSuccess={handleSuccess}
        tenant={editingTenant}
      />

      <BulkCreateModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}