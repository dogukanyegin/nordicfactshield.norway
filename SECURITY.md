# Security policy

This source release uses the existing public Supabase archive. Browser keys are public; grants, restrictive RLS policies and trusted publishing credentials must enforce authorization server-side. Apply security/public-readonly.sql and review security/verify-readonly.sql in the actual project.

Report vulnerabilities privately through GitHub private vulnerability reporting if enabled by the repository owner. Avoid public disclosure of secrets or private data. No response SLA is configured.

KURULUM-VE-KORUMA.md documents the deployed boundaries and remaining operator tasks. No exhaustive audit, full protection or DDoS resistance is claimed. SECURITY DEFINER RPCs, Storage, other tables and owner/account permissions have not been validated remotely.
