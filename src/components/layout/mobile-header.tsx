'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Sidebar } from '@/components/layout/sidebar'
import { useState } from 'react'

export function MobileHeader() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-14 items-center border-b border-stone-200 bg-white px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="mr-2 -ml-2" />}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0">
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          {/* We pass a custom class to remove border from the inner Sidebar and ensure it takes full width */}
          <div className="h-full w-full" onClick={() => setOpen(false)}>
            <Sidebar className="w-full border-r-0" />
          </div>
        </SheetContent>
      </Sheet>
      <h1 className="text-lg font-semibold text-stone-800">Fazenda Apoena</h1>
    </div>
  )
}
