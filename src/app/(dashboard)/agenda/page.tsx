export const dynamic = 'force-dynamic'

import { format } from 'date-fns'
import { getEventsByMonth } from '../events/actions'
import { getCalendarLocks } from '../calendar/actions'
import { AgendaCalendar } from './AgendaCalendar'

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const monthParam = typeof params.month === 'string' ? params.month : undefined
  const month = /^\d{4}-\d{2}$/.test(monthParam || '')
    ? (monthParam as string)
    : format(new Date(), 'yyyy-MM')

  const events = await getEventsByMonth(month)
  const locks = await getCalendarLocks()

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-4 md:p-6">
      <div className="space-y-1 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
        <p className="text-muted-foreground">
          Calendário mensal com todos os eventos.
        </p>
      </div>

      <AgendaCalendar month={month} events={events} locks={locks} />
    </div>
  )
}
