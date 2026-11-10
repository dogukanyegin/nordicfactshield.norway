-- Review in staging first. Applies only to public.factshield.
-- All existing records are already public in this application.
-- Content and records are not changed. Publishing must use a trusted backend.
begin;
alter table public.factshield enable row level security;
revoke all privileges on table public.factshield from anon, authenticated;
grant select (id, title, author, content, date, files) on public.factshield to anon, authenticated;
drop policy if exists factshield_public_read on public.factshield;
create policy factshield_public_read on public.factshield for select to anon, authenticated using (true);
commit;
-- Existing restrictive SELECT policies can still restrict visibility.
-- Review other tables, RPC functions, storage buckets and role grants separately.
