'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Filter, CalendarIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'finished', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' }
];

export function EventFilterModal({
  initialFromDate = '',
  initialToDate = '',
  initialStatuses = []
}: {
  initialFromDate?: string
  initialToDate?: string
  initialStatuses?: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: initialFromDate ? parse(initialFromDate, 'yyyy-MM-dd', new Date()) : undefined,
    to: initialToDate ? parse(initialToDate, 'yyyy-MM-dd', new Date()) : undefined,
  });
  
  const [statuses, setStatuses] = useState<string[]>(initialStatuses)

  const handleStatusChange = (val: string, checked: boolean) => {
    if (checked) {
      setStatuses((prev) => [...prev, val])
    } else {
      setStatuses((prev) => prev.filter((s) => s !== val))
    }
  }

  const handleApply = () => {
    const params = new URLSearchParams(window.location.search)
    
    // Set statuses
    params.delete('status')
    statuses.forEach(s => {
      params.append('status', s)
    })

    // Set dates
    if (dateRange.from) params.set('from_date', format(dateRange.from, 'yyyy-MM-dd'))
    else params.delete('from_date')

    if (dateRange.to) params.set('to_date', format(dateRange.to, 'yyyy-MM-dd'))
    else params.delete('to_date')

    params.set('page', '1') // reset pagination if applicable
    
    setOpen(false)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClear = () => {
    setDateRange({ from: undefined, to: undefined })
    setStatuses([])
    
    const params = new URLSearchParams(window.location.search)
    params.delete('status')
    params.delete('from_date')
    params.delete('to_date')
    params.set('page', '1')
    
    setOpen(false)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: "outline", className: "flex items-center gap-2 cursor-pointer" })}>
        <Filter className="h-4 w-4" />
        Filtros
        {statuses.length > 0 || dateRange.from || dateRange.to ? (
          <span className="flex h-2 w-2 rounded-full bg-primary" />
        ) : null}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtrar Eventos</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Período</h4>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger
                    id="date"
                    className={cn(
                      "flex w-full items-center justify-start gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 h-9 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                      !dateRange.from && !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecione um período</span>
                    )}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to
                    }}
                    onSelect={(range) => {
                      setDateRange({
                        from: range?.from,
                        to: range?.to
                      })
                    }}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Status</h4>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`status-${status.value}`}
                    checked={statuses.includes(status.value)}
                    onChange={(e) => handleStatusChange(status.value, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label 
                    htmlFor={`status-${status.value}`}
                    className="font-normal cursor-pointer"
                  >
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleClear}>
            Limpar Filtros
          </Button>
          <Button onClick={handleApply}>
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
