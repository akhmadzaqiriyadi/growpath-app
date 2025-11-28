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

  // Check if user must reset password (for bulk-created tenants)
  if (data.user?.user_metadata?.must_reset_password === true) {
    revalidatePath('/', 'layout')
    return redirect('/auth/change-password?required=true')
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
 * Updates user password and clears the must_reset_password flag.
 * Used for forced password reset after bulk tenant creation.
 */
export async function updatePassword(formData: FormData) {
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!newPassword || !confirmPassword) {
    return redirect('/auth/change-password?error=Password fields are required')
  }

  if (newPassword !== confirmPassword) {
    return redirect('/auth/change-password?error=Passwords do not match')
  }

  if (newPassword.length < 8) {
    return redirect('/auth/change-password?error=Password must be at least 8 characters')
  }

  const supabase = await createClient()

  // Update password
  const { error: passwordError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (passwordError) {
    return redirect(`/auth/change-password?error=${encodeURIComponent(passwordError.message)}`)
  }

  // Clear the must_reset_password flag from user metadata
  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      must_reset_password: false
    }
  })

  if (metadataError) {
    console.error('Failed to update metadata:', metadataError)
    // Don't fail the entire operation if metadata update fails
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard?message=Password updated successfully')
}