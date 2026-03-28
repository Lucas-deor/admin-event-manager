'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function EventPagination({ 
  totalPages, 
  currentPage 
}: { 
  totalPages: number, 
  currentPage: number 
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-muted-foreground">
        {totalPages > 0 ? `Página ${currentPage} de ${totalPages}` : "Nenhum resultado"}
      </p>
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
          disabled={currentPage >= totalPages || totalPages === 0}
          onClick={() => router.push(createPageURL(currentPage + 1))}
        >
          Próxima <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
