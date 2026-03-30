'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getEvents({
  search,
  status,
  fromDate,
  toDate,
  sort,
  order,
  page = 1,
  limit = 10
}: {
  search?: string
  status?: string[]
  fromDate?: string
  toDate?: string
  sort?: string
  order?: string
  page?: number
  limit?: number
} = {}) {
  const supabase = await createClient()
  
  // Notice we need the customer name, so we join customers
  // We use !inner so that filtering by joined table works properly
  let query = supabase
    .from('events')
    .select(`
      *,
      customers!inner ( full_name )
    `, { count: 'exact' })

  if (search) {
    query = query.ilike('customers.full_name', `%${search}%`)
  }

  if (status && status.length > 0) {
    query = query.in('status', status)
  }

  if (fromDate) {
    query = query.gte('event_date', fromDate)
  }

  if (toDate) {
    query = query.lte('event_date', toDate)
  }

  const orderBy = sort || 'event_date'
  const isAscending = order ? order === 'asc' : true

  query = query.order(orderBy, { ascending: isAscending })

  if (limit) {
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching events:', error)
    throw new Error('Não foi possível carregar os eventos')
  }

  return { events: data, count: count || 0 }
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  
  const customerId = formData.get('customer_id') as string
  const eventDate = formData.get('event_date') as string
  const status = (formData.get('status') as "pending" | "confirmed" | "finished" | "cancelled") || 'pending'
  const guestCount = parseInt(formData.get('guest_count') as string) || 0
  const totalValue = parseFloat(formData.get('total_value') as string) || 0
  const description = formData.get('description') as string | null

  if (!customerId || !eventDate) {
    throw new Error('Cliente e data são obrigatórios')
  }

  // Check constraints for events
  const { data: existingEvents } = await supabase
    .from('events')
    .select('id')
    .eq('event_date', eventDate)
    .neq('status', 'cancelled')
  
  if (existingEvents && existingEvents.length > 0) {
    throw new Error('Já existe um evento marcado para esta data.')
  }

  // Check for calendar_locks
  const { data: locks } = await supabase
    .from('calendar_locks')
    .select('id')
    .lte('start_date', eventDate)
    .gte('end_date', eventDate)

  if (locks && locks.length > 0) {
    throw new Error('Esta data está bloqueada no calendário para manutenção/férias.')
  }

  const { data, error } = await supabase
    .from('events')
    .insert([{
      customer_id: customerId,
      event_date: eventDate,
      status: status,
      guest_count: guestCount,
      total_value: totalValue,
      description: description || null
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating event:', error)
    throw new Error('Erro ao criar evento')
  }

  revalidatePath('/events')
  return data
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const customerId = formData.get('customer_id') as string
  const eventDate = formData.get('event_date') as string
  const status = formData.get('status') as "pending" | "confirmed" | "finished" | "cancelled"
  const guestCount = parseInt(formData.get('guest_count') as string) || 0
  const totalValue = parseFloat(formData.get('total_value') as string) || 0
  const description = formData.get('description') as string | null

  if (!customerId || !eventDate) {
    throw new Error('Cliente e data são obrigatórios')
  }

  // Check overlap only if date changed or we aren't this event
  const { data: existingEvents } = await supabase
    .from('events')
    .select('id')
    .eq('event_date', eventDate)
    .neq('id', id)
    .neq('status', 'cancelled')
    
  if (existingEvents && existingEvents.length > 0) {
    throw new Error('Já existe um evento marcado para esta data.')
  }

  // Check for calendar_locks
  const { data: locks } = await supabase
    .from('calendar_locks')
    .select('id')
    .lte('start_date', eventDate)
    .gte('end_date', eventDate)

  if (locks && locks.length > 0) {
    throw new Error('Esta data está bloqueada no calendário para manutenção/férias.')
  }

  const { data, error } = await supabase
    .from('events')
    .update({
      customer_id: customerId,
      event_date: eventDate,
      status: status,
      guest_count: guestCount,
      total_value: totalValue,
      description: description || null
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating event:', error)
    throw new Error('Erro ao atualizar evento')
  }

  revalidatePath('/events')
  return data
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting event:', error)
    throw new Error('Erro ao excluir evento (pode haver pagamentos pendentes)')
  }

  revalidatePath('/events')
  return true
}
export async function getAllActiveEvents() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('events').select('event_date, status').neq('status', 'cancelled')
  if (error) throw new Error(error.message)
  return data
}
