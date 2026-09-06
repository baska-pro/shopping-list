-- ==========================================================
-- Supabase schema for Belanjaan / Shopping List
-- Version 2.1.0
-- ==========================================================
-- Run this file in Supabase SQL Editor.
--
-- Security model:
-- - browser clients never access the table directly;
-- - room keys are SHA-256 hashed client-side before transmission;
-- - anon/authenticated clients can only call exact-room RPC functions;
-- - rows cannot be enumerated through direct SELECT.

create table if not exists public.shopping_sync (
  id text primary key,
  updated_at timestamptz not null default timezone('utc'::text, now()),
  payload jsonb not null
);

create index if not exists idx_shopping_sync_updated_at
  on public.shopping_sync (updated_at desc);

alter table public.shopping_sync enable row level security;

-- Remove the legacy fully-public policy if it exists.
drop policy if exists "Akses Belanjaan Multi Device" on public.shopping_sync;

-- Ensure browser roles cannot access the table directly.
revoke all on table public.shopping_sync from anon, authenticated;

create or replace function public.shopping_sync_pull(p_room_id text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select payload
  from public.shopping_sync
  where id = p_room_id
  limit 1;
$$;

create or replace function public.shopping_sync_push(p_room_id text, p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_room_id is null or length(trim(p_room_id)) < 32 then
    raise exception 'Invalid room identifier';
  end if;

  insert into public.shopping_sync (id, updated_at, payload)
  values (p_room_id, timezone('utc'::text, now()), p_payload)
  on conflict (id) do update
    set updated_at = excluded.updated_at,
        payload = excluded.payload;
end;
$$;

revoke all on function public.shopping_sync_pull(text) from public;
revoke all on function public.shopping_sync_push(text, jsonb) from public;

grant execute on function public.shopping_sync_pull(text) to anon, authenticated;
grant execute on function public.shopping_sync_push(text, jsonb) to anon, authenticated;
