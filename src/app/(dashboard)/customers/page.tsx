export const dynamic = 'force-dynamic'

import { getCustomers } from './actions'
import { CustomerTable } from './CustomerTable'
import { CustomerDialog } from './CustomerDialog'

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os clientes e seus dados de contato.
          </p>
        </div>
        <CustomerDialog />
      </div>

      <CustomerTable customers={customers} />
    </div>
  )
}
