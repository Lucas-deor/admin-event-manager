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
import { CustomerActions } from "./CustomerActions"

type Customer = Database['public']['Tables']['customers']['Row']

export function CustomerTable({ customers }: { customers: Customer[] }) {
  if (customers.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-lg bg-slate-50">
        Nenhum cliente cadastrado ainda.
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>CPF/CNPJ</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.full_name}</TableCell>
              <TableCell>{c.email}</TableCell>
              <TableCell>{c.phone || '-'}</TableCell>
              <TableCell>{c.document_id || '-'}</TableCell>
              <TableCell>
                {format(new Date(c.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell className="text-right">
                 <CustomerActions customer={c} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
