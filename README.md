# NDMO / NDI Compliance Tracker (v2 – Supabase)
1. Create a free project at supabase.com, open SQL Editor, paste `supabase/schema.sql`, click Run (safe to re-run after every upgrade; it never deletes data).
2. Copy `.env.example` to `.env` and fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Project Settings → API).
3. `npm install` then `npm run dev`. In Vercel add the same two variables under Settings → Environment Variables, then redeploy.
4. First sign-in: admin / admin – you are forced to set a new password. Create users in Admin panel (top right menu).
Data lives in Supabase, so redeploying the website never touches it. Take a backup from Admin panel → Backup & export before major upgrades.
