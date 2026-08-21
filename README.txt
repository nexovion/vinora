VIONORA V4 — REAL LOGIN + DATABASE STARTER

WHAT IS REAL IN THIS VERSION
- Supabase email/password authentication
- Real PostgreSQL database schema
- Customer profiles table
- Orders table
- Row Level Security (RLS)
- Forgot password email flow
- Persistent login session
- User-specific dashboard counts

WHAT YOU MUST DO
1. Create a Supabase project.
2. Open SQL Editor and run supabase-schema.sql.
3. In Supabase Project Settings > API, copy:
   - Project URL
   - anon/public key
4. Paste ONLY those two public values into config.js.
5. NEVER paste the service_role key into GitHub or browser code.
6. Upload index.html, style.css, script.js, config.js to GitHub Pages.

SECURITY
- Passwords are handled by Supabase Auth.
- RLS prevents users from reading other customers' records.
- Browser users cannot freely insert paid orders.
- Real payment orders must be created by a secure backend/webhook after payment verification.

NEXT PRODUCTION STEP
- Payment gateway server-side integration
- Domain registrar API
- Admin dashboard/backend
- Government/third-party fee updater
- Hosting/email provisioning
