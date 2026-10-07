import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useApp, sha } from '../lib/store.jsx'
export default function Login() {
  const { profile, login } = useApp(), [u, setU] = useState(''), [p, setP] = useState(''), [err, setErr] = useState('')
  const submit = async e => { e.preventDefault(); const ok = u === (profile.username || 'admin') && await sha(p) === (profile.hash || await sha('admin')); ok ? login(u) : setErr('Invalid username or password') }
  return (<div className="flex min-h-screen items-center justify-center bg-ksa-light p-4">
    <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-lg">
      <div className="flex flex-col items-center gap-2 text-ksa">{profile.logo ? <img src={profile.logo} alt="logo" className="max-h-16" /> : <ShieldCheck size={44} />}<h1 className="text-lg font-semibold">NDMO / NDI Compliance Tracker</h1></div>
      <label className="block text-sm">Username<input autoFocus value={u} onChange={e => setU(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="block text-sm">Password<input type="password" value={p} onChange={e => setP(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <button className="w-full rounded bg-ksa py-2 font-medium text-white">Sign in</button>
      <p className="text-center text-xs text-slate-500">First time? Use admin / admin, then change the password in Profile.</p></form></div>)
}
