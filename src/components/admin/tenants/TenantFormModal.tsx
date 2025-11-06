'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTenantSchema, updateTenantSchema, BUSINESS_CATEGORIES, type CreateTenantInput } from '@/lib/validations/tenant';
import { createTenant, updateTenant } from '@/lib/actions/tenants';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenant?: Profile | null;
}

export function TenantFormModal({ isOpen, onClose, onSuccess, tenant }: TenantFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!tenant;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTenantInput>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: tenant
      ? {
          full_name: tenant.full_name,
          email: tenant.email,
          phone: tenant.phone || '',
          npm: tenant.npm || '',
          prodi: tenant.prodi || '',
          tenant_name: tenant.tenant_name || '',
          business_category: tenant.business_category || 'Other',
          password: '', // Empty for edit
        }
      : undefined,
  });

  useEffect(() => {
    if (isOpen && tenant) {
      reset({
        full_name: tenant.full_name,
        email: tenant.email,
        phone: tenant.phone || '',
        npm: tenant.npm || '',
        prodi: tenant.prodi || '',
        tenant_name: tenant.tenant_name || '',
        business_category: tenant.business_category || 'Other',
        password: '',
      });
    } else if (!isOpen) {
      reset();
    }
  }, [isOpen, tenant, reset]);

  const onSubmit = async (data: CreateTenantInput) => {
    setIsSubmitting(true);
    try {
      const result = isEdit && tenant
        ? await updateTenant(tenant.id, data)
        : await createTenant(data);

      if (result.success) {
        alert(result.message);
        onSuccess();
        onClose();
        reset();
      } else {
        alert(result.message);
      }
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {isEdit ? 'Edit Tenant' : 'Tambah Tenant'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('full_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama lengkap mahasiswa"
              />
              {errors.full_name && (
                <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
              )}
            </div>

            {/* NPM */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NPM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('npm')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234567890"
                maxLength={10}
              />
              {errors.npm && (
                <p className="text-red-500 text-xs mt-1">{errors.npm.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {!isEdit && <span className="text-red-500">*</span>}
                {isEdit && <span className="text-gray-400 text-xs">(kosongkan jika tidak diubah)</span>}
              </label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimal 6 karakter"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Telepon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telepon
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="08xxxxxxxxxx"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Program Studi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program Studi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('prodi')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Teknik Informatika"
              />
              {errors.prodi && (
                <p className="text-red-500 text-xs mt-1">{errors.prodi.message}</p>
              )}
            </div>

            {/* Nama Usaha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Usaha <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('tenant_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama usaha/kelompok"
              />
              {errors.tenant_name && (
                <p className="text-red-500 text-xs mt-1">{errors.tenant_name.message}</p>
              )}
            </div>

            {/* Kategori Bisnis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori Bisnis <span className="text-red-500">*</span>
              </label>
              <select
                {...register('business_category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih kategori</option>
                {BUSINESS_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.business_category && (
                <p className="text-red-500 text-xs mt-1">{errors.business_category.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : isEdit ? 'Update' : 'Tambah'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
