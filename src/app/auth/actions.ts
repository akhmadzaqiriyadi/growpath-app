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
  
  // PERBAIKAN: Tambahkan 'await' di sini
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
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