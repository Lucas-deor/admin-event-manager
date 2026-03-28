'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCustomers(options?: {
  search?: string
  page?: number
  limit?: number
  sort?: string
  order?: string
}) {
  const supabase = await createClient()
  const { search = '', page = 1, limit, sort = 'created_at', order = 'desc' } = options || {}

  let query = supabase.from('customers').select('*', { count: 'exact' })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  query = query.order(sort, { ascending: order === 'asc' })

  if (limit) {
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching customers:', error)
    throw new Error('Não foi possível carregar os clientes')
  }

  return { customers: data, count: count || 0 }
}

export async function createCustomer(formData: FormData) {
  const supabase = await createClient()
  
  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string || null
  const documentId = formData.get('document_id') as string || null

  if (!fullName || !email) {
    throw new Error('Nome e e-mail são obrigatórios')
  }

  const { data, error } = await supabase
    .from('customers')
    .insert([{
      full_name: fullName,
      email: email,
      phone: phone,
      document_id: documentId
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating customer:', error)
    throw new Error('Erro ao criar cliente')
  }

  revalidatePath('/customers')
  return data
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string || null
  const documentId = formData.get('document_id') as string || null

  if (!fullName || !email) {
    throw new Error('Nome e e-mail são obrigatórios')
  }

  const { data, error } = await supabase
    .from('customers')
    .update({
      full_name: fullName,
      email: email,
      phone: phone,
      document_id: documentId
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating customer:', error)
    throw new Error('Erro ao atualizar cliente')
  }

  revalidatePath('/customers')
  return data
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting customer:', error)
    throw new Error('Erro ao excluir cliente (pode possuir eventos vinculados)')
  }

  revalidatePath('/customers')
  return true
}
