'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DateSortControlProps = {
  selectedValue: string;
  onValueChange: (value: 'desc' | 'asc') => void;
}

export default function DateSortControl({ selectedValue, onValueChange }: DateSortControlProps) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <label htmlFor="date-sort-control" className="block text-sm font-medium text-gray-700 mb-2">
        Urutkan Tanggal
      </label>
      <Select 
        value={selectedValue} 
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-full md:w-[280px]" id="date-sort-control">
          <SelectValue placeholder="Pilih Urutan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Terbaru</SelectItem>
          <SelectItem value="asc">Terlama</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}