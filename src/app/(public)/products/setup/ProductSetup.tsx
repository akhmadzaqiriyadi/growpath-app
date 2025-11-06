'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const productSchema = z.object({
  name: z.string().min(2, 'Nama produk minimal 2 karakter'),
  price: z.number().min(0, 'Harga harus positif'),
  stock: z.number().min(0, 'Stock harus positif'),
  category: z.string().optional(),
});

const setupSchema = z.object({
  products: z.array(productSchema).min(1, 'Minimal tambahkan 1 produk'),
});

type SetupFormData = z.infer<typeof setupSchema>;

export function ProductSetup() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      products: [
        { name: '', price: 0, stock: 0, category: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });

  const onSubmit = async (data: SetupFormData) => {
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Silakan login terlebih dahulu');
        router.push('/login');
        return;
      }

      // Insert all products
      const productsToInsert = data.products.map(product => ({
        tenant_id: user.id,
        name: product.name,
        price: Math.round(product.price), // Convert to smallest unit
        stock: product.stock,
        category: product.category || null,
        is_active: true,
      }));

      const { error } = await supabase
        .from('products')
        .insert(productsToInsert);

      if (error) {
        console.error('Error creating products:', error);
        alert('Gagal menyimpan produk: ' + error.message);
        return;
      }

      alert(`Berhasil menambahkan ${data.products.length} produk!`);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Unexpected error:', error);
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Setup Produk</h1>
        <p className="text-sm text-gray-600">
          Tambahkan produk yang akan Anda jual. Anda bisa menambah atau mengedit produk kapan saja.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Product List */}
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-900">
                  Produk {index + 1}
                </h3>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Nama Produk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register(`products.${index}.name`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Nasi Goreng"
                />
                {errors.products?.[index]?.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.products[index]?.name?.message}
                  </p>
                )}
              </div>

              {/* Harga & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register(`products.${index}.price`, {
                      valueAsNumber: true,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="15000"
                    min="0"
                  />
                  {errors.products?.[index]?.price && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.products[index]?.price?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register(`products.${index}.stock`, {
                      valueAsNumber: true,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50"
                    min="0"
                  />
                  {errors.products?.[index]?.stock && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.products[index]?.stock?.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Kategori (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori (Opsional)
                </label>
                <input
                  type="text"
                  {...register(`products.${index}.category`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Makanan"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add More Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({ name: '', price: 0, stock: 0, category: '' })
          }
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk Lain
        </Button>

        {/* Submit Button */}
        <div className="pt-2 pb-20">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            <Save className="h-5 w-5 mr-2" />
            {isSubmitting ? 'Menyimpan...' : `Simpan ${fields.length} Produk`}
          </Button>
        </div>
      </form>
    </div>
  );
}
