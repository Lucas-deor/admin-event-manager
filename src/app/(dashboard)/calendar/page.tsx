export const dynamic = 'force-dynamic'

import { getCalendarLocks } from './actions'
import { LockTable } from './LockTable'
import { LockDialog } from './LockDialog'

export default async function CalendarPage() {
  const locks = await getCalendarLocks()

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário (Bloqueios)</h1>
          <p className="text-muted-foreground">
            Gerencie as datas bloqueadas para manutenção, férias ou imprevistos.
          </p>
        </div>
        <LockDialog />
      </div>

      <LockTable locks={locks} />
    </div>
  )
}
