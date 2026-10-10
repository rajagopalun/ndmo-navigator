import { useState, useEffect } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { rpc } from '../lib/api.js'
const M = { invalid_credentials: 'Invalid username or password', account_locked: 'Too many failed attempts – account locked for 15 minutes', account_disabled: 'This account is disabled. Contact your administrator.', ldap_not_configured: 'Directory sign-in is not configured. Contact your administrator.', user_not_registered: 'Your directory account is valid but has not been added to the tracker. Ask an admin.', not_allowed: 'Directory sign-in is not allowed (check the shared secret).' }
export default function Login() {
  const { login, configured } = useApp(), [u, setU] = useState(''), [p, setP] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [pub, setPub] = useState({})
  useEffect(() => { if (configured) rpc('app_public_settings').then(setPub).catch(() => {}) }, [])
  const submit = async e => { e.preventDefault(); setBusy(true); try { const r = await login(u, p); if (r) setErr(M[r] || r) } catch (x) { setErr('Cannot reach the database: ' + x.message) } setBusy(false) }
  return (<div className="flex flex-1 items-center justify-center bg-gradient-to-br from-ksa-light to-white p-4">
    <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-7 shadow-xl">
      <div className="flex flex-col items-center gap-2 text-ksa">{pub.logo ? <img src={pub.logo} alt="Logo" className="max-h-16" /> : <ShieldCheck size={46} />}<h1 className="text-center text-lg font-semibold">{pub.title || 'NDMO / NDI Compliance Tracker'}</h1><p className="text-xs text-slate-500">Sign in to continue</p></div>
      {!configured && <p className="rounded bg-amber-50 p-2 text-xs text-amber-800">Database not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see README).</p>}
      <label className="block text-sm">Username<input autoFocus autoComplete="username" value={u} onChange={e => setU(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
      <label className="block text-sm">Password<input type="password" autoComplete="current-password" value={p} onChange={e => setP(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <button disabled={busy || !configured} className="w-full rounded-lg bg-ksa py-2 font-medium text-white disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
      <div className="rounded-lg bg-ksa-light p-3 text-center text-xs text-ksa-dark"><p className="font-semibold">Demo access (read-only viewer)</p><p className="mt-1">Username: <b>demo</b> · Password: <b>Demo@123</b></p></div></form></div>)
}
