"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { listEventDocuments, uploadEventDocument, getEventDocumentSignedUrl, deleteEventDocument, replaceEventDocument } from './documents/actions'

type Doc = {
  id: string
  file_name: string
  content_type: string
  size: number
  path: string
  created_at: string
}

export function EventDocumentsDialog({ eventId, open, onOpenChange }: { eventId: string, open: boolean, onOpenChange: (v: boolean) => void }) {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!open) return
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function fetchList() {
    setLoading(true)
    try {
      const data = await listEventDocuments(eventId)
      setDocs(data || [])
    } catch (err) {
      console.error(err)
      alert('Erro ao carregar documentos')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set('event_id', eventId)
    setUploading(true)
    try {
      await uploadEventDocument(fd)
      await fetchList()
      const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err: any) {
      alert(err?.message || 'Erro ao enviar arquivo')
    } finally {
      setUploading(false)
    }
  }

  async function handleView(path: string) {
    try {
      const url = await getEventDocumentSignedUrl(path)
      window.open(url, '_blank')
    } catch (err) {
      alert('Erro ao gerar link de visualização')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja remover este documento?')) return
    try {
      await deleteEventDocument(id)
      setDocs(d => d.filter(x => x.id !== id))
    } catch (err) {
      alert('Erro ao excluir documento')
    }
  }

  async function handleReplace(id: string, file: File | null) {
    if (!file) return
    const fd = new FormData()
    fd.set('file', file)
    try {
      await replaceEventDocument(id, fd)
      await fetchList()
    } catch (err) {
      alert('Erro ao substituir documento')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Documentos do Evento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpload} className="mb-4">
          <input name="file" type="file" accept=".pdf,.doc,.docx,.txt,.csv" />
          <div className="mt-2">
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Enviando...' : 'Anexar documento'}
            </Button>
          </div>
        </form>

        <div>
          {loading ? (
            <div>Carregando...</div>
          ) : docs.length === 0 ? (
            <div>Nenhum documento anexado.</div>
          ) : (
            <ul className="space-y-2">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2">
                  <div className="truncate">
                    <div className="font-medium">{d.file_name}</div>
                    <div className="text-sm text-muted-foreground">{(d.size / 1024).toFixed(1)} KB • {new Date(d.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(d.path)}>Visualizar</Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = '.pdf,.doc,.docx,.txt,.csv'
                      input.onchange = () => handleReplace(d.id, input.files?.[0] ?? null)
                      input.click()
                    }}>Substituir</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(d.id)}>Excluir</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EventDocumentsDialog
