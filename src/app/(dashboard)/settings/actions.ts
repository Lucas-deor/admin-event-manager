'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Precisamos do supabaseAdmin para auto-confirmar os usuários (criar sem disparar e-mail na hora)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // IMPORTANTE: Agora você PODE E DEVE adicionar essa chave no .env.local
);

export async function addAdmin(formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;

  if (!email) {
    return { error: 'E-mail é obrigatório' };
  }
  if (!name) {
    return { error: 'Nome é obrigatório' };
  }

  const supabase = await createClient();

  // 1. Inserir na tabela de admins
  const { error } = await supabase
    .from('admin_users')
    .insert({ email, name });

  if (error) {
    if (error.code === '23505') {
      return { error: 'Este e-mail já está cadastrado como administrador.' };
    }
    return { error: 'Erro de permissão ou falha ao adicionar administrador: ' + error.message };
  }

  // 2. Pré-criar o usuário no Supabase Auth para forçar que o OTP chegue corretamente no primeiro login
  // Como usamos supabaseAdmin (service_role), ele ignora regras e permite a criação.
  try {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(email);
    // Se não estourou erro, pode ser que ele já existisse no Auth.
  } catch (err) {
      // Ignora, significa que precisamos criar.
  }
  
  const { error: createUserError } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true, // Já confirma o e-mail, assim o signIn com OTP no login vira apenas sign-in puro!
  });

  if (createUserError && !createUserError.message.includes('already registered')) {
     console.error('Falha não fatal ao auto-registrar no Auth:', createUserError);
  }

  revalidatePath('/settings');
  return { success: true };
}

export async function removeAdmin(id: string, emailTarget: string) {
  const supabase = await createClient();
  
  // Buscar usuário logado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email === emailTarget) {
    return { error: 'Você não pode remover a si próprio.' };
  }

  // Verificar quantidade de admins
  const { count, error: countError } = await supabase
    .from('admin_users')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    return { error: 'Erro ao verificar administradores: ' + countError.message };
  }

  if (count && count <= 1) {
    return { error: 'Não é possível remover o último administrador.' };
  }

  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: 'Erro ao remover administrador: ' + error.message };
  }

  revalidatePath('/settings');
  return { success: true };
}

