'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Database } from "@/types/database"
import { Trash } from "lucide-react"
import { deleteCalendarLock } from './actions'

type CalendarLock = Database['public']['Tables']['calendar_locks']['Row']

export function LockRowActions({ lock }: { lock: CalendarLock }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (confirm('Deseja remover este bloqueio?')) {
      setLoading(true)
      try {
        await deleteCalendarLock(lock.id)
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(err.message)
        } else {
          alert('Erro ao excluir')
        }
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete} 
      disabled={loading}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash className="h-4 w-4" />
    </Button>
  )
}
