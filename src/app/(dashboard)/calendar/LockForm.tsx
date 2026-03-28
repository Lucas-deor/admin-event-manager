'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCalendarLock } from './actions'

export function LockForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)

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
        <div className="space-y-2">
          <Label htmlFor="start_date">Data Inicial *</Label>
          <Input 
            id="start_date" 
            name="start_date" 
            type="date"
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Data Final *</Label>
          <Input 
            id="end_date" 
            name="end_date" 
            type="date"
            required 
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
