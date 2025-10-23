'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortControlProps = {
  selectedValue: 'desc' | 'asc';
  onValueChange: (value: 'desc' | 'asc') => void;
}

export default function SortControl({ selectedValue, onValueChange }: SortControlProps) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <label htmlFor="sort-control" className="block text-sm font-medium text-gray-700 mb-2">
        Urutkan Berdasarkan
      </label>
      <Select 
        value={selectedValue} 
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-full md:w-[280px]" id="sort-control">
          <SelectValue placeholder="Pilih Urutan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Tanggal Terbaru</SelectItem>
          <SelectItem value="asc">Tanggal Terlama</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}