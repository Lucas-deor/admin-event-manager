import { createClient } from '@/lib/supabase/server'
import { fetchDashboardMetrics, fetchRecentBookings, fetchUpcomingEvents, fetchAdminCommissions } from './queries'
import { DashboardGrid } from './DashboardGrid'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [metrics, upcomingEvents, recentBookings, commissions] = await Promise.all([
    fetchDashboardMetrics(),
    fetchUpcomingEvents(5),
    fetchRecentBookings(5),
    fetchAdminCommissions(),
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 mt-2">
          Bem-vindo de volta. Aqui está o resumo dos eventos da fazenda.
        </p>
      </header>

      <DashboardGrid 
        userEmail={user?.email || 'guest'}
        metrics={metrics}
        upcomingEvents={upcomingEvents}
        recentBookings={recentBookings}
        commissions={commissions}
      />
    </div>
  )
}

