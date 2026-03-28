'use client'

import { useState } from 'react'
import { buttonVariants } from "@/components/ui/button"
import { Lock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LockForm } from './LockForm'

export function LockDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: "outline", className: "border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" })}>
        <Lock className="mr-2 h-4 w-4" /> Bloquear Data
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bloquear Período no Calendário</DialogTitle>
        </DialogHeader>
        <LockForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
