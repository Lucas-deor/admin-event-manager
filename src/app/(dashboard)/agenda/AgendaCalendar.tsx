'use client'

import { useMemo, useState } from 'react'
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EventDetailsDialog } from '../events/EventDetailsDialog'
import { Database } from '@/types/database'

type DbCustomer = { full_name: string } | null
type DbAdmin = { name: string | null; email: string | null } | null
type CalendarLock = Database['public']['Tables']['calendar_locks']['Row']
type AgendaEvent = Database['public']['Tables']['events']['Row'] & {
  customers: DbCustomer | DbCustomer[]
  admin_users?: DbAdmin | DbAdmin[]
}

const weekdayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'text-yellow-600' },
  confirmed: { label: 'Confirmado', className: 'text-blue-600' },
  finished: { label: 'Concluído', className: 'text-green-600' },
  cancelled: { label: 'Cancelado', className: 'text-red-600' },
}

function getCustomerName(customer: DbCustomer | DbCustomer[]) {
  if (Array.isArray(customer)) {
    return customer[0]?.full_name || 'Desconhecido'
  }

  return customer?.full_name || 'Desconhecido'
}

function getMonthDate(month: string) {
  return new Date(`${month}-01T12:00:00`)
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split('-')
  return `${day}/${month}/${year}`
}

export function AgendaCalendar({
  month,
  events,
  locks,
}: {
  month: string
  events: AgendaEvent[]
  locks: CalendarLock[]
}) {
  const router = useRouter()
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [dayListOpen, setDayListOpen] = useState(false)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)

  const monthDate = useMemo(() => getMonthDate(month), [month])

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, AgendaEvent[]>()

    for (const event of events) {
      const dateKey = event.event_date
      const dayEvents = grouped.get(dateKey) || []
      dayEvents.push(event)
      grouped.set(dateKey, dayEvents)
    }

    return grouped
  }, [events])

  const days = useMemo(() => {
    const calendarStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [monthDate])

  const locksByDate = useMemo(() => {
    const grouped = new Map<string, CalendarLock[]>()

    for (const day of days) {
      const dateKey = format(day, 'yyyy-MM-dd')
      const dayLocks = locks.filter((lock) => lock.start_date <= dateKey && lock.end_date >= dateKey)
      if (dayLocks.length > 0) {
        grouped.set(dateKey, dayLocks)
      }
    }

    return grouped
  }, [days, locks])

  const handleNavigateMonth = (offset: number) => {
    const nextMonth = format(addMonths(monthDate, offset), 'yyyy-MM')
    router.push(`/agenda?month=${nextMonth}`)
  }

  const openDetails = (event: AgendaEvent) => {
    setSelectedEvent(event)
    setDetailsOpen(true)
  }

  const openDayList = (dateKey: string) => {
    setSelectedDateKey(dateKey)
    setDayListOpen(true)
  }

  const selectedDayEvents = selectedDateKey ? (eventsByDate.get(selectedDateKey) || []) : []

  return (
    <>
      <div className="space-y-4 rounded-lg border bg-background p-4 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={() => handleNavigateMonth(-1)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Mês anterior
          </Button>

          <h2 className="text-lg font-semibold md:text-2xl">
            {format(monthDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </h2>

          <Button variant="outline" size="sm" onClick={() => handleNavigateMonth(1)}>
            Próximo mês
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground md:text-sm">
          {weekdayLabels.map((label) => (
            <div key={label} className="py-2">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDate.get(dateKey) || []
            const dayLocks = locksByDate.get(dateKey) || []
            const visibleEvents = dayEvents.slice(0, 2)
            const hiddenCount = dayEvents.length - visibleEvents.length

            return (
              <div
                key={dateKey}
                className="min-h-36 rounded-md border bg-card p-2 md:min-h-44"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium md:text-sm ${
                      isToday(day)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {!isSameMonth(day, monthDate) && (
                    <span className="text-[10px] text-muted-foreground md:text-xs">Outro mês</span>
                  )}
                </div>

                <div className="space-y-2">
                  {dayLocks.map((lock) => (
                    <div key={lock.id} className="w-full rounded-md border border-destructive/30 bg-destructive/10 p-2 text-left">
                      <p className="truncate text-xs font-medium md:text-sm">Bloqueado</p>
                      <p
                        className="mt-1 truncate text-[11px] text-muted-foreground md:text-xs"
                        title={lock.reason || 'Sem motivo informado'}
                      >
                        {lock.reason || 'Sem motivo informado'}
                      </p>
                    </div>
                  ))}

                  {visibleEvents.map((event) => {
                    const statusInfo = statusMap[event.status] || {
                      label: event.status,
                      className: 'text-muted-foreground',
                    }

                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => openDetails(event)}
                        className="w-full cursor-pointer rounded-md border bg-background p-2 text-left transition-colors hover:bg-muted"
                      >
                        <p className="truncate text-xs font-medium md:text-sm">
                          {getCustomerName(event.customers)}
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="truncate text-[11px] text-muted-foreground md:text-xs">
                            {event.total_value.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </span>
                          <span className={`text-[10px] font-medium md:text-xs ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </button>
                    )
                  })}

                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      onClick={() => openDayList(dateKey)}
                      className="px-1 text-[11px] font-medium text-muted-foreground underline-offset-2 hover:underline md:text-xs"
                    >
                      +{hiddenCount} evento(s)
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <EventDetailsDialog
        event={selectedEvent}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <Dialog open={dayListOpen} onOpenChange={setDayListOpen}>
        <DialogContent className="sm:max-w-140">
          <DialogHeader>
            <DialogTitle>
              Eventos de {selectedDateKey ? formatDateLabel(selectedDateKey) : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-105 space-y-2 overflow-y-auto py-2">
            {selectedDayEvents.map((event) => {
              const statusInfo = statusMap[event.status] || {
                label: event.status,
                className: 'text-muted-foreground',
              }

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => {
                    setDayListOpen(false)
                    openDetails(event)
                  }}
                  className="w-full cursor-pointer rounded-md border p-3 text-left transition-colors hover:bg-muted"
                >
                  <p className="truncate text-sm font-medium">
                    {getCustomerName(event.customers)}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">
                      {event.total_value.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                    <span className={`text-xs font-medium ${statusInfo.className}`}>{statusInfo.label}</span>
                  </div>
                </button>
              )
            })}

            {selectedDayEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">Sem eventos para esta data.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
