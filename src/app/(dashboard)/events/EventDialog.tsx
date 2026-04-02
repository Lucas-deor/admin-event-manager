'use client'

import { useState } from 'react'
import { buttonVariants } from "@/components/ui/button"
import { CalendarPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EventForm } from './EventForm'
import { Database } from "@/types/database"

type CustomerType = Database['public']['Tables']['customers']['Row']
type LockType = Database['public']['Tables']['calendar_locks']['Row']
type AdminType = Database['public']['Tables']['admin_users']['Row']
type ActiveEventType = { event_date: string, status: string }

export function EventDialog({ 
  customers, 
  locks,
  activeEvents = [],
  admins = []
}: { 
  customers: CustomerType[], 
  locks: LockType[],
  activeEvents?: ActiveEventType[],
  admins?: AdminType[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants()}>
        <CalendarPlus className="mr-2 h-4 w-4" /> Novo Evento
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
        </DialogHeader>
        <EventForm 
          customers={customers} 
          locks={locks} 
          activeEvents={activeEvents}
          admins={admins}
          onSuccess={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  )
}
