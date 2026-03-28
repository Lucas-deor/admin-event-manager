export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getEvents } from './actions'
import { getCustomers } from '../customers/actions'
import { EventTable } from './EventTable'
import { EventDialog } from './EventDialog'
import { EventSearch } from './EventSearch'
import { EventFilterModal } from './EventFilterModal'
import { EventTableSkeleton } from './EventTableSkeleton'

// Separate server component for fetching data and rendering the table
async function EventList({
  search,
  status,
  fromDate,
  toDate,
  sort,
  order
}: {
  search?: string
  status?: string[]
  fromDate?: string
  toDate?: string
  sort?: string
  order?: string
}) {
  const events = await getEvents({ search, status, fromDate, toDate, sort, order })
  const { customers } = await getCustomers()

  return <EventTable events={events} customers={customers} />
}

export default async function EventsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  
  const search = typeof params.search === 'string' ? params.search : undefined
  const sort = typeof params.sort === 'string' ? params.sort : undefined
  const order = typeof params.order === 'string' ? params.order : undefined
  const fromDate = typeof params.from_date === 'string' ? params.from_date : undefined
  const toDate = typeof params.to_date === 'string' ? params.to_date : undefined
  
  // Status can be multiple
  let status: string[] | undefined;
  if (Array.isArray(params.status)) {
    status = params.status;
  } else if (typeof params.status === 'string') {
    status = [params.status];
  }

  const { customers } = await getCustomers()

  // Generate a key representing the current query state so Suspense retriggers
  const suspenseKey = [search, status?.join(','), fromDate, toDate, sort, order].join('-')

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

      <div className="flex items-center gap-4 border-b pb-4">
        <EventSearch />
        <EventFilterModal 
          initialFromDate={fromDate}
          initialToDate={toDate}
          initialStatuses={status || []}
        />
      </div>

      <Suspense key={suspenseKey} fallback={<EventTableSkeleton />}>
        <EventList 
          search={search}
          status={status}
          fromDate={fromDate}
          toDate={toDate}
          sort={sort}
          order={order}
        />
      </Suspense>
    </div>
  )
}
