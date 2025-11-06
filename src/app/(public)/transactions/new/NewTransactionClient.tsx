'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Trash2, 
  Save, 
  ShoppingCart, 
  Upload,
  Calendar,
  X 
} from 'lucide-react';

type Product = Database['public']['Tables']['products']['Row'];

const transactionItemSchema = z.object({
  product_id: z.number(),
  product_name: z.string(),
  quantity: z.number().min(1, 'Quantity minimal 1'),
  unit_price: z.number().min(0),
});

const transactionSchema = z.object({
  type: z.enum(['PEMASUKAN', 'PENGELUARAN']),
  transaction_date: z.string(),
  items: z.array(transactionItemSchema).min(1, 'Minimal 1 produk'),
  note: z.string().optional(),
  receipt_url: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export function NewTransactionClient() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'PEMASUKAN',
      transaction_date: new Date().toISOString().split('T')[0],
      items: [],
      note: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchType = watch('type');
  const watchItems = watch('items');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('tenant_id', user.id)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name');

    if (error) {
      console.error('Error loading products:', error);
      alert('Gagal memuat produk');
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  };

  const handleAddProduct = (product: Product) => {
    // Check if product already in items
    const exists = watchItems?.some(item => item.product_id === product.id);
    if (exists) {
      alert('Produk sudah ditambahkan');
      return;
    }

    append({
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: product.price,
    });
  };

  const calculateSubtotal = (index: number) => {
    const item = watchItems?.[index];
    if (!item) return 0;
    return item.quantity * item.unit_price;
  };

  const calculateTotal = () => {
    if (!watchItems) return 0;
    return watchItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      setReceiptFile(file);
    }
  };

  const uploadReceipt = async (file: File, tenantId: string) => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${tenantId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Silakan login terlebih dahulu');
        router.push('/login');
        return;
      }

      // Upload receipt if exists
      let receiptUrl = data.receipt_url;
      if (receiptFile) {
        const uploadedUrl = await uploadReceipt(receiptFile, user.id);
        if (uploadedUrl) {
          receiptUrl = uploadedUrl;
        }
      }

      // Calculate total
      const totalAmount = data.items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price),
        0
      );

      // Insert transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          tenant_id: user.id,
          type: data.type,
          total_amount: totalAmount,
          transaction_date: data.transaction_date,
          note: data.note || null,
          receipt_url: receiptUrl || null,
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Transaction error:', transactionError);
        alert('Gagal menyimpan transaksi: ' + transactionError.message);
        return;
      }

      // Insert transaction items
      const itemsToInsert = data.items.map(item => ({
        transaction_id: transactionData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Items error:', itemsError);
        alert('Gagal menyimpan detail transaksi');
        return;
      }

      alert('✅ Transaksi berhasil dicatat!');
      router.push('/transactions');
    } catch (error: any) {
      console.error('Unexpected error:', error);
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Belum Ada Produk Aktif
          </h2>
          <p className="text-gray-600 mb-4">
            Anda perlu menambahkan produk terlebih dahulu sebelum mencatat transaksi
          </p>
          <Button onClick={() => router.push('/products')}>
            Kelola Produk
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Catat Transaksi</h1>
        <p className="text-sm text-gray-600">
          Pilih produk dan isi jumlah yang terjual atau dibeli
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Transaction Type */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jenis Transaksi <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue('type', 'PEMASUKAN')}
              className={`p-3 rounded-lg border-2 transition-all ${
                watchType === 'PEMASUKAN'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              <div className="font-semibold">💰 Pemasukan</div>
              <div className="text-xs mt-1">Penjualan produk</div>
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 'PENGELUARAN')}
              className={`p-3 rounded-lg border-2 transition-all ${
                watchType === 'PENGELUARAN'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              <div className="font-semibold">💸 Pengeluaran</div>
              <div className="text-xs mt-1">Pembelian/Biaya</div>
            </button>
          </div>
        </div>

        {/* Transaction Date */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Tanggal Transaksi <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('transaction_date')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            max={new Date().toISOString().split('T')[0]}
          />
          <p className="text-xs text-gray-500 mt-1">
            Bisa retroactive untuk pencatatan setelah event
          </p>
        </div>

        {/* Product Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Pilih Produk</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleAddProduct(product)}
                className="w-full p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(product.price)} • Stock: {product.stock}
                    </div>
                  </div>
                  <Plus className="h-5 w-5 text-primary" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Items */}
        {fields.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Produk Terpilih ({fields.length})
            </h3>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {watchItems?.[index]?.product_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(watchItems?.[index]?.unit_price || 0)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">
                        Jumlah
                      </label>
                      <input
                        type="number"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">
                        Subtotal
                      </label>
                      <div className="font-semibold text-primary px-3 py-2">
                        {formatCurrency(calculateSubtotal(index))}
                      </div>
                    </div>
                  </div>
                  {errors.items?.[index]?.quantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className={`text-xl font-bold ${
                  watchType === 'PEMASUKAN' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catatan (Opsional)
          </label>
          <textarea
            {...register('note')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tambahkan catatan jika diperlukan..."
          />
        </div>

        {/* Receipt Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Upload className="h-4 w-4 inline mr-1" />
            Upload Nota/Bukti (Opsional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="receipt-upload"
          />
          <label
            htmlFor="receipt-upload"
            className="block w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
          >
            {receiptFile ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{receiptFile.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setReceiptFile(null);
                  }}
                  className="text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                <span className="text-sm text-gray-600">
                  Klik untuk upload foto nota
                </span>
                <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
              </>
            )}
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || fields.length === 0}
            className="w-full"
            size="lg"
          >
            <Save className="h-5 w-5 mr-2" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
