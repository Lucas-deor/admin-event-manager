'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function CustomerPagination({ 
  totalPages, 
  currentPage 
}: { 
  totalPages: number, 
  currentPage: number 
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</p>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage <= 1}
          onClick={() => router.push(createPageURL(currentPage - 1))}
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage >= totalPages}
          onClick={() => router.push(createPageURL(currentPage + 1))}
        >
          Próxima <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
