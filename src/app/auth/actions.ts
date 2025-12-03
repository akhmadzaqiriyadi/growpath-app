'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Signs in a user using their email and password.
 * @param formData - The form data containing the email and password.
 */
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
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

/**
 * Updates user password from profile page.
 */
export async function updatePassword(formData: FormData) {
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!newPassword || !confirmPassword) {
    return { success: false, message: 'Password fields are required' }
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: 'Passwords do not match' }
  }

  if (newPassword.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters' }
  }

  const supabase = await createClient()

  // Update password
  const { error: passwordError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (passwordError) {
    return { success: false, message: passwordError.message }
  }

  return { success: true, message: 'Password berhasil diperbarui' }
}