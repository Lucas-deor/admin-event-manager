import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 mt-2">
          Bem-vindo de volta. Aqui está o resumo dos eventos da fazenda.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder para os Cards que faremos no Sprint 4 */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <h3 className="text-sm font-medium text-stone-500">Eventos este mês</h3>
          <p className="text-3xl font-semibold text-stone-900 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <h3 className="text-sm font-medium text-stone-500">Pagamentos Pendentes</h3>
          <p className="text-3xl font-semibold text-stone-900 mt-2">R$ 0,00</p>
        </div>
      </div>
    </div>
  )
}
