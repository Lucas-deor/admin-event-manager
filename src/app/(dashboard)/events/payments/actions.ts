'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type PaymentInsert = Database['public']['Tables']['payments']['Insert']
type PaymentUpdate = Database['public']['Tables']['payments']['Update']

export async function getPayments(eventId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('event_id', eventId)
    .order('due_date', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function createPayment(data: PaymentInsert) {
  const supabase = await createClient()
  
  // Preventive check: if inserting as pending but date is past, change to overdue
  if (data.status === 'pending' && data.due_date) {
    const today = new Date().toISOString().split('T')[0]
    if (data.due_date < today) {
      data.status = 'overdue'
    }
  }

  const { error } = await supabase
    .from('payments')
    .insert(data)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/(dashboard)/events', 'page')
}

export async function updatePayment(id: string, data: PaymentUpdate) {
  const supabase = await createClient()
  
  // Preventive check: if updating to pending but date is past, change to overdue
  if (data.status === 'pending' && data.due_date) {
    const today = new Date().toISOString().split('T')[0]
    if (data.due_date < today) {
      data.status = 'overdue'
    }
  }

  const { error } = await supabase
    .from('payments')
    .update(data)
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/(dashboard)/events', 'page')
}

export async function deletePayment(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/(dashboard)/events', 'page')
}
