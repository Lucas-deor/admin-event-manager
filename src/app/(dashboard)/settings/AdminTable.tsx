'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { removeAdmin } from './actions';
import { useState } from 'react';

type AdminTableProps = {
  users: Array<{ id: string; name: string | null; email: string; created_at: string }>;
  currentUserEmail: string | undefined;
};

export function AdminTable({ users, currentUserEmail }: AdminTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string, email: string) {
    if (confirm('Tem certeza que deseja remover este administrador?')) {
      setDeleting(id);
      const res = await removeAdmin(id, email);
      
      if (res?.error) {
        alert(res.error);
      } else {
        alert('Administrador removido com sucesso!');
      }
      setDeleting(null);
    }
  }

  return (
    <div className="rounded-md border mt-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Adicionado em</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((admin) => {
            const isCurrentUser = admin.email === currentUserEmail;
            
            return (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">
                  {admin.name || 'Sem nome'}
                </TableCell>
                <TableCell className="font-medium">
                  {admin.email}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-muted-foreground">(Você)</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(admin.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isCurrentUser || users.length <= 1 || deleting === admin.id}
                    title={
                      isCurrentUser
                        ? 'Você não pode remover a si próprio'
                        : users.length <= 1
                        ? 'O último administrador não pode ser removido'
                        : 'Remover'
                    }
                    onClick={() => handleDelete(admin.id, admin.email)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
