'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCalendarLocks() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('calendar_locks')
    .select('*')
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Error fetching locks:', error)
    throw new Error('Não foi possível carregar os bloqueios')
  }

  return data
}

export async function createCalendarLock(formData: FormData) {
  const supabase = await createClient()
  
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string
  const reason = formData.get('reason') as string

  if (!startDate || !endDate) {
    throw new Error('Data de início e fim são obrigatórias')
  }
  
  if (new Date(startDate) > new Date(endDate)) {
    throw new Error('Data de início não pode ser maior que a data de fim')
  }

  // Check if there are events in this date range that are not cancelled
  const { data: overlappingEvents } = await supabase
    .from('events')
    .select('id')
    .gte('event_date', startDate)
    .lte('event_date', endDate)
    .neq('status', 'cancelled')

  if (overlappingEvents && overlappingEvents.length > 0) {
    throw new Error('Você não pode bloquear este período pois existem eventos já marcados nestas datas.')
  }

  const { data, error } = await supabase
    .from('calendar_locks')
    .insert([{
      start_date: startDate,
      end_date: endDate,
      reason: reason || null
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating lock:', error)
    throw new Error('Erro ao criar bloqueio de calendário')
  }

  revalidatePath('/calendar')
  return data
}

export async function deleteCalendarLock(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('calendar_locks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting lock:', error)
    throw new Error('Erro ao excluir bloqueio')
  }

  revalidatePath('/calendar')
  return true
}
