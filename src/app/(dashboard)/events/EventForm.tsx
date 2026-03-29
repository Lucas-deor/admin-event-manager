'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Database } from "@/types/database"
import { createEvent, updateEvent } from './actions'

import { CalendarIcon } from "lucide-react"
import { format, isWithinInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type EventType = Database['public']['Tables']['events']['Row']
type CustomerType = Database['public']['Tables']['customers']['Row']
type LockType = Database['public']['Tables']['calendar_locks']['Row']
type ActiveEventType = { event_date: string, status: string }

interface EventFormProps {
  event?: any
  customers: CustomerType[]
  locks: LockType[]
  activeEvents?: ActiveEventType[]
  onSuccess: () => void
}

export function EventForm({ event, customers, locks, activeEvents = [], onSuccess }: EventFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Try to parse initial date safely for timezone handling
  const [date, setDate] = useState<Date | undefined>(
    event?.event_date ? new Date(`${event.event_date}T12:00:00`) : undefined
  )

  // Map calendar_locks to the DateMatcher format used by react-day-picker
  const lockDates = locks.map(lock => ({
    from: new Date(`${lock.start_date}T00:00:00`),
    to: new Date(`${lock.end_date}T23:59:59`)
  }))

  const eventDates = activeEvents.map(evt => {
    // block event specific dates
    const date = new Date(`${evt.event_date}T12:00:00`)
    return date
  })

  // Combine both sources of blocked dates
  const disabledDates = [...lockDates, ...eventDates]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    const submittedDateStr = formData.get('event_date') as string
    if (!submittedDateStr) {
      setError("É obrigatório selecionar a data.")
      setLoading(false)
      return
    }

    try {
      if (event) {
        await updateEvent(event.id, formData)
      } else {
        await createEvent(formData)
      }
      onSuccess?.()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocorreu um erro desconhecido')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customer_id">Cliente *</Label>
        <Select name="customer_id" defaultValue={event?.customer_id} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um cliente">
              {(val: string | null) => val ? customers.find(c => c.id === val)?.full_name || val : "Selecione um cliente"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {customers.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="event_date_picker">Data do Evento *</Label>
          <Popover>
            <PopoverTrigger className={cn(
                  "flex w-full items-center justify-start gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                  !date && "text-muted-foreground"
                )}
            >
              {!date && <CalendarIcon className="mr-2 h-4 w-4" />}
              {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={disabledDates}
              />
            </PopoverContent>
          </Popover>
          {/* Campo invisível p/ subir no FormData nativo do form onSubmit */}
          <input 
            type="hidden" 
            name="event_date" 
            value={date ? format(date, 'yyyy-MM-dd') : ''} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select name="status" defaultValue={event?.status || 'pending'} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status">
                {(val: string | null) => {
                  const statusMap: Record<string, string> = {
                    pending: 'Pendente',
                    confirmed: 'Confirmado',
                    finished: 'Concluído',
                    cancelled: 'Cancelado'
                  };
                  return val ? statusMap[val] || val : "Status";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="finished">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guest_count">Qtd Convidados</Label>
          <Input 
            id="guest_count" 
            name="guest_count" 
            type="number" 
            min="0"
            defaultValue={event?.guest_count || 0}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_value">Valor Total (R$)</Label>
          <Input 
            id="total_value" 
            name="total_value" 
            type="number"
            step="0.01"
            min="0"
            defaultValue={event?.total_value || 0}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}

      <div className="pt-4 flex justify-end gap-2">
        <Button disabled={loading} type="submit" className="w-full">
          {loading ? 'Salvando...' : event ? 'Salvar Alterações' : 'Criar Evento'}
        </Button>
      </div>
    </form>
  )
}
