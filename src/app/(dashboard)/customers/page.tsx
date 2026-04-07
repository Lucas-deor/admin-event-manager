export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getCustomers } from './actions'
import { CustomerTable } from './CustomerTable'
import { CustomerDialog } from './CustomerDialog'
import { CustomerSearch } from './CustomerSearch'
import { CustomerPagination } from './CustomerPagination'
import { CustomerTableSkeleton } from './CustomerTableSkeleton'

// Separate component to handle the async data fetching for the table
async function CustomerList({ 
  search, page, sort, order 
}: { 
  search: string, page: number, sort: string, order: string 
}) {
  const limit = 10;
  const { customers, count } = await getCustomers({ search, page, limit, sort, order })
  const totalPages = Math.ceil(count / limit)

  return (
    <div className="space-y-4">
      <CustomerTable customers={customers} />
      <CustomerPagination totalPages={totalPages} currentPage={page} />
    </div>
  )
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : ''
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const sort = typeof params.sort === 'string' ? params.sort : 'created_at'
  const order = typeof params.order === 'string' ? params.order : 'desc'
  
  const suspenseKey = `${search}-${page}-${sort}-${order}`

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-end gap-4">
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie os clientes e seus dados de contato.
            </p>
          </div>
          <CustomerSearch />
        </div>
        <CustomerDialog />
      </div>

      <Suspense key={suspenseKey} fallback={<CustomerTableSkeleton />}>
        <CustomerList search={search} page={page} sort={sort} order={order} />
      </Suspense>
    </div>
  )
}
