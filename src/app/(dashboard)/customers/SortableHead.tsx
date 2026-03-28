'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

export function SortableHead({ column, title, defaultSort = false }: { column: string, title: string, defaultSort?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || (defaultSort ? 'created_at' : '')
  const currentOrder = searchParams.get('order') || (defaultSort ? 'desc' : '')

  const toggleSort = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (currentSort === column) {
      params.set('order', currentOrder === 'asc' ? 'desc' : 'asc')
    } else {
      params.set('sort', column)
      params.set('order', 'asc')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <button 
      onClick={toggleSort} 
      className="flex items-center gap-1 hover:text-primary transition-colors font-medium cursor-pointer py-1"
    >
      {title}
      {currentSort === column ? (
        currentOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
      ) : (
        <ArrowUpDown className="w-3 h-3 text-muted-foreground opacity-50" />
      )}
    </button>
  )
}
