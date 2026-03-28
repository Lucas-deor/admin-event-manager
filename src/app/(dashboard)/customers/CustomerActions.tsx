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
import { CustomerForm } from './CustomerForm'
import { deleteCustomer } from './actions'

type Customer = Database['public']['Tables']['customers']['Row']

export function CustomerActions({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setLoading(true)
      try {
        await deleteCustomer(customer.id)
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
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <CustomerForm 
            customer={customer} 
            onSuccess={() => setOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
