export const dynamic = 'force-dynamic'

import { getCalendarLocks } from './actions'
import { getAllActiveEvents } from '../events/actions'
import { LockTable } from './LockTable'
import { LockDialog } from './LockDialog'

export default async function CalendarPage() {
  const locks = await getCalendarLocks()
  const activeEvents = await getAllActiveEvents()

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div className="flex-1 w-full space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Calendário (Bloqueios)</h1>
          <p className="text-muted-foreground">
            Gerencie as datas bloqueadas para manutenção, férias ou imprevistos.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <LockDialog locks={locks} activeEvents={activeEvents} />
        </div>
      </div>

      <LockTable locks={locks} />
    </div>
  )
}
