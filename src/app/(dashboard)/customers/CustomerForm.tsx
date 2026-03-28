'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Database } from "@/types/database"
import { createCustomer, updateCustomer } from './actions'

type Customer = Database['public']['Tables']['customers']['Row']

interface CustomerFormProps {
  customer?: Customer
  onSuccess?: () => void
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)

    try {
      if (customer) {
        await updateCustomer(customer.id, formData)
      } else {
        await createCustomer(formData)
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
        <Label htmlFor="full_name">Nome Completo *</Label>
        <Input 
          id="full_name" 
          name="full_name" 
          defaultValue={customer?.full_name} 
          required 
          placeholder="Ex: João da Silva"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail *</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          defaultValue={customer?.email} 
          required 
          placeholder="Ex: joao@email.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input 
            id="phone" 
            name="phone" 
            defaultValue={customer?.phone || ""}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document_id">CPF / CNPJ</Label>
          <Input 
            id="document_id" 
            name="document_id" 
            defaultValue={customer?.document_id || ""}
            placeholder="000.000.000-00"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}

      <div className="pt-4 flex justify-end gap-2">
        <Button disabled={loading} type="submit" className="w-full">
          {loading ? 'Salvando...' : customer ? 'Salvar Alterações' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  )
}
