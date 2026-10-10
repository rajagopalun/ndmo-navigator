# NDMO / NDI Compliance Tracker (v3)
1. Supabase → SQL Editor → paste `supabase/schema.sql` → Run (re-run after every upgrade; it never deletes data and migrates old statuses).
2. Create `.env` with VITE_SUPABASE_URL (Data API → API URL) and VITE_SUPABASE_ANON_KEY (API Keys → Publishable key).
3. `npm install`, `npm run dev`. On Vercel add the same two variables and redeploy.
Official PDFs are in `public/docs` and are offered for download in the Regulatory Library.

## v4 notes
- Sign-in: `demo` / `Demo@123` is a read-only viewer shown on the login page. Admin panel → Sample data creates contributor accounts (also `Demo@123`).
- LDAP / Active Directory: see Admin panel → Security & policies → Directory sign-in (needs the Vercel `api/` functions and `ldapts`).
