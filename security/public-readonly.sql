-- Owner-only setup for the existing public archive. Does not edit any records.
-- Apply in Supabase SQL Editor. Roll back automatically on failed assertions.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.factshield ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.factshield FROM PUBLIC, anon, authenticated;
-- Table-level REVOKE does not remove existing column-level grants.
DO $columns$
DECLARE columns_sql text;
BEGIN
  SELECT string_agg(quote_ident(attname), ', ' ORDER BY attnum) INTO columns_sql
  FROM pg_attribute WHERE attrelid = 'public.factshield'::regclass AND attnum > 0 AND NOT attisdropped;
  EXECUTE format('REVOKE ALL PRIVILEGES (%s) ON TABLE public.factshield FROM PUBLIC, anon, authenticated', columns_sql);
END $columns$;
GRANT SELECT (id, title, author, content, date, files) ON public.factshield TO anon, authenticated;
DROP POLICY IF EXISTS factshield_public_read ON public.factshield;
CREATE POLICY factshield_public_read ON public.factshield FOR SELECT TO anon, authenticated USING (true);
-- Restrictive policies additionally prevent writes if a grant is accidentally restored later.
DROP POLICY IF EXISTS factshield_no_browser_insert ON public.factshield;
CREATE POLICY factshield_no_browser_insert ON public.factshield AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);
DROP POLICY IF EXISTS factshield_no_browser_update ON public.factshield;
CREATE POLICY factshield_no_browser_update ON public.factshield AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS factshield_no_browser_delete ON public.factshield;
CREATE POLICY factshield_no_browser_delete ON public.factshield AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);
DO $verify$
DECLARE browser_role text; column_name text;
BEGIN
  FOREACH browser_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF has_table_privilege(browser_role, 'public.factshield', 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') THEN
      RAISE EXCEPTION 'Inherited table write grants remain for %. Setup aborted.', browser_role;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = browser_role AND (rolsuper OR rolbypassrls)) THEN
      RAISE EXCEPTION 'Browser role % bypasses RLS. Setup aborted.', browser_role;
    END IF;
    IF pg_has_role(browser_role, (SELECT relowner FROM pg_class WHERE oid = 'public.factshield'::regclass), 'USAGE') THEN
      RAISE EXCEPTION 'Browser role % inherits table ownership. Setup aborted.', browser_role;
    END IF;
    FOR column_name IN SELECT attname FROM pg_attribute WHERE attrelid = 'public.factshield'::regclass AND attnum > 0 AND NOT attisdropped LOOP
      IF has_column_privilege(browser_role, 'public.factshield', column_name, 'INSERT,UPDATE,REFERENCES') THEN
        RAISE EXCEPTION 'Inherited column write grants remain: %.%. Setup aborted.', browser_role, column_name;
      END IF;
    END LOOP;
  END LOOP;
END $verify$;
COMMIT;
-- service_role/owner access is deliberately unchanged: publish only through a trusted administrator.
-- This is not a security-definer RPC/storage/other-tables audit. Run verify-readonly.sql too.
