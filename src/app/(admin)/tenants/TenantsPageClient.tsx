'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Upload } from 'lucide-react';
import { TenantTable } from '@/components/admin/tenants/TenantTable';
import { TenantFormModal } from '@/components/admin/tenants/TenantFormModal';
import { BulkCreateModal } from '@/components/admin/tenants/BulkCreateModal';
import { getTenants } from '@/lib/actions/tenants';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function TenantsPageClient() {
  const [tenants, setTenants] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Profile | null>(null);

  // Stats
  const [stats, setStats] = useState({
    activeToday: 0,
    pendingSetup: 0,
  });

  const fetchTenants = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await getTenants();
      if (result.success && result.data) {
        setTenants(result.data);
        await calculateStats(result.data);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data tenant');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async (tenantsData: Profile[]) => {
    // Import supabase client
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Get tenants who made transactions today
    const { data: todayTransactions } = await supabase
      .from('transactions')
      .select('tenant_id')
      .eq('transaction_date', today)
      .is('deleted_at', null);

    const uniqueTenantsToday = new Set(todayTransactions?.map(t => t.tenant_id) || []);

    // Get tenants without any products (pending setup)
    const pendingSetupCount = await Promise.all(
      tenantsData.map(async (tenant) => {
        const { data: products } = await supabase
          .from('products')
          .select('id')
          .eq('tenant_id', tenant.id)
          .is('deleted_at', null);
        
        return (products?.length || 0) === 0;
      })
    );

    setStats({
      activeToday: uniqueTenantsToday.size,
      pendingSetup: pendingSetupCount.filter(Boolean).length,
    });
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleAddTenant = () => {
    setEditingTenant(null);
    setIsFormModalOpen(true);
  };

  const handleEditTenant = (tenant: Profile) => {
    setEditingTenant(tenant);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingTenant(null);
  };

  const handleSuccess = () => {
    fetchTenants();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-gray-600 mt-4">Memuat data tenant...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">{error}</p>
        <Button onClick={fetchTenants} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tenant</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{tenants.length}</p>
            </div>
            <div className="bg-primary/10 rounded-full p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transaksi Hari Ini</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeToday}</p>
              <p className="text-xs text-gray-500 mt-1">tenant yang bertransaksi</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Belum Setup</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingSetup}</p>
              <p className="text-xs text-gray-500 mt-1">tenant belum add produk</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Daftar Tenant</h2>
          <p className="text-sm text-gray-600">
            Kelola dan monitor akun tenant
          </p>
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

      {/* Table */}
      <TenantTable
        tenants={tenants}
        onEdit={handleEditTenant}
        onRefresh={fetchTenants}
      />

      {/* Modals */}
      <TenantFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
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
