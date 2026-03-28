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

type EventType = Database['public']['Tables']['events']['Row']
type CustomerType = Database['public']['Tables']['customers']['Row']

interface EventFormProps {
  event?: EventType
  customers: CustomerType[]
  onSuccess?: () => void
}

export function EventForm({ event, customers, onSuccess }: EventFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)

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
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {customers.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event_date">Data do Evento *</Label>
          <Input 
            id="event_date" 
            name="event_date" 
            type="date"
            defaultValue={event?.event_date} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select name="status" defaultValue={event?.status || 'pending'} required>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
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
