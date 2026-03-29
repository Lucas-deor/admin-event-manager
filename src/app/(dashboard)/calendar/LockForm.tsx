'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCalendarLock } from './actions'
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function LockForm({ 
  onSuccess,
  locks = [],
  activeEvents = [] 
}: { 
  onSuccess?: () => void
  locks?: any[]
  activeEvents?: any[]
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  const disabledDates = [
    (date: Date) => {
      const checkStr = format(date, 'yyyy-MM-dd')
      
      for (const lock of locks || []) {
        const startStr = lock.start_date.substring(0, 10)
        const endStr = lock.end_date.substring(0, 10)
        if (checkStr >= startStr && checkStr <= endStr) return true
      }
      
      for (const evt of activeEvents || []) {
        const evtStr = evt.event_date.substring(0, 10)
        if (checkStr === evtStr) return true
      }
      
      return false
    }
  ]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)

    if (!startDate || !endDate) {
      setError("As datas inicial e final são obrigatórias.")
      setLoading(false)
      return
    }

    try {
      await createCalendarLock(formData)
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 flex flex-col pt-1">
          <Label htmlFor="start_date">Data Inicial *</Label>
          <Popover>
            <PopoverTrigger className={cn(
                  "flex w-full items-center justify-start gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                  !startDate && "text-muted-foreground"
                )}
            >
              {!startDate && <CalendarIcon className="mr-2 h-4 w-4" />}
              {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={disabledDates}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <input 
            type="hidden" 
            name="start_date" 
            value={startDate ? format(startDate, 'yyyy-MM-dd') : ''} 
          />
        </div>
        <div className="space-y-2 flex flex-col pt-1">
          <Label htmlFor="end_date">Data Final *</Label>
          <Popover>
            <PopoverTrigger className={cn(
                  "flex w-full items-center justify-start gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                  !endDate && "text-muted-foreground"
                )}
            >
              {!endDate && <CalendarIcon className="mr-2 h-4 w-4" />}
              {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={[
                  (date) => date < (startDate || new Date(0)),
                  ...disabledDates
                ]}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <input 
            type="hidden" 
            name="end_date" 
            value={endDate ? format(endDate, 'yyyy-MM-dd') : ''} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Motivo</Label>
        <Input 
          id="reason" 
          name="reason" 
          placeholder="Ex: Manutenção na piscina"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}

      <div className="pt-4 flex justify-end gap-2">
        <Button disabled={loading} type="submit" className="w-full">
          {loading ? 'Bloqueando...' : 'Bloquear Período'}
        </Button>
      </div>
    </form>
  )
}
