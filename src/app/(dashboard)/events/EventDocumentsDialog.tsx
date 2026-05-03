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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
      setSelectedFile(null)
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
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Documentos do Evento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpload} className="mb-4">
          <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer flex flex-col items-center justify-center">
            <input 
              name="file" 
              type="file" 
              accept=".pdf,.doc,.docx,.txt,.csv" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <div className="text-sm font-medium">
              {selectedFile ? (
                <span className="text-primary">{selectedFile.name}</span>
              ) : (
                <span>Clique para procurar um arquivo</span>
              )}
            </div>
            {!selectedFile && (
              <p className="text-xs text-muted-foreground mt-1 text-center">Formatos suportados: .pdf, .doc, .docx, .txt, .csv</p>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={uploading || !selectedFile}>
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
                <li key={d.id} className="flex items-center justify-between gap-2 overflow-hidden">
                  <div className="truncate shrink">
                    <div className="font-medium truncate">{d.file_name}</div>
                    <div className="text-sm text-muted-foreground">{(d.size / 1024).toFixed(1)} KB • {new Date(d.created_at).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
