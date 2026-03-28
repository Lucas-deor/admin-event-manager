export const dynamic = 'force-dynamic'

import { getEvents } from './actions'
import { getCustomers } from '../customers/actions'
import { EventTable } from './EventTable'
import { EventDialog } from './EventDialog'

export default async function EventsPage() {
  const events = await getEvents()
  const customers = await getCustomers()

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">
            Crie novos eventos e consulte a agenda.
          </p>
        </div>
        <EventDialog customers={customers} />
      </div>

      <EventTable events={events} customers={customers} />
    </div>
  )
}
