import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Database } from "@/types/database"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { LockRowActions } from "./LockRowActions"

type CalendarLock = Database['public']['Tables']['calendar_locks']['Row']

export function LockTable({ locks }: { locks: CalendarLock[] }) {
  if (locks.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-lg bg-slate-50">
        Nenhum bloqueio cadastrado.
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data Início</TableHead>
            <TableHead>Data Fim</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locks.map((lock) => (
            <TableRow key={lock.id}>
              <TableCell className="font-medium">
                {lock.start_date.substring(8, 10)}/{lock.start_date.substring(5, 7)}/{lock.start_date.substring(0, 4)}
              </TableCell>
              <TableCell className="font-medium">
                {lock.end_date.substring(8, 10)}/{lock.end_date.substring(5, 7)}/{lock.end_date.substring(0, 4)}
              </TableCell>
              <TableCell>{lock.reason || '-'}</TableCell>
              <TableCell className="text-right">
                 <LockRowActions lock={lock} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
