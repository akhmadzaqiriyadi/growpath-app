'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Signs in a user using their email and password.
 * @param formData - The form data containing the email and password.
 */
export async function signIn(formData: FormData): Promise<{ error: string } | void> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  // Asumsi: createClient() sudah me-return Promise<SupabaseClient>
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login Gagal:', error.message);
    // 1. KEMBALIKAN OBJEK ERROR: Agar dapat ditangkap oleh UI (LoginPage.tsx)
    return { error: 'Login gagal: Email atau kata sandi tidak valid.' }; 
  }

  // 2. Jika berhasil, lakukan revalidate dan redirect (redirect akan menghentikan eksekusi)
  revalidatePath('/', 'layout')
  redirect('/admin') 
}
/**
 * Signs out the current user.
 */
export async function signOut() {
  // PERBAIKAN: Tambahkan 'await' di sini juga
  const supabase = await createClient()
  
  await supabase.auth.signOut()
  redirect('/login')
}