'use server';

// Pastikan path import ini sesuai dengan lokasi file helper supabase Anda
import { createAdminClient } from '@/lib/supabase/server'; 

export async function getRecentActivity(limit: number = 5) {
  const supabase = await createAdminClient();

  // Memanggil fungsi database yang sudah kita buat tadi
  const { data, error } = await supabase.rpc('get_recent_activity', {
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching recent activity:', error);
    // Mengembalikan array kosong agar frontend tidak error/crash
    return { data: [], error: error.message }; 
  }

  return { data, error: null };
}