'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addAdmin } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminForm() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const result = await addAdmin(formData);
    
    if (result?.error) {
      alert(result.error);
    } else {
      alert('Administrador adicionado com sucesso!');
      (document.getElementById('admin-form') as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Administrador</CardTitle>
        <CardDescription>
          Adicione um novo endereço de e-mail com acesso ao painel de administração.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="admin-form" action={onSubmit} className="space-y-4 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:space-y-0">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input 
              type="text" 
              name="name" 
              id="name" 
              placeholder="Nome do administrador" 
              required 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input 
              type="email" 
              name="email" 
              id="email" 
              placeholder="exemplo@email.com" 
              required 
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
