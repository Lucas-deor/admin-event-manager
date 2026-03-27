'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginWithOtp(formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) {
    return { error: 'E-mail é obrigatório' }
  }

  const supabase = await createClient()

  // Verifica se o usuário tem permissão (está na tabela admin_users)
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .single()

  if (adminError || !adminUser) {
    return { error: 'Acesso negado: E-mail não autorizado.' }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function verifyOtp(formData: FormData) {
  const email = formData.get('email') as string
  const token = formData.get('token') as string

  if (!email || !token) {
    return { error: 'E-mail e código são obrigatórios' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    return { error: 'Código inválido ou expirado.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
