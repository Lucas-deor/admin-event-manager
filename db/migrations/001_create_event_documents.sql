-- Migration: create event_documents table
-- Apply using Supabase SQL editor or psql connected to your project's database

-- Optional: enable pgcrypto for gen_random_uuid() if not already enabled
-- create extension if not exists pgcrypto;

create table if not exists public.event_documents (
  id uuid default gen_random_uuid() primary key,
  event_id uuid not null references public.events(id) on delete cascade,
  file_name text not null,
  content_type text not null,
  size bigint not null,
  path text not null,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create index if not exists idx_event_documents_event_id on public.event_documents(event_id);
create index if not exists idx_event_documents_uploaded_by on public.event_documents(uploaded_by);

-- Enable Row Level Security
alter table public.event_documents enable row level security;

-- RLS Policy: Users can only insert documents into events where they are the authenticated user
create policy "Users can insert documents to events"
  on public.event_documents
  for insert
  with check (uploaded_by = auth.uid());

-- RLS Policy: Users can read documents from any event (documents are referenced in events)
create policy "Users can read event documents"
  on public.event_documents
  for select
  using (true);

-- RLS Policy: Users can only delete their own documents (for admin cleanup)
create policy "Users can delete their own documents"
  on public.event_documents
  for delete
  using (uploaded_by = auth.uid());

-- RLS Policy: Users can only update their own documents
create policy "Users can update their own documents"
  on public.event_documents
  for update
  using (uploaded_by = auth.uid());

-- --------------------------------------------------------
-- Setup Storage for Event Documents
-- --------------------------------------------------------

-- 1. Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('event-documents', 'event-documents', false)
on conflict (id) do nothing;

-- 2. Storage RLS Policies
-- Allow authenticated users to insert files
create policy "event docs insert"
  on storage.objects
  for insert
  to authenticated
  with check ( bucket_id = 'event-documents' );

-- Allow authenticated users to read files
create policy "event docs read"
  on storage.objects
  for select
  to authenticated
  using ( bucket_id = 'event-documents' );

-- Allow authenticated users to delete files
create policy "event docs delete"
  on storage.objects
  for delete
  to authenticated
  using ( bucket_id = 'event-documents' );
