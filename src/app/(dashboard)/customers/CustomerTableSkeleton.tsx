import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function CustomerTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-4 w-[150px]" /></TableHead>
              <TableHead><Skeleton className="h-4 w-[200px]" /></TableHead>
              <TableHead><Skeleton className="h-4 w-[120px]" /></TableHead>
              <TableHead><Skeleton className="h-4 w-[120px]" /></TableHead>
              <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
              <TableHead className="w-[100px] text-right">
                <Skeleton className="h-4 w-[60px] ml-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Skeleton className="h-4 w-[100px]" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-[100px] rounded-md" />
          <Skeleton className="h-8 w-[100px] rounded-md" />
        </div>
      </div>
    </div>
  )
}
