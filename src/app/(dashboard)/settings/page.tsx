import { createClient } from '@/lib/supabase/server';
import { AdminForm } from './AdminForm';
import { AdminTable } from './AdminTable';

export const metadata = {
  title: 'Configurações - Admin Event Manager',
  description: 'Gerencie os usuários administradores do sistema.',
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const currentUserEmail = user?.email;

  const { data: adminUsers, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div>Erro ao carregar administradores.</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      </div>

      <div className="hidden space-y-4 md:block">
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Gerencie quem tem acesso ao painel de administração da plataforma.
          </p>
          
          <AdminForm />
          
          <AdminTable 
            users={adminUsers || []} 
            currentUserEmail={currentUserEmail} 
          />
        </div>
      </div>
    </div>
  );
}
