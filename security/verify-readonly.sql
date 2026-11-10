-- Read-only owner-side checks. No writes or exploit attempts.
SELECT c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS force_rls,
       pg_get_userbyid(c.relowner) AS table_owner
FROM pg_class c WHERE c.oid = 'public.factshield'::regclass;
SELECT role_name,
       has_table_privilege(role_name, 'public.factshield', 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') AS any_table_write,
       has_column_privilege(role_name, 'public.factshield', 'title', 'SELECT') AS can_read_title
FROM (VALUES ('anon'), ('authenticated')) AS roles(role_name);
SELECT role_name, a.attname,
       has_column_privilege(role_name, 'public.factshield', a.attname, 'INSERT,UPDATE,REFERENCES') AS any_column_write
FROM (VALUES ('anon'), ('authenticated')) AS roles(role_name)
CROSS JOIN pg_attribute a
WHERE a.attrelid = 'public.factshield'::regclass AND a.attnum > 0 AND NOT a.attisdropped;
SELECT policyname, permissive, roles, cmd, qual, with_check FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'factshield';
-- Review callable SECURITY DEFINER functions: table RLS/grants alone do not constrain owner-powered RPCs.
SELECT n.nspname, p.proname, p.oid::regprocedure AS function_signature,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.prosecdef AND n.nspname = 'public';
-- Storage bucket policies, additional exposed schemas and other tables need separate review.
