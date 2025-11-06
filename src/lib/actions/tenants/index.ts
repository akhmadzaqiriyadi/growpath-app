'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import {
  createTenantSchema,
  updateTenantSchema,
  type CreateTenantInput,
  type UpdateTenantInput,
} from '@/lib/validations/tenant';
import { revalidatePath } from 'next/cache';

type ActionResult<T = null> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

/**
 * Get all tenants (admin only)
 */
export async function getTenants(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { success: false, message: 'Only admin can access this' };
    }

    // Get all tenants
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'tenant')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tenants:', error);
      return { success: false, message: 'Failed to fetch tenants', error: error.message };
    }

    return {
      success: true,
      message: 'Tenants fetched successfully',
      data: data || [],
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

/**
 * Create single tenant (admin only)
 */
export async function createTenant(input: CreateTenantInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { success: false, message: 'Only admin can create tenants' };
    }

    // Validate input
    const validatedData = createTenantSchema.parse(input);

    // Check if email or NPM already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email, npm')
      .or(`email.eq.${validatedData.email},npm.eq.${validatedData.npm}`)
      .single();

    if (existingUser) {
      return {
        success: false,
        message: existingUser.email === validatedData.email 
          ? 'Email sudah digunakan' 
          : 'NPM sudah terdaftar',
      };
    }

    // Create admin client for auth operations
    const adminClient = await createAdminClient();
    
    // Create auth user with service role
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError || !authData.user) {
      console.error('Auth error:', authError);
      return {
        success: false,
        message: 'Failed to create user account',
        error: authError?.message,
      };
    }

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        role: 'tenant',
        full_name: validatedData.full_name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        npm: validatedData.npm,
        prodi: validatedData.prodi,
        tenant_name: validatedData.tenant_name,
        business_category: validatedData.business_category,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      // Rollback: delete auth user using admin client
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        message: 'Failed to create profile',
        error: profileError.message,
      };
    }

    revalidatePath('/admin/tenants');

    return {
      success: true,
      message: 'Tenant berhasil dibuat',
      data: profileData,
    };
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      message: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Bulk create tenants (admin only)
 */
export async function bulkCreateTenants(
  tenants: CreateTenantInput[]
): Promise<ActionResult<{ success: number; failed: number; errors: string[] }>> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { success: false, message: 'Only admin can bulk create tenants' };
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Process each tenant
    for (const tenant of tenants) {
      try {
        const result = await createTenant(tenant);
        if (result.success) {
          successCount++;
        } else {
          failedCount++;
          errors.push(`${tenant.email}: ${result.message}`);
        }
      } catch (error: any) {
        failedCount++;
        errors.push(`${tenant.email}: ${error.message}`);
      }
    }

    revalidatePath('/admin/tenants');

    return {
      success: true,
      message: `Bulk create completed: ${successCount} success, ${failedCount} failed`,
      data: { success: successCount, failed: failedCount, errors },
    };
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      message: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Update tenant (admin only)
 */
export async function updateTenant(
  tenantId: string,
  input: UpdateTenantInput
): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { success: false, message: 'Only admin can update tenants' };
    }

    // Validate input
    const validatedData = updateTenantSchema.parse(input);

    // Check if email or NPM already exists (excluding current tenant)
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, email, npm')
      .or(`email.eq.${validatedData.email},npm.eq.${validatedData.npm}`)
      .neq('id', tenantId)
      .single();

    if (existingUser) {
      return {
        success: false,
        message: existingUser.email === validatedData.email 
          ? 'Email sudah digunakan' 
          : 'NPM sudah terdaftar',
      };
    }

    // Update profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: validatedData.full_name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        npm: validatedData.npm,
        prodi: validatedData.prodi,
        tenant_name: validatedData.tenant_name,
        business_category: validatedData.business_category,
      })
      .eq('id', tenantId)
      .select()
      .single();

    if (profileError) {
      console.error('Profile update error:', profileError);
      return {
        success: false,
        message: 'Failed to update profile',
        error: profileError.message,
      };
    }

    // Update password if provided
    if (validatedData.password) {
      const adminClient = await createAdminClient();
      const { error: passwordError } = await adminClient.auth.admin.updateUserById(
        tenantId,
        { password: validatedData.password }
      );

      if (passwordError) {
        console.error('Password update error:', passwordError);
        // Don't fail the whole update if password fails
      }
    }

    revalidatePath('/admin/tenants');

    return {
      success: true,
      message: 'Tenant berhasil diupdate',
      data: profileData,
    };
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      message: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Delete tenant (soft delete - admin only)
 */
export async function deleteTenant(tenantId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { success: false, message: 'Only admin can delete tenants' };
    }

    // Soft delete (set deleted_at)
    const { error } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', tenantId);

    if (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        message: 'Failed to delete tenant',
        error: error.message,
      };
    }

    revalidatePath('/admin/tenants');

    return {
      success: true,
      message: 'Tenant berhasil dihapus',
    };
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      message: error?.message || 'An unexpected error occurred',
    };
  }
}
