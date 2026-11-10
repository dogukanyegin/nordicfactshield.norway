# Security policy

This source release uses the existing public Supabase archive. Browser keys are public; grants, restrictive RLS policies and trusted publishing credentials must enforce authorization server-side. The public-readonly migration was applied and verified on the live project on 2026-11-10. See CANLI-KORUMA.json; security/verify-readonly.sql can be used for follow-up checks.

Report vulnerabilities privately through GitHub private vulnerability reporting if enabled by the repository owner. Avoid public disclosure of secrets or private data. No response SLA is configured.

KURULUM-VE-KORUMA.md documents the deployed boundaries and remaining operator tasks. No exhaustive audit, full protection or DDoS resistance is claimed. No public SECURITY DEFINER functions or Edge Functions were found. The public Storage bucket has no browser write policies. Auth leaked-password protection remains disabled. Account/DNS permissions and DDoS capacity have not been validated.
