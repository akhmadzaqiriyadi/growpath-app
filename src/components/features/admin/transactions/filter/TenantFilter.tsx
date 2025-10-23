'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../ui/select";

// Definisikan tipe untuk Profile
type Profile = {
  id: string;
  tenant_name: string | null;
}

// Definisikan tipe untuk Props
type TenantFilterProps = {
  profiles: Profile[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export default function TenantFilter({ profiles, selectedValue, onValueChange }: TenantFilterProps) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <label htmlFor="tenant-filter" className="block text-sm font-medium text-gray-700 mb-2">
        Filter Berdasarkan Tenant
      </label>
      <Select 
        value={selectedValue} 
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-full md:w-[280px]" id="tenant-filter">
          <SelectValue placeholder="Pilih Tenant" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tenant</SelectItem>
          {profiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              {profile.tenant_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}