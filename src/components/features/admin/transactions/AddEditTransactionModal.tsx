'use client';

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBrowserClient } from "@supabase/ssr";
import { TransactionWithProfile, ProfileForFilter } from '@/lib/types';

// --- 2. Gunakan tipe yang benar untuk props ---
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit: TransactionWithProfile | null;
  allTenants: ProfileForFilter[];
};

export default function AddEditTransactionModal({ isOpen, onClose, onSuccess, transactionToEdit, allTenants }: ModalProps) {
  const [tenantId, setTenantId] = useState('');
  const [type, setType] = useState('PEMASUKAN');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [transactionDate, setTransactionDate] = useState('')
  const [receiptUrl, setReceiptUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Efek ini akan mengisi form saat mode "Edit" diaktifkan
  useEffect(() => {
    if (transactionToEdit) {
      setTenantId(transactionToEdit.tenant_id);
      setType(transactionToEdit.type);
      setAmount(String(Math.abs(transactionToEdit.amount))); // Selalu positif di form
      setNote(transactionToEdit.note || '');
      setTransactionDate(transactionToEdit.transaction_date);
      setReceiptUrl(transactionToEdit.receipt_url || '');
    } else {
      // Reset form saat mode "Tambah"
      setTenantId('');
      setType('PEMASUKAN');
      setAmount('');
      setNote('');
      setTransactionDate(new Date().toISOString().split('T')[0]); // Default ke hari ini
      setReceiptUrl('');
    }
  }, [transactionToEdit, isOpen]); // Dijalankan ulang saat `transactionToEdit` atau `isOpen` berubah

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const finalAmount = type === 'PEMASUKAN' ? Number(amount) : -Number(amount);
    
    const transactionData = {
      tenant_id: tenantId,
      type,
      amount: finalAmount,
      note,
      transaction_date: transactionDate, // Sertakan tanggal
      receipt_url: receiptUrl // Sertakan URL bukti
    };

    if (transactionToEdit) {
      // Mode EDIT: panggil .update()
      const { error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', transactionToEdit.id);
      
      if (error) console.error("Update error:", error);
    } else {
      // Mode TAMBAH: panggil .insert()
      const { error } = await supabase
        .from('transactions')
        .insert(transactionData);
        
      if (error) console.error("Insert error:", error);
    }

    setIsSubmitting(false);
    onSuccess(); // Beri tahu parent untuk refresh data
    onClose(); // Tutup modal
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transactionToEdit ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tenant" className="text-right">Tenant</Label>
            <Select value={tenantId} onValueChange={setTenantId} disabled={!!transactionToEdit}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Tenant" />
              </SelectTrigger>
              <SelectContent>
                {allTenants.map(tenant => (
                  <SelectItem key={tenant.id} value={tenant.id}>{tenant.tenant_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Tipe</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PEMASUKAN">Pemasukan</SelectItem>
                <SelectItem value="PENGELUARAN">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Jumlah (Rp)</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note" className="text-right">Catatan</Label>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Tanggal</Label>
            <Input id="date" type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="receipt" className="text-right">URL Bukti</Label>
            <Input id="receipt" value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}