import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Database } from "@/types/database"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { EventRowActions } from "./EventRowActions"
import { SortableHead } from "../customers/SortableHead"

// Hack the typing for joined customer name from Supabase nested select
type DbCustomer = { full_name: string } | null;
type DbEvent = Database['public']['Tables']['events']['Row'] & { 
  customers: DbCustomer | DbCustomer[] 
};

function getCustomerName(c: DbCustomer | DbCustomer[]) {
  if (Array.isArray(c)) return c[0]?.full_name || 'Desconhecido';
  return c?.full_name || 'Desconhecido';
}

const statusMap: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  finished: "Concluído",
  cancelled: "Cancelado",
}

export function EventTable({ 
  events, 
  customers,
  locks
}: { 
  events: DbEvent[], 
  customers: Database['public']['Tables']['customers']['Row'][],
  locks: Database['public']['Tables']['calendar_locks']['Row'][]
}) {
  if (events.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-lg bg-slate-50">
        Nenhum evento agendado.
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Convidados</TableHead>
            <TableHead>
              <SortableHead column="total_value" title="Valor (R$)" />
            </TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((evt) => (
            <TableRow key={evt.id}>
              <TableCell className="font-medium">
                {format(new Date(evt.event_date + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell>{getCustomerName(evt.customers)}</TableCell>
              <TableCell>
                {evt.status === 'pending' && <span className="text-yellow-600 font-medium">Pendente</span>}
                {evt.status === 'confirmed' && <span className="text-blue-600 font-medium">Confirmado</span>}
                {evt.status === 'finished' && <span className="text-green-600 font-medium">Concluído</span>}
                {evt.status === 'cancelled' && <span className="text-red-600 font-medium">Cancelado</span>}
                {!['pending', 'confirmed', 'finished', 'cancelled'].includes(evt.status) && evt.status}
              </TableCell>
              <TableCell>{evt.guest_count} pax</TableCell>
              <TableCell>
                {evt.total_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </TableCell>
              <TableCell className="text-right">
                 <EventRowActions event={evt} customers={customers} locks={locks} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
