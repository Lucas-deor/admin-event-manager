import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { fetchDashboardMetrics, fetchRecentBookings, fetchUpcomingEvents } from './queries'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  await supabase.auth.getUser()

  const [metrics, upcomingEvents, recentBookings] = await Promise.all([
    fetchDashboardMetrics(),
    fetchUpcomingEvents(5),
    fetchRecentBookings(5),
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 mt-2">
          Bem-vindo de volta. Aqui está o resumo dos eventos da fazenda.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Eventos este mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-stone-900">
              {metrics.eventsThisMonth}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Pagamentos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-stone-900">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(metrics.totalPendingPayments)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos Confirmados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Convidados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-stone-500 py-4">
                      Nenhum evento próximo.
                    </TableCell>
                  </TableRow>
                ) : (
                  upcomingEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        {(event.customers as any)?.full_name || 'Desconhecido'}
                      </TableCell>
                      <TableCell>
                        {`${event.event_date.substring(8, 10)}/${event.event_date.substring(5, 7)}/${event.event_date.substring(0, 4)}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {event.guest_count}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reservas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Data do Evento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-stone-500 py-4">
                      Nenhuma reserva recente.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {(booking.customers as any)?.full_name || 'Desconhecido'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            booking.status === 'confirmed'
                              ? 'default'
                              : booking.status === 'pending'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {booking.status === 'confirmed'
                            ? 'Confirmado'
                            : booking.status === 'pending'
                            ? 'Pendente'
                            : booking.status === 'finished'
                            ? 'Finalizado'
                            : 'Cancelado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {`${booking.event_date.substring(8, 10)}/${booking.event_date.substring(5, 7)}/${booking.event_date.substring(0, 4)}`}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}