'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Home, Users, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/(dashboard)/dashboard/actions/auth'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Eventos', href: '/events', icon: Calendar },
  { name: 'Clientes', href: '/customers', icon: Users },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-stone-200 bg-stone-50">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-xl font-semibold text-stone-800">C. Fazenda</h1>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? 'bg-stone-200 text-stone-900'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-900',
                    'mr-3 h-5 w-5 flex-shrink-0'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="mt-auto pt-4">
          <form action={signOut}>
            <Button variant="ghost" className="w-full justify-start text-stone-600 hover:text-stone-900 hover:bg-stone-100">
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
