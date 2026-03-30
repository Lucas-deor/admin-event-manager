'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface EventDetailsDialogProps {
  event: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusMap: Record<string, { label: string, variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  confirmed: { label: 'Confirmado', variant: 'default' },
  finished: { label: 'Concluído', variant: 'outline' },
  cancelled: { label: 'Cancelado', variant: 'destructive' }
}

export function EventDetailsDialog({ event, open, onOpenChange }: EventDetailsDialogProps) {
  if (!event) return null

  const statusInfo = statusMap[event.status] || { label: event.status, variant: 'secondary' }
  const formattedDate = format(new Date(event.event_date + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Evento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cliente</p>
              <p className="font-medium">{event.customers?.full_name || 'Desconhecido'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data</p>
              <p className="font-medium">{formattedDate}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={statusInfo.variant} className="mt-1">
                {statusInfo.label}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Convidados</p>
              <p className="font-medium">{event.guest_count} pessoas</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
              <p className="font-medium">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(event.total_value)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Descrição</p>
            <div className="bg-muted/50 p-4 rounded-md min-h-[100px] max-h-[250px] overflow-y-auto whitespace-pre-wrap text-sm">
              {event.description || <span className="text-muted-foreground italic">Nenhuma descrição informada.</span>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Fechar
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
