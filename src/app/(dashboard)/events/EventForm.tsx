'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Database } from "@/types/database"
import { createEvent, updateEvent } from './actions'
import { getCustomers } from '../customers/actions'

import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { format, isWithinInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

type EventType = Database['public']['Tables']['events']['Row']
type CustomerType = Database['public']['Tables']['customers']['Row']
type LockType = Database['public']['Tables']['calendar_locks']['Row']
type AdminType = Database['public']['Tables']['admin_users']['Row']
type ActiveEventType = { event_date: string, status: string }

interface EventFormProps {
  event?: any
  customers: CustomerType[]
  locks: LockType[]
  activeEvents?: ActiveEventType[]
  admins?: AdminType[]
  onSuccess: () => void
}

export function EventForm({ event, customers, locks, activeEvents = [], admins = [], onSuccess }: EventFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enableCommission, setEnableCommission] = useState(!!event?.admin_id)

  const [openCustomer, setOpenCustomer] = useState(false)
  const [customerSearch, setCustomerSearch] = useState("")
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false)
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerType[]>(customers)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(event?.customer_id || "")

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (customerSearch) {
        setIsSearchingCustomer(true)
        try {
          const { customers: result } = await getCustomers({ search: customerSearch, limit: 10 })
          setFilteredCustomers(result)
        } catch (err) {
          console.error(err)
        } finally {
          setIsSearchingCustomer(false)
        }
      } else {
        setFilteredCustomers(customers)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [customerSearch, customers])

  
  // Try to parse initial date safely for timezone handling
  const [date, setDate] = useState<Date | undefined>(() => {
    if (!event?.event_date) return undefined;
    const [year, month, day] = event.event_date.substring(0, 10).split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setHours(12, 0, 0, 0);
    return d;
  })

  const disabledDates = [
    (d: Date) => {
      const checkStr = format(d, 'yyyy-MM-dd')
      
      for (const lock of locks || []) {
        const startStr = lock.start_date.substring(0, 10)
        const endStr = lock.end_date.substring(0, 10)
        if (checkStr >= startStr && checkStr <= endStr) return true
      }
      
      for (const evt of (activeEvents || [])) {
        if (evt.event_date) {
          const evtStr = evt.event_date.substring(0, 10)
          if (checkStr === evtStr) return true
        }
      }
      
      return false
    }
  ]

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
    
    if (!selectedCustomerId) {
      setError("É obrigatório selecionar um cliente.")
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
      <div className="space-y-2 flex flex-col">
        <Label htmlFor="customer_id">Cliente *</Label>
        <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
          <PopoverTrigger 
            role="combobox"
            aria-expanded={openCustomer}
            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="truncate">
              {selectedCustomerId
                ? (filteredCustomers.find((c) => c.id === selectedCustomerId)?.full_name || 
                   customers.find((c) => c.id === selectedCustomerId)?.full_name || 
                   "Cliente selecionado")
                : "Selecione um cliente"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput 
                placeholder="Buscar cliente..." 
                value={customerSearch}
                onValueChange={setCustomerSearch}
              />
              <CommandList>
                <CommandEmpty>{isSearchingCustomer ? 'Buscando...' : 'Nenhum cliente encontrado.'}</CommandEmpty>
                <CommandGroup>
                  {filteredCustomers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={customer.id}
                      onSelect={(currentValue) => {
                        setSelectedCustomerId(currentValue === selectedCustomerId ? "" : currentValue)
                        setOpenCustomer(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {customer.full_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <input type="hidden" name="customer_id" value={selectedCustomerId} required />
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

      <div className="p-4 border rounded-md bg-slate-50 space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={enableCommission}
            onClick={() => setEnableCommission(!enableCommission)}
            className={cn(
              "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
              enableCommission ? "bg-slate-900" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                enableCommission ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
          <span className="font-medium text-sm">Atribuir comissão</span>
        </div>

        {enableCommission && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="admin_id">Responsável</Label>
              <Select name="admin_id" defaultValue={event?.admin_id || undefined} required={enableCommission}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um administrador">
                    {(val: string | null) => val ? admins?.find(a => a.id === val)?.name || admins?.find(a => a.id === val)?.email || val : "Selecione um responsável"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {admins?.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name || a.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commission_percentage">Comissão (%)</Label>
              <Input 
                id="commission_percentage" 
                name="commission_percentage" 
                type="number"
                step="0.1"
                min="0"
                max="100"
                defaultValue={event?.commission_percentage ?? 5}
                required={enableCommission}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea 
          id="description" 
          name="description" 
          placeholder="Detalhes adicionais do evento..."
          defaultValue={event?.description || ''}
          rows={4}
          className="resize-y min-h-[100px] max-h-[300px] overflow-y-auto"
        />
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
