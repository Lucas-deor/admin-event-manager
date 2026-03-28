import { createClient } from '@/lib/supabase/server'

export async function fetchDashboardMetrics() {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  // Total Events this month
  const { count: eventsThisMonth } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gte('event_date', startOfMonth)
    .lte('event_date', endOfMonth)

  // Total Pending Payments
  const { data: pendingPayments } = await supabase
    .from('payments')
    .select('installment_value')
    .eq('status', 'pending')

  const totalPendingPayments = pendingPayments?.reduce((sum, payment) => sum + Number(payment.installment_value), 0) || 0

  return {
    eventsThisMonth: eventsThisMonth || 0,
    totalPendingPayments
  }
}

export async function fetchUpcomingEvents(limit = 5) {
  const supabase = await createClient()
  const today = new Date().toISOString()

  const { data } = await supabase
    .from('events')
    .select(`
      id,
      event_date,
      status,
      total_value,
      guest_count,
      customers (
        full_name
      )
    `)
    .eq('status', 'confirmed')
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(limit)

  return data || []
}

export async function fetchRecentBookings(limit = 5) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('events')
    .select(`
      id,
      created_at,
      event_date,
      status,
      total_value,
      customers (
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}
