import { useState } from 'react'
import { useApp } from '../lib/store.jsx'
const M = { ldap_user: 'Directory (AD / LDAP) accounts change their password in the directory.', wrong_password: 'Current password is wrong', weak_password: 'New password must be at least 8 characters and not “admin”' }
export default function Profile({ forced }) {
  const { me, call, refresh, logout } = useApp(), [o, setO] = useState(''), [n, setN] = useState(''), [n2, setN2] = useState(''), [msg, setMsg] = useState('')
  const go = async () => { if (n !== n2) return setMsg('New passwords do not match'); try { await call('app_change_password', { old_pw: o, new_pw: n }); setMsg('Password changed'); setO(''); setN(''); setN2(''); refresh() } catch (e) { setMsg(M[e.message] || e.message) } }
  const inp = 'w-full rounded-lg border px-3 py-2 text-sm'
  return (<div className="mx-auto w-full max-w-md px-4 py-8"><section className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
    <h2 className="text-lg font-semibold text-ksa">{forced ? 'Set a new password to continue' : 'Change password'}</h2>
    <p className="text-xs text-slate-500">Signed in as <b>{me.username}</b> · role: <b>{me.role}</b></p>
    <input type="password" placeholder="Current password" value={o} onChange={e => setO(e.target.value)} className={inp} /><input type="password" placeholder="New password (min 8 characters)" value={n} onChange={e => setN(e.target.value)} className={inp} /><input type="password" placeholder="Confirm new password" value={n2} onChange={e => setN2(e.target.value)} className={inp} />
    <div className="flex items-center gap-3"><button onClick={go} className="rounded-lg bg-ksa px-4 py-2 text-sm text-white">Update password</button>{forced && <button onClick={logout} className="text-sm text-slate-500 underline">Log off</button>}</div>{msg && <p className="text-sm">{msg}</p>}</section></div>)
}
