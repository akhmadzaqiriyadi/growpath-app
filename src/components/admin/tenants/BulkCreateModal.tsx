'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Download } from 'lucide-react';
import { bulkCreateTenants } from '@/lib/actions/tenants';
import { CreateTenantInput, BUSINESS_CATEGORIES } from '@/lib/validations/tenant';

interface BulkCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkCreateModal({ isOpen, onClose, onSuccess }: BulkCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenants, setTenants] = useState<CreateTenantInput[]>([]);
  const [error, setError] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setError('File CSV harus memiliki minimal header dan 1 data');
          return;
        }

        // Skip header (first line)
        const dataLines = lines.slice(1);
        const parsedTenants: CreateTenantInput[] = [];

        for (let i = 0; i < dataLines.length; i++) {
          const line = dataLines[i].trim();
          if (!line) continue;

          // Parse CSV: full_name,email,password,phone,npm,prodi,tenant_name,business_category
          const columns = line.split(',').map(col => col.trim());

          if (columns.length < 8) {
            setError(`Baris ${i + 2}: Data tidak lengkap (butuh 8 kolom)`);
            return;
          }

          const [full_name, email, password, phone, npm, prodi, tenant_name, business_category] = columns;

          // Validate business_category
          if (!BUSINESS_CATEGORIES.includes(business_category as any)) {
            setError(`Baris ${i + 2}: Kategori bisnis "${business_category}" tidak valid`);
            return;
          }

          parsedTenants.push({
            full_name,
            email,
            password,
            phone: phone || undefined,
            npm,
            prodi,
            tenant_name,
            business_category: business_category as typeof BUSINESS_CATEGORIES[number],
          });
        }

        setTenants(parsedTenants);
        setError('');
        alert(`Berhasil memuat ${parsedTenants.length} tenant dari CSV`);
      } catch (err: any) {
        setError(err.message || 'Gagal membaca file CSV');
      }
    };

    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (tenants.length === 0) {
      setError('Tidak ada data tenant untuk diupload');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await bulkCreateTenants(tenants);
      
      if (result.success && result.data) {
        const { success, failed, errors } = result.data;
        
        let message = `Berhasil membuat ${success} tenant.`;
        if (failed > 0) {
          message += `\n${failed} tenant gagal dibuat:\n${errors.join('\n')}`;
        }
        
        alert(message);
        
        if (success > 0) {
          onSuccess();
          onClose();
          setTenants([]);
        }
      } else {
        alert(result.message);
      }
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const template = 
`full_name,email,password,phone,npm,prodi,tenant_name,business_category
John Doe,john@example.com,password123,081234567890,1234567890,Teknik Informatika,Warung Makan,Kuliner
Jane Smith,jane@example.com,password123,081234567891,1234567891,Sistem Informasi,Fashion Store,Fashion`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-bulk-tenants.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Bulk Create Tenants</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Download Template */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="font-medium text-primary mb-2">Download Template CSV</h3>
            <p className="text-sm text-primary/80 mb-3">
              Download template CSV untuk memudahkan input data tenant secara bulk.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={downloadTemplate}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* Upload CSV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File CSV
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
                disabled={isSubmitting}
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer text-primary hover:text-primary/80 font-medium"
              >
                Klik untuk upload CSV
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Format: full_name,email,password,phone,npm,prodi,tenant_name,business_category
              </p>
            </div>
          </div>

          {/* Kategori Bisnis yang Valid */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Kategori Bisnis yang Valid:
            </h4>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_CATEGORIES.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Status */}
          {tenants.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                ✓ Siap mengupload {tenants.length} tenant
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || tenants.length === 0}
            >
              {isSubmitting ? 'Mengupload...' : `Upload ${tenants.length} Tenant`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
