// src/components/admin/TransactionTable.tsx

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button"; // <-- 1. Import Button
import { ExternalLink } from "lucide-react"; // <-- 2. Import ikon (opsional tapi bagus)
import { Edit } from 'lucide-react'
import { TransactionWithProfile } from "@/lib/types";


type TransactionTableProps = {
  transactions: TransactionWithProfile[]
  onEdit: (Transaction: TransactionWithProfile) => void
}

// Komponen ini menerima 'transactions' sebagai properti (props)
export default function TransactionTable({ transactions, onEdit }: TransactionTableProps) {
  
  // Fungsi helper untuk format mata uang Rupiah
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Fungsi helper untuk format tanggal
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableCaption>Daftar semua transaksi dari seluruh tenant.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Nama Tenant</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
            <TableHead className="text-center">Bukti</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {/* Menggunakan optional chaining (?) untuk keamanan jika data profiles null */}
                {transaction.profiles?.tenant_name ?? 'Tenant Tidak Ditemukan'}
              </TableCell>
              <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
              <TableCell>
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    transaction.type === 'PEMASUKAN' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {transaction.type}
                </span>
              </TableCell>
              <TableCell>{transaction.note ?? '-'}</TableCell>
              <TableCell className={`text-right font-semibold ${
                  transaction.type === 'PEMASUKAN' ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell className="text-center">
                {transaction.receipt_url ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={transaction.receipt_url} target="_blank" rel="noopener noreferrer">
                      Lihat
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Button onClick={() => onEdit(transaction)} size='icon' variant="ghost">Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}