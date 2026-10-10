import { useState, useEffect } from 'react'
import { useApp } from '../lib/store.jsx'
import { universe } from '../lib/items.js'
import { download } from '../lib/exporter.js'
import { ASEC } from './TopBar.jsx'
const Box = ({ title, children }) => <section className="rounded-xl border bg-white p-4 shadow-sm"><h3 className="mb-3 font-semibold text-ksa">{title}</h3>{children}</section>
const inp = 'rounded-lg border px-2 py-1.5 text-sm', btn = 'rounded-lg bg-ksa px-3 py-1.5 text-sm text-white', btn2 = 'rounded-lg border border-ksa px-3 py-1.5 text-sm text-ksa', danger = 'rounded-lg border border-red-600 px-3 py-1.5 text-sm text-red-600'
const ERR = { username_taken: 'That username already exists', last_admin: 'At least one active admin is required', weak_password: 'Password must be at least 8 characters', bad_username: 'Username: 3–40 letters, numbers, . _ -' }
const run = async fn => { try { return await fn() } catch (e) { alert(ERR[e.message] || e.message) } }
const rnd = (a, b) => Math.floor(a + Math.random() * (b - a + 1)), pick = a => a[rnd(0, a.length - 1)], day = o => new Date(Date.now() + o * 864e5).toISOString()
const NAMES = ['Ahmed Al-Qahtani', 'Sara Al-Otaibi', 'Khalid Al-Harbi', 'Noura Al-Dossari', 'Faisal Al-Mutairi', 'Layla Al-Zahrani']
const DEPTS = ['Data Governance Office', 'IT', 'Legal & Compliance', 'Risk', 'Operations']
const makeSample = (items, pct) => items.map((i, n) => {
  const owner = pick(NAMES), reviewer = pick(NAMES), dept = pick(DEPTS)
  if (Math.random() * 100 < pct) { const o = -rnd(1, 120), r = Math.random(), wf = r < .2 ? 'Evidence Submitted' : r < .4 ? 'Under Review' : r < .85 ? 'Verified Compliant' : r < .95 ? 'Partially Compliant' : 'Non-Compliant'
    return { k: i.key, done: true, date: day(o), due: day(o + rnd(-7, 10)).slice(0, 10), start: day(o - rnd(5, 30)).slice(0, 10), owner, reviewer, dept, wf, pct: 100, ref: `EV-${1000 + n}`, note: 'Sample data', sample: true } }
  const wf = pick(['In Progress', 'In Progress', 'Not Started', 'Not Started']), od = Math.random() < .35
  return { k: i.key, done: false, due: day(od ? -rnd(1, 45) : rnd(1, 75)).slice(0, 10), start: day(-rnd(1, 40)).slice(0, 10), owner, reviewer, dept, wf, pct: wf === 'Not Started' ? 0 : rnd(10, 80), ref: '', note: 'Sample data', sample: true }
})
function Users() {
  const { call } = useApp(), [list, setList] = useState([]), [f, setF] = useState({ u: '', d: '', r: 'contributor', p: '' }), load = () => call('app_list_users').then(setList).catch(e => alert(e.message)); useEffect(() => { load() }, [])
  const upd = (u, patch) => run(async () => { const x = { ...u, ...patch }; await call('app_update_user', { p_uid: u.id, p_display: x.display_name, p_role: x.role, p_active: x.active, p_unlock: !!patch.unlock }); load() })
  return (<div className="space-y-4"><Box title="Create user"><div className="flex flex-wrap items-end gap-2">
    <input placeholder="Username" value={f.u} onChange={e => setF({ ...f, u: e.target.value })} className={inp} /><input placeholder="Display name" value={f.d} onChange={e => setF({ ...f, d: e.target.value })} className={inp} />
    <select value={f.r} onChange={e => setF({ ...f, r: e.target.value })} className={inp}><option value="contributor">Contributor (can update)</option><option value="viewer">Viewer (read only)</option><option value="admin">Admin</option></select>
    <input type="password" placeholder="Temporary password (min 8)" value={f.p} onChange={e => setF({ ...f, p: e.target.value })} className={inp} />
    <button className={btn} onClick={() => run(async () => { await call('app_create_user', { p_username: f.u, p_display: f.d, p_role: f.r, p_password: f.p }); setF({ u: '', d: '', r: 'contributor', p: '' }); load() })}>Create</button></div>
    <p className="mt-2 text-xs text-slate-500">The user must set their own password at first sign-in.</p></Box>
    <Box title={`Users (${list.length})`}><div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-xs text-slate-500"><th className="p-1">Username</th><th>Name</th><th>Role</th><th>Active</th><th>Last login</th><th>Actions</th></tr></thead>
      <tbody>{list.map(u => <tr key={u.id} className="border-b"><td className="p-1 font-medium">{u.username}{u.locked && <span className="ml-1 rounded bg-red-100 px-1 text-xs text-red-700">locked</span>}</td><td>{u.display_name}</td>
        <td><select value={u.role} onChange={e => upd(u, { role: e.target.value })} className={inp}><option value="admin">admin</option><option value="contributor">contributor</option><option value="viewer">viewer</option></select></td>
        <td><input type="checkbox" checked={u.active} onChange={e => upd(u, { active: e.target.checked })} /></td><td className="text-xs">{u.last_login ? new Date(u.last_login).toLocaleString('en-GB') : '—'}</td>
        <td className="space-x-2 text-xs"><button className="text-ksa underline" onClick={() => { const p = prompt(`New temporary password for ${u.username} (min 8 characters)`); p && run(() => call('app_reset_password', { p_uid: u.id, p_password: p }).then(() => alert('Password reset – the user must change it at next sign-in'))) }}>Reset password</button>
          {u.locked && <button className="text-ksa underline" onClick={() => upd(u, { unlock: true })}>Unlock</button>}<button className="text-red-600 underline" onClick={() => run(() => call('app_revoke_sessions', { p_uid: u.id }).then(() => alert('Signed out')))}>Sign out</button></td></tr>)}</tbody></table></div></Box></div>)
}
function Security() {
  const { call } = useApp()
  return (<div className="space-y-4"><Box title="Roles"><table className="w-full text-left text-sm"><thead><tr className="border-b text-xs text-slate-500"><th className="p-1">Capability</th><th>Viewer</th><th>Contributor</th><th>Admin</th></tr></thead><tbody>
    {[['View all content, dashboard, exports, emails', 1, 1, 1], ['Update status, owner, dates, notes', 0, 1, 1], ['Attach / submit evidence and mark completed', 0, 1, 1], ['Edit menu & content, branding', 0, 0, 1], ['Manage users, security, sample data, backups', 0, 0, 1]].map(r => <tr key={r[0]} className="border-b"><td className="p-1">{r[0]}</td>{r.slice(1).map((x, i) => <td key={i}>{x ? '✔' : '—'}</td>)}</tr>)}</tbody></table></Box>
    <Box title="Security policy in force"><ul className="list-disc space-y-1 pl-5 text-sm"><li>Passwords are stored as salted bcrypt hashes in PostgreSQL; minimum 8 characters.</li><li>New and reset accounts must change the password at first sign-in.</li><li>5 wrong passwords lock an account for 15 minutes (admins can unlock).</li><li>Sessions expire after 12 hours; admins can force sign-out.</li><li>All reads/writes go through server functions that check the role; tables are not directly reachable from the browser.</li><li>Every sign-in, change, export and clear action is written to the audit log.</li></ul>
      <button className={danger + ' mt-3'} onClick={() => confirm('Sign out every other user now?') && run(() => call('app_revoke_sessions', {}).then(() => alert('Done')))}>Sign out all other users</button></Box></div>)
}
function Audit() {
  const { call } = useApp(), [rows, setRows] = useState([]), load = () => call('app_audit', { p_limit: 300 }).then(setRows).catch(e => alert(e.message)); useEffect(() => { load() }, [])
  return <Box title="Audit log (latest 300)"><button className={btn2 + ' mb-2'} onClick={load}>Refresh</button><div className="max-h-[32rem] overflow-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b text-slate-500"><th className="p-1">When</th><th>User</th><th>Action</th><th>Detail</th></tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="border-b"><td className="p-1 whitespace-nowrap">{new Date(r.at).toLocaleString('en-GB')}</td><td>{r.username}</td><td>{r.action}</td><td className="break-all">{r.detail}</td></tr>)}</tbody></table></div></Box>
}
function Branding() {
  const { settings, saveSetting } = useApp(), [hex, setHex] = useState(settings.color), up = k => e => { const f = e.target.files[0]; if (!f) return; if (f.size > 400 * 1024) return alert('Image must be under 400 KB'); const r = new FileReader(); r.onload = () => run(() => saveSetting(k, r.result)); r.readAsDataURL(f) }
  const setC = c => { setHex(c); /^#[0-9a-f]{6}$/i.test(c) && run(() => saveSetting('color', c)) }
  const Img = ({ k, l, h }) => <div className="mb-4"><p className="text-sm font-medium">{l}</p><p className="text-xs text-slate-500">{h}</p><div className="mt-1 flex items-center gap-3">{settings[k] ? <img src={settings[k]} alt={l} className="max-h-16 rounded border bg-white p-1" /> : <span className="text-xs text-slate-400">None</span>}<input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={up(k)} className="text-xs" />{settings[k] && <button className="text-xs text-red-600 underline" onClick={() => run(() => saveSetting(k, null))}>Remove</button>}</div></div>
  return (<div className="grid gap-4 md:grid-cols-2"><Box title="Theme colour (all users)"><div className="flex items-center gap-3"><input type="color" value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#006C35'} onChange={e => setC(e.target.value)} className="h-10 w-14 cursor-pointer" /><input value={hex} onChange={e => setC(e.target.value)} maxLength={7} className="w-32 rounded border px-3 py-2 font-mono text-sm" /></div>
    <div className="mt-3 flex gap-2">{['#006C35', '#0B5394', '#7B1FA2', '#B71C1C', '#E65100', '#37474F'].map(c => <button key={c} onClick={() => setC(c)} style={{ background: c }} aria-label={c} className="h-7 w-7 rounded-full border" />)}</div></Box>
    <Box title="Logo, signature & seal"><Img k="logo" l="Logo" h="Top-left of the site and all exports." /><Img k="signature" l="Signature" h="Printed on exported reports." /><Img k="seal" l="Seal / stamp" h="Printed on exported reports." /></Box></div>)
}
function Sample() {
  const { call, refresh } = useApp(), [pct, setPct] = useState(70), [busy, setBusy] = useState(false), w = async fn => { setBusy(true); await run(fn); await refresh(); setBusy(false) }
  return (<div className="space-y-4"><Box title="Populate sample data"><p className="mb-3 text-sm text-slate-600">Fills every NDMO specification, NDI evidence item and OE metric with demo statuses, owners and dates. Completed items get a past submitted date; the rest are pending with a mix of overdue and upcoming due dates. Your real data is never overwritten.</p>
    <label className="text-sm">Completed share: <b>{pct}%</b><input type="range" min="0" max="100" value={pct} onChange={e => setPct(+e.target.value)} className="ml-3 align-middle" /></label>
    <div className="mt-3 flex flex-wrap gap-2"><button disabled={busy} className={btn} onClick={() => w(async () => { const n = await call('app_bulk_progress', { p_rows: makeSample(universe(), pct), p_wipe: true }); alert(`${n} items filled with sample data`) })}>{busy ? 'Working…' : 'Populate / regenerate sample data'}</button>
      <button disabled={busy} className={btn2} onClick={() => confirm('Remove sample data only?') && w(() => call('app_clear', { p_what: 'sample' }))}>Clear sample data</button></div></Box>
    <Box title="Danger zone"><p className="mb-2 text-sm text-slate-600">Deletes ALL completion data and evidence files (not users, menus or branding). Download a backup first.</p>
      <button disabled={busy} className={danger} onClick={() => prompt('Type CLEAR to delete all progress and evidence files') === 'CLEAR' && w(() => call('app_clear', { p_what: 'all' }))}>Clear ALL progress & evidence</button></Box></div>)
}
function Backup() {
  const { call, refresh } = useApp(), [files, setFiles] = useState(false)
  const exp = () => run(async () => { const d = await call('app_export', { p_files: files }); download(`ndmo-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(d), 'application/json') })
  const imp = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => run(async () => { if (confirm('Restore this backup? Matching items will be overwritten.')) { await call('app_import', { p_data: JSON.parse(t) }); await refresh(); alert('Backup restored') } })) }
  const old = () => run(async () => { const o = JSON.parse(localStorage.getItem('progress') || '{}'), rows = Object.entries(o).map(([k, v]) => ({ k, done: !!v.done, date: v.date, due: v.due, owner: v.owner, ref: v.ref, note: v.note, wf: v.done ? 'Completed' : 'Not started', pct: v.done ? 100 : 0, sample: false })); if (!rows.length) return alert('No data found in this browser'); alert(`${await call('app_bulk_progress', { p_rows: rows, p_wipe: false })} items imported from this browser`); refresh() })
  return (<div className="space-y-4"><Box title="Export (explicit backup)"><p className="mb-2 text-sm text-slate-600">Downloads progress, evidence metadata, menus, branding and user list (no passwords). Take a backup before upgrades or clearing data. Your Supabase data itself is not touched by software updates.</p>
    <label className="mr-3 text-sm"><input type="checkbox" checked={files} onChange={e => setFiles(e.target.checked)} /> Include attached evidence files (larger file)</label><button className={btn} onClick={exp}>Download full backup</button></Box>
    <Box title="Restore"><label className={btn2 + ' inline-block cursor-pointer'}>Restore from backup file<input type="file" accept=".json" onChange={imp} className="hidden" /></label></Box>
    <Box title="Import from the old browser-only version"><p className="mb-2 text-sm text-slate-600">If you used the earlier version on this PC, bring its saved progress into the database.</p><button className={btn2} onClick={old}>Import progress from this browser</button></Box></div>)
}
export default function Admin({ section }) {
  const { isAdmin } = useApp(); if (!isAdmin) return <p className="p-10 text-center text-sm text-red-600">Admin access required.</p>
  const C = { users: Users, security: Security, audit: Audit, branding: Branding, sample: Sample, backup: Backup }[section] || Users
  return (<div className="mx-auto max-w-5xl space-y-4 px-4 py-5"><p className="text-sm text-slate-500">Admin panel <span aria-hidden>›</span> <b className="text-slate-800">{ASEC.find(a => a[0] === section)?.[1]}</b></p><C /></div>)
}
