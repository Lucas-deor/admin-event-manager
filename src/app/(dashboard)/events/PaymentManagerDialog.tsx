'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Database } from '@/types/database'
import { Edit2, Trash2, CalendarIcon } from 'lucide-react'
import { getPayments, createPayment, updatePayment, deletePayment } from './payments/actions'
import { format, parseISO, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type PaymentRow = Database['public']['Tables']['payments']['Row']
type PaymentStatus = Database['public']['Enums']['payment_status']

export function PaymentManagerDialog({
  eventId,
  eventTotalValue = 0,
  open,
  onOpenChange,
}: {
  eventId: string
  eventTotalValue?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [installmentValue, setInstallmentValue] = useState('')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [status, setStatus] = useState<PaymentStatus>('pending')
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {
    if (open) {
      loadPayments()
      resetForm()
    }
  }, [open, eventId])

  async function loadPayments() {
    try {
      setLoading(true)
      const data = await getPayments(eventId)
      setPayments(data)
    } catch (error) {
      console.error("Error loading payments", error)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setEditingId(null)
    setInstallmentValue('')
    setDueDate(undefined)
    setStatus('pending')
    setPaymentMethod('')
  }

  function handleEditClick(payment: PaymentRow) {
    setEditingId(payment.id)
    setInstallmentValue(payment.installment_value.toString())
    setDueDate(payment.due_date ? parse(payment.due_date, 'yyyy-MM-dd', new Date()) : undefined)
    setStatus(payment.status)
    setPaymentMethod(payment.payment_method || '')
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja excluir este pagamento?')) return
    try {
      await deletePayment(id)
      await loadPayments()
    } catch (error) {
      console.error(error)
      alert('Erro ao excluir')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!dueDate) {
      alert('Selecione uma data de vencimento')
      return
    }

    setFormLoading(true)

    try {
      const payload = {
        event_id: eventId,
        installment_value: Number(installmentValue),
        due_date: format(dueDate, 'yyyy-MM-dd'),
        status: status,
        payment_method: paymentMethod || null,
      }

      if (editingId) {
        await updatePayment(editingId, payload)
      } else {
        await createPayment(payload)
      }
      
      resetForm()
      await loadPayments()
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar pagamento')
    } finally {
      setFormLoading(false)
    }
  }

  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, current) => acc + current.installment_value, 0)
    
  const remainingValue = Math.max(0, eventTotalValue - totalPaid)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Gerenciar Pagamentos</DialogTitle>
        </DialogHeader>

        {eventTotalValue > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-muted/50 p-4 rounded-lg mb-2 border">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Valor do Evento</span>
              <span className="text-lg font-semibold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(eventTotalValue)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Pago</span>
              <span className="text-lg font-semibold text-green-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Restante a Pagar</span>
              <span className="text-lg font-semibold text-amber-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remainingValue)}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end mb-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="installmentValue">Valor (R$)</Label>
            <Input
              id="installmentValue"
              type="number"
              step="0.01"
              required
              value={installmentValue}
              onChange={(e) => setInstallmentValue(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="dueDate">Vencimento</Label>
            <Popover>
              <PopoverTrigger className={cn(
                "flex w-full items-center justify-start gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                !dueDate && "text-muted-foreground"
              )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as PaymentStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione...">
                  {(val: string | null) => {
                    const statusMap: Record<string, string> = {
                      pending: 'Pendente',
                      paid: 'Pago',
                      overdue: 'Atrasado'
                    };
                    return val ? statusMap[val] || val : "Selecione...";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="paymentMethod">Método</Label>
            <Input
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Pix, Cartão..."
            />
          </div>

          <div className="flex gap-2 w-full sm:col-span-2 lg:col-span-1 h-8">
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm} disabled={formLoading} className="px-3 flex-1">
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={formLoading} className="flex-1">
              {editingId ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>

        <div className="border rounded-md overflow-x-auto w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Carregando...</TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Nenhum pagamento registrado.</TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.installment_value)}
                    </TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat('pt-BR').format(new Date(payment.due_date + 'T00:00:00'))}
                    </TableCell>
                    <TableCell>
                      {payment.status === 'pending' && <span className="text-yellow-600 font-medium">Pendente</span>}
                      {payment.status === 'paid' && <span className="text-green-600 font-medium">Pago</span>}
                      {payment.status === 'overdue' && <span className="text-red-600 font-medium">Atrasado</span>}
                    </TableCell>
                    <TableCell>{payment.payment_method || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(payment)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(payment.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
