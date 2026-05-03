 'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/octet-stream', // some browsers send PDFs with this MIME type
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
])

export async function uploadEventDocument(formData: FormData) {
  const file = formData.get('file') as any
  const eventId = formData.get('event_id') as string

  if (!file || !eventId) {
    throw new Error('Missing file or event_id')
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error('File too large')
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Unsupported file type')
  }

  const supabase = await createClient()

  // Obter usuário autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const uuid = crypto.randomUUID()
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_^]/g, '_')
  const path = `events/${eventId}/${uuid}_${safeName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('event-documents')
    .upload(path, file)

  if (uploadError) {
    throw uploadError
  }

  const { data, error } = await supabase
    .from('event_documents')
    .insert([
      {
        event_id: eventId,
        file_name: file.name,
        content_type: file.type,
        size: file.size,
        path,
        uploaded_by: user.id,
      },
    ])
    .select()

  if (error) {
    // attempt to cleanup uploaded file
    try {
      const service = createServiceRoleClient()
      await service.storage.from('event-documents').remove([path])
    } catch (_) {
      // ignore
    }
    throw error
  }

  return data?.[0]
}

export async function listEventDocuments(eventId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event_documents')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getEventDocumentSignedUrl(path: string, expires = 60) {
  const service = createServiceRoleClient()

  const { data, error } = await service.storage
    .from('event-documents')
    .createSignedUrl(path, expires)

  if (error) throw error
  return data.signedUrl
}

export async function deleteEventDocument(id: string) {
  const supabase = await createClient()
  const service = createServiceRoleClient()

  // Obter usuário autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { data: rows } = await supabase
    .from('event_documents')
    .select('*')
    .eq('id', id)
    .limit(1)

  const row = rows?.[0]
  if (!row) throw new Error('Document not found')

  // Validar que o usuário atual é quem fez o upload
  if (row.uploaded_by !== user.id) {
    throw new Error('Unauthorized: you can only delete documents you uploaded')
  }

  const { error: removeError } = await service.storage
    .from('event-documents')
    .remove([row.path])

  if (removeError) throw removeError

  const { error } = await supabase
    .from('event_documents')
    .delete()
    .eq('id', id)

  if (error) throw error

  return true
}

export async function replaceEventDocument(id: string, formData: FormData) {
  const file = formData.get('file') as any

  if (!file) throw new Error('Missing file')
  if (file.size > MAX_FILE_BYTES) throw new Error('File too large')
  if (!ALLOWED_TYPES.has(file.type)) throw new Error('Unsupported file type')

  const supabase = await createClient()
  const service = createServiceRoleClient()

  // Obter usuário autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { data: rows } = await supabase
    .from('event_documents')
    .select('*')
    .eq('id', id)
    .limit(1)

  const row = rows?.[0]
  if (!row) throw new Error('Document not found')

  // Validar que o usuário atual é quem fez o upload original
  if (row.uploaded_by !== user.id) {
    throw new Error('Unauthorized: you can only replace documents you uploaded')
  }

  const uuid = crypto.randomUUID()
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_^]/g, '_')
  const path = `events/${row.event_id}/${uuid}_${safeName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('event-documents')
    .upload(path, file)

  if (uploadError) throw uploadError

  const { data: updated, error } = await supabase
    .from('event_documents')
    .update({ file_name: file.name, content_type: file.type, size: file.size, path })
    .eq('id', id)
    .select()

  if (error) {
    try {
      await service.storage.from('event-documents').remove([path])
    } catch (_) {}
    throw error
  }

  // remove old file
  try {
    await service.storage.from('event-documents').remove([row.path])
  } catch (_) {}

  return updated?.[0]
}
