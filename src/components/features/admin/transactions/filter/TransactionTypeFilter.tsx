'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../ui/select";

// Definisikan tipe untuk Props
type TransactionTypeFilterProps = {
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export default function TransactionTypeFilter({ selectedValue, onValueChange }: TransactionTypeFilterProps) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
        Filter Berdasarkan Tipe
      </label>
      <Select 
        value={selectedValue} 
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-full md:w-[280px]" id="type-filter">
          <SelectValue placeholder="Pilih Tipe Transaksi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tipe</SelectItem>
          <SelectItem value="PEMASUKAN">Pemasukan</SelectItem>
          <SelectItem value="PENGELUARAN">Pengeluaran</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}