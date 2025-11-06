import { z } from 'zod';

// Business categories sesuai dengan enum di database
export const BUSINESS_CATEGORIES = [
  'Kuliner',
  'Fashion',
  'Kerajinan',
  'Jasa',
  'Industri',
  'Bisnis Digital',
  'Other',
] as const;

// Schema untuk create single tenant
export const createTenantSchema = z.object({
  full_name: z.string().min(3, 'Nama lengkap minimal 3 karakter').max(100),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  phone: z.string().optional(),
  npm: z.string().min(10, 'NPM harus 10 digit').max(10, 'NPM harus 10 digit'),
  prodi: z.string().min(2, 'Program studi wajib diisi'),
  tenant_name: z.string().min(3, 'Nama usaha minimal 3 karakter').max(100),
  business_category: z.enum(BUSINESS_CATEGORIES),
});

// Schema untuk update tenant (password optional)
export const updateTenantSchema = z.object({
  full_name: z.string().min(3, 'Nama lengkap minimal 3 karakter').max(100),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  phone: z.string().optional(),
  npm: z.string().min(10, 'NPM harus 10 digit').max(10, 'NPM harus 10 digit'),
  prodi: z.string().min(2, 'Program studi wajib diisi'),
  tenant_name: z.string().min(3, 'Nama usaha minimal 3 karakter').max(100),
  business_category: z.enum(BUSINESS_CATEGORIES),
});

// Schema untuk bulk create (array of tenants)
export const bulkCreateTenantsSchema = z.array(createTenantSchema).min(1, 'Minimal 1 tenant');

// Types
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type BulkCreateTenantsInput = z.infer<typeof bulkCreateTenantsSchema>;
