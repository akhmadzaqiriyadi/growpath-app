'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

const productSchema = z.object({
  name: z.string().min(2, 'Nama produk minimal 2 karakter'),
  description: z.string().optional(),
  price: z.number().min(0, 'Harga harus positif'),
  stock: z.number().min(0, 'Stock harus positif'),
  category: z.string().optional(),
  is_active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}: ProductFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description || '',
          price: product.price,
          stock: product.stock,
          category: product.category || '',
          is_active: product.is_active,
        }
      : {
          is_active: true,
        },
  });

  useEffect(() => {
    if (isOpen && product) {
      reset({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        category: product.category || '',
        is_active: product.is_active,
      });
    } else if (!isOpen) {
      reset({ is_active: true });
    }
  }, [isOpen, product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Silakan login terlebih dahulu');
        return;
      }

      if (isEdit && product) {
        // Update
        const { error } = await supabase
          .from('products')
          .update({
            name: data.name,
            description: data.description || null,
            price: data.price,
            stock: data.stock,
            category: data.category || null,
            is_active: data.is_active,
          })
          .eq('id', product.id);

        if (error) {
          alert('Gagal mengupdate produk');
          console.error(error);
          return;
        }

        alert('Produk berhasil diupdate!');
      } else {
        // Create
        const { error } = await supabase.from('products').insert({
          tenant_id: user.id,
          name: data.name,
          description: data.description || null,
          price: data.price,
          stock: data.stock,
          category: data.category || null,
          is_active: data.is_active,
        });

        if (error) {
          alert('Gagal menambah produk');
          console.error(error);
          return;
        }

        alert('Produk berhasil ditambahkan!');
      }

      onSuccess();
      onClose();
      reset();
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit Produk' : 'Tambah Produk'}
          </h2>
          <button onClick={onClose} disabled={isSubmitting}>
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Nama Produk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama produk"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Deskripsi produk (opsional)"
            />
          </div>

          {/* Harga & Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15000"
                min="0"
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('stock', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="50"
                min="0"
              />
              {errors.stock && (
                <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <input
              type="text"
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Makanan"
            />
          </div>

          {/* Status Aktif */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('is_active')}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
            />
            <label className="text-sm text-gray-700">Produk aktif dan bisa dijual</label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Menyimpan...' : isEdit ? 'Update' : 'Tambah'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
