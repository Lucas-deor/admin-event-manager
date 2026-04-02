'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripHorizontal } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function SortableCard({
  id,
  className,
  title,
  children,
}: {
  id: string
  className?: string
  title?: string
  children: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${className} relative flex flex-col`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-stone-500">
          {title}
        </CardTitle>
        <div
          {...attributes}
          {...listeners}
          className="cursor-move text-stone-400 hover:text-stone-600 active:cursor-grabbing p-1 rounded-md hover:bg-stone-100"
        >
          <GripHorizontal className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {children}
      </CardContent>
    </Card>
  )
}

type Props = {
  userEmail: string
  metrics: { eventsThisMonth: number; totalPendingPayments: number }
  upcomingEvents: any[]
  recentBookings: any[]
  commissions: any[]
}

const defaultOrder = [
  'metrics-events',
  'metrics-payments',
  'commissions',
  'upcoming-events',
  'recent-bookings',
]

export function DashboardGrid({
  userEmail,
  metrics,
  upcomingEvents,
  recentBookings,
  commissions,
}: Props) {
  const [items, setItems] = useState<string[]>(defaultOrder)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem(`dashboard_layout_${userEmail}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure all default items are present, and filter out removed items
        const validItems = parsed.filter((id: string) => defaultOrder.includes(id))
        const missingItems = defaultOrder.filter((id) => !validItems.includes(id))
        setItems([...validItems, ...missingItems])
      } catch (err) {
        console.error('Error parsing dashboard layout', err)
      }
    }
  }, [userEmail])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id.toString())
        const newIndex = items.indexOf(over.id.toString())
        const newOrder = arrayMove(items, oldIndex, newIndex)

        // Save order locally
        localStorage.setItem(`dashboard_layout_${userEmail}`, JSON.stringify(newOrder))
        
        return newOrder
      })
    }
  }

  const renderCard = (id: string) => {
    switch (id) {
      case 'metrics-events':
        return (
          <SortableCard
            key={id}
            id={id}
            title="Eventos este mês"
            className="col-span-1"
          >
            <div className="text-3xl font-semibold text-stone-900">
              {metrics.eventsThisMonth}
            </div>
          </SortableCard>
        )
      case 'metrics-payments':
        return (
          <SortableCard
            key={id}
            id={id}
            title="Pagamentos Pendentes"
            className="col-span-1"
          >
            <div className="text-3xl font-semibold text-stone-900">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(metrics.totalPendingPayments)}
            </div>
          </SortableCard>
        )
      case 'commissions':
        return (
          <SortableCard
            key={id}
            id={id}
            title="Comissões Totais por Administrador"
            className="col-span-1 md:col-span-2 lg:col-span-2"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-right">Comissão Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-stone-500 py-4">
                      Nenhuma comissão registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  commissions.map((comm) => (
                    <TableRow key={comm.adminId}>
                      <TableCell className="font-medium">
                        {comm.adminName || comm.adminEmail}
                        <br />
                        <span className="text-xs text-stone-500 font-normal">
                          {comm.eventCount} {comm.eventCount === 1 ? 'evento' : 'eventos'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(comm.totalCommission)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </SortableCard>
        )
      case 'upcoming-events':
        return (
          <SortableCard
            key={id}
            id={id}
            title="Próximos Eventos Confirmados"
            className="col-span-1 md:col-span-2 lg:col-span-2"
          >
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
          </SortableCard>
        )
      case 'recent-bookings':
        return (
          <SortableCard
            key={id}
            id={id}
            title="Reservas Recentes"
            className="col-span-1 md:col-span-2 lg:col-span-2"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Data Evento</TableHead>
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
                  recentBookings.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        {(event.customers as any)?.full_name || 'Desconhecido'}
                      </TableCell>
                      <TableCell>
                        {event.status === 'pending' && <span className="text-yellow-600 font-medium">Pendente</span>}
                        {event.status === 'confirmed' && <span className="text-blue-600 font-medium">Confirmado</span>}
                        {event.status === 'finished' && <span className="text-green-600 font-medium">Concluído</span>}
                        {event.status === 'cancelled' && <span className="text-red-600 font-medium">Cancelado</span>}
                      </TableCell>
                      <TableCell className="text-right text-stone-600">
                        {`${event.event_date.substring(8, 10)}/${event.event_date.substring(5, 7)}/${event.event_date.substring(0, 4)}`}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </SortableCard>
        )
      default:
        return null
    }
  }

  // Prevent hydration mismatch since layout may differ from server
  if (!isClient) return null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SortableContext
          items={items}
          strategy={rectSortingStrategy}
        >
          {items.map((id) => renderCard(id))}
        </SortableContext>
      </div>
    </DndContext>
  )
}
