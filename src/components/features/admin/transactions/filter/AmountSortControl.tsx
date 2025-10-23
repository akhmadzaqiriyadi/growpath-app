'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AmountSortControlProps = {
  selectedValue: string;
  onValueChange: (value: 'desc' | 'asc' | 'off') => void;
}

export default function AmountSortControl({ selectedValue, onValueChange }: AmountSortControlProps) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <label htmlFor="amount-sort-control" className="block text-sm font-medium text-gray-700 mb-2">
        Urutkan Jumlah
      </label>
      <Select 
        value={selectedValue} 
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-full md:w-[280px]" id="amount-sort-control">
          <SelectValue placeholder="Pilih Urutan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="off">Standar (berdasarkan tanggal)</SelectItem>
          <SelectItem value="desc">Tertinggi</SelectItem>
          <SelectItem value="asc">Terendah</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}