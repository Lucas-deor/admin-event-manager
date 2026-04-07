'use server'

import { createClient } from '@/lib/supabase/server'

type AvailabilityStatus = 'available' | 'occupied'
type OccupiedReason = 'event' | 'lock'

export type DateAvailabilityResult = {
  date: string
  status: AvailabilityStatus
  reasons: OccupiedReason[]
}

function isValidDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export async function checkDatesAvailability(dateKeys: string[]): Promise<DateAvailabilityResult[]> {
  const normalizedDates = Array.from(
    new Set(
      (dateKeys || [])
        .map((date) => (date || '').trim())
        .filter((date) => isValidDateKey(date))
    )
  ).sort()

  if (normalizedDates.length === 0) {
    return []
  }

  const fromDate = normalizedDates[0]
  const toDate = normalizedDates[normalizedDates.length - 1]

  const supabase = await createClient()

  const [{ data: events, error: eventsError }, { data: locks, error: locksError }] = await Promise.all([
    supabase
      .from('events')
      .select('event_date')
      .in('event_date', normalizedDates)
      .neq('status', 'cancelled'),
    supabase
      .from('calendar_locks')
      .select('start_date, end_date')
      .lte('start_date', toDate)
      .gte('end_date', fromDate),
  ])

  if (eventsError) {
    console.error('Error checking date availability (events):', eventsError)
    throw new Error('Não foi possível verificar a disponibilidade das datas')
  }

  if (locksError) {
    console.error('Error checking date availability (locks):', locksError)
    throw new Error('Não foi possível verificar a disponibilidade das datas')
  }

  const occupiedByEvent = new Set((events || []).map((event) => event.event_date))

  return normalizedDates.map((date) => {
    const reasons: OccupiedReason[] = []

    if (occupiedByEvent.has(date)) {
      reasons.push('event')
    }

    const isLocked = (locks || []).some((lock) => lock.start_date <= date && lock.end_date >= date)
    if (isLocked) {
      reasons.push('lock')
    }

    return {
      date,
      status: reasons.length > 0 ? 'occupied' : 'available',
      reasons,
    }
  })
}
