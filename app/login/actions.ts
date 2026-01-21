'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')
  const next = formData.get('next') as string || '/'
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) {
    console.error(error)
    return redirect('/login?message=Could not authenticate user')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function sendOtp(email: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true, 
    }
  })

  if (error) {
    return { error: error.message }
  }
  return { success: true }
}

export async function verifyOtp(email: string, token: string, nextUrl: string = '/') {
  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    return { error: error.message }
  }

  redirect(nextUrl)
}