export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getEvents, getAllActiveEvents } from './actions'
import { getCustomers } from '../customers/actions'
import { getCalendarLocks } from '../calendar/actions'
import { EventTable } from './EventTable'
import { EventDialog } from './EventDialog'
import { EventSearch } from './EventSearch'
import { EventFilterModal } from './EventFilterModal'
import { EventTableSkeleton } from './EventTableSkeleton'
import { EventPagination } from './EventPagination'

// Separate server component for fetching data and rendering the table
async function EventList({
  search,
  status,
  fromDate,
  toDate,
  sort,
  order,
  page
}: {
  search?: string
  status?: string[]
  fromDate?: string
  toDate?: string
  sort?: string
  order?: string
  page: number
}) {
  const { events, count } = await getEvents({ search, status, fromDate, toDate, sort, order, page, limit: 10 })
  const { customers } = await getCustomers()
  const locks = await getCalendarLocks()

  const totalPages = Math.ceil(count / 10)

  return (
    <>
      <EventTable events={events} customers={customers} locks={locks} />
      <EventPagination totalPages={totalPages} currentPage={page} />
    </>
  )
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
  const page = Number(typeof params.page === 'string' ? params.page : '1') || 1
  
  // Status can be multiple
  let status: string[] | undefined;
  if (Array.isArray(params.status)) {
    status = params.status;
  } else if (typeof params.status === 'string') {
    status = [params.status];
  }

  const { customers } = await getCustomers()
  const locks = await getCalendarLocks()
  const activeEvents = await getAllActiveEvents()

  // Generate a key representing the current query state so Suspense retriggers
  const suspenseKey = [search, status?.join(','), fromDate, toDate, sort, order].join('-')

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b pb-4">
        <div className="flex-1 space-y-4 w-full">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
            <p className="text-muted-foreground">
              Crie novos eventos e consulte a agenda.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <EventSearch />
            <EventFilterModal 
              initialFromDate={fromDate}
              initialToDate={toDate}
              initialStatuses={status || []}
            />
          </div>
        </div>
        <EventDialog customers={customers} locks={locks} activeEvents={activeEvents} />
      </div>

      <Suspense key={suspenseKey} fallback={<EventTableSkeleton />}>
        <EventList 
          search={search}
          status={status}
          fromDate={fromDate}
          toDate={toDate}
          sort={sort}
          order={order}
          page={page}
        />
      </Suspense>
    </div>
  )
}
