'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Filter } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

  const [fromDate, setFromDate] = useState(initialFromDate)
  const [toDate, setToDate] = useState(initialToDate)
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
    if (fromDate) params.set('from_date', fromDate)
    else params.delete('from_date')

    if (toDate) params.set('to_date', toDate)
    else params.delete('to_date')

    params.set('page', '1') // reset pagination if applicable
    
    setOpen(false)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClear = () => {
    setFromDate('')
    setToDate('')
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
        {statuses.length > 0 || fromDate || toDate ? (
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_date">De</Label>
                <Input
                  id="from_date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to_date">Até</Label>
                <Input
                  id="to_date"
                  type="date"
                  min={fromDate}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
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
