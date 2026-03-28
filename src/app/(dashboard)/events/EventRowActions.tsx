'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Database } from "@/types/database"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EventForm } from './EventForm'
import { deleteEvent } from './actions'

type EventType = Database['public']['Tables']['events']['Row']
type CustomerType = Database['public']['Tables']['customers']['Row']

export function EventRowActions({ 
  event, 
  customers 
}: { 
  event: EventType, 
  customers: CustomerType[] 
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (confirm('Tem certeza que deseja cancelar/excluir este evento?')) {
      setLoading(true)
      try {
        await deleteEvent(event.id)
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(err.message)
        } else {
          alert('Erro ao excluir evento')
        }
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} disabled={loading} className="text-red-600 focus:bg-red-50 focus:text-red-600">
            <Trash className="mr-2 h-4 w-4" /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>
          <EventForm 
            event={event} 
            customers={customers}
            onSuccess={() => setOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
