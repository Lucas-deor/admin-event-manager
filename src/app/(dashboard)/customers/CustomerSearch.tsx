'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { useEffect, useState, useRef } from 'react'
import { Search } from 'lucide-react'

export function CustomerSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [term, setTerm] = useState(searchParams.get('search') || '')
  
  // To avoid refetching on initial mount if term hasn't changed
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const handler = setTimeout(() => {
      // Create fresh URLSearchParams to avoid closure staleness issues
      // but read from window.location.search to ensure latest base
      const params = new URLSearchParams(window.location.search)
      if (term) {
        params.set('search', term)
      } else {
        params.delete('search')
      }
      params.set('page', '1') // restart page count when searching
      router.push(`${pathname}?${params.toString()}`)
    }, 500)

    return () => clearTimeout(handler)
  }, [term]) // Only depends on term

  return (
    <div className="relative max-w-sm w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Buscar por nome ou e-mail..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="pl-9"
      />
    </div>
  )
}
