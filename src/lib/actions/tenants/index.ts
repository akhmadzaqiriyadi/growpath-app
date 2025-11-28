'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ==========================================
// 1. FUNGSI FETCHING (DATA & STATS) - BARU
// ==========================================

// Ambil Daftar Tenant (Paginated & Search)
export async function getTenantsList({
  page = 1,
  limit = 10,
  query = '',
}: {
  page?: number;
  limit?: number;
  query?: string;
}) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc('get_tenants_paginated', {
    p_search: query,
    p_page: page,
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching tenants:', error);
    return { data: [], count: 0, error: error.message };
  }

  return {
    data: data.data,
    count: data.count,
    error: null,
  };
}

// Ambil Statistik Dashboard Tenant
export async function getTenantStats() {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc('get_tenant_dashboard_stats');

  if (error) {
    console.error('Error fetching tenant stats:', error);
    return {
      totalTenants: 0,
      activeToday: 0,
      pendingSetup: 0,
    };
  }

  return data;
}

// ==========================================
// 2. FUNGSI MUTASI (CREATE, UPDATE, DELETE) - DIKEMBALIKAN
// ==========================================

// Create Single Tenant
// Update fungsi createTenant ini:
export async function createTenant(formData: any) {
  const supabase = await createAdminClient();

  try {
    // 1. PISAHKAN DATA: Ambil password & email untuk Auth, sisanya untuk Profile
    const { password, email, ...profileData } = formData;

    // 2. VALIDASI: Pastikan password ada (karena wajib untuk login)
    if (!password) {
      return { success: false, message: 'Password wajib diisi untuk akun baru' };
    }

    // 3. STEP 1: Buat User di Supabase Auth (Sistem Login)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm agar tenant tidak perlu klik link email dulu
      user_metadata: { full_name: profileData.full_name }
    });

    if (authError) {
      console.error('Auth Error:', authError);
      // Handle jika email sudah terdaftar
      if (authError.message.includes('already been registered')) {
        return { success: false, message: 'Email ini sudah terdaftar sebagai pengguna lain.' };
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Gagal membuat user auth');
    }

    // 4. STEP 2: Masukkan Data Profil ke Tabel 'profiles'
    // Kita gunakan ID dari Auth User agar sinkron
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: authData.user.id, // PENTING: Kunci penghubung (Foreign Key)
        email: email,         // Simpan email juga di profile untuk kemudahan search
        ...profileData,       // (NPM, Nama Lengkap, Prodi, dll)
        role: 'tenant',
        created_at: new Date().toISOString(),
      },
    ]);

    if (profileError) {
      // Jika gagal buat profile, kita harus hapus user auth yang baru dibuat 
      // supaya tidak jadi data sampah (opsional tapi disarankan)
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    // 5. Refresh halaman
    revalidatePath('/tenants');
    
    return { success: true, message: 'Tenant dan akun login berhasil dibuat' };

  } catch (error: any) {
    console.error('Create tenant error:', error);
    return { success: false, message: error.message || 'Terjadi kesalahan sistem' };
  }
}

// Update Tenant
export async function updateTenant(id: string, data: any) {
  const supabase = await createAdminClient();

  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/tenants');
    
    return { success: true, message: 'Data tenant berhasil diperbarui' };
  } catch (error: any) {
    console.error('Update tenant error:', error);
    return { success: false, message: error.message };
  }
}

// Delete Tenant
export async function deleteTenant(id: string) {
  const supabase = await createAdminClient();

  try {
    // Soft delete (mengisi deleted_at) atau Hard delete tergantung kebijakan Anda.
    // Disini saya contohkan Soft Delete sesuai pola kode sebelumnya.
    const { error } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/tenants');
    
    return { success: true, message: 'Tenant berhasil dihapus' };
  } catch (error: any) {
    console.error('Delete tenant error:', error);
    return { success: false, message: error.message };
  }
}

// Bulk Create Tenants with Auth Users
export async function bulkCreateTenants(tenantsData: any[]) {
  const supabase = await createAdminClient();

  try {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each tenant one by one
    for (let i = 0; i < tenantsData.length; i++) {
      const tenant = tenantsData[i];
      
      try {
        // 1. Extract password and email for Auth
        const { password, email, ...profileData } = tenant;
        
        // Use default password if not provided
        const authPassword = password || 'password123';

        // 2. Create Auth User with metadata flag
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: authPassword,
          email_confirm: true, // Auto-confirm email
          user_metadata: { 
            full_name: profileData.full_name,
            must_reset_password: true // FLAG: User must reset password on first login
          }
        });

        if (authError) {
          results.failed++;
          results.errors.push(`${email}: ${authError.message}`);
          continue;
        }

        if (!authData.user) {
          results.failed++;
          results.errors.push(`${email}: Failed to create auth user`);
          continue;
        }

        // 3. Create Profile in database
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: authData.user.id,
            email: email,
            ...profileData,
            role: 'tenant',
            created_at: new Date().toISOString(),
          },
        ]);

        if (profileError) {
          // Rollback: Delete auth user if profile creation fails
          await supabase.auth.admin.deleteUser(authData.user.id);
          results.failed++;
          results.errors.push(`${email}: ${profileError.message}`);
          continue;
        }

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${tenant.email}: ${error.message}`);
      }
    }

    revalidatePath('/tenants');

    return { 
      success: true, 
      message: `Bulk create completed: ${results.success} success, ${results.failed} failed`,
      data: results
    };
  } catch (error: any) {
    console.error('Bulk create error:', error);
    return { success: false, message: error.message };
  }
}

// Fungsi wrapper lama (jika ada komponen yang masih memanggil getTenants biasa)
// Kita arahkan ke getTenantsList agar backward compatible
export async function getTenants() {
  const result = await getTenantsList({ page: 1, limit: 100 }); // Default ambil 100
  return {
    success: !result.error,
    data: result.data,
    message: result.error,
  };
}
