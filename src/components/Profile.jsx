import { useState } from 'react'
import { useApp, sha } from '../lib/store.jsx'
const Box = ({ title, children }) => <section className="rounded-lg border bg-white p-4"><h3 className="mb-3 font-semibold text-ksa">{title}</h3>{children}</section>
const PRESETS = ['#006C35', '#0B5394', '#7B1FA2', '#B71C1C', '#E65100', '#37474F']
export default function Profile() {
  const { profile, update, progress, replaceAll, resetProgress } = useApp(), [o, setO] = useState(''), [n, setN] = useState(''), [n2, setN2] = useState(''), [msg, setMsg] = useState(''), [hex, setHex] = useState(profile.color)
  const change = async () => { if (await sha(o) !== (profile.hash || await sha('admin'))) return setMsg('Current password is wrong'); if (n.length < 4 || n !== n2) return setMsg('New passwords must match (minimum 4 characters)'); update({ hash: await sha(n) }); setO(''); setN(''); setN2(''); setMsg('Password changed') }
  const setColor = c => { setHex(c); if (/^#[0-9a-f]{6}$/i.test(c)) update({ color: c }) }
  const upload = key => e => { const f = e.target.files[0]; if (!f) return; if (f.size > 400 * 1024) return alert('Image must be under 400 KB'); const r = new FileReader(); r.onload = () => update({ [key]: r.result }); r.readAsDataURL(f) }
  const Img = ({ k, label, hint }) => <div className="mb-4"><p className="text-sm font-medium">{label}</p><p className="text-xs text-slate-500">{hint}</p>
    <div className="mt-1 flex items-center gap-3">{profile[k] ? <img src={profile[k]} alt={label} className="max-h-16 rounded border bg-white p-1" /> : <span className="text-xs text-slate-400">None uploaded</span>}
      <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={upload(k)} className="text-xs" />{profile[k] && <button onClick={() => update({ [k]: null })} className="text-xs text-red-600 underline">Remove</button>}</div></div>
  const backup = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ profile, progress })], { type: 'application/json' })); a.download = `compliance-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click() }
  const restore = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { replaceAll(JSON.parse(t)); alert('Backup restored') } catch { alert('Invalid backup file') } }) }
  const inp = 'w-full rounded border px-3 py-2 text-sm'
  return (<div className="mx-auto grid max-w-5xl gap-4 px-4 py-6 md:grid-cols-2">
    <Box title="Change password"><div className="space-y-2"><input type="password" placeholder="Current password" value={o} onChange={e => setO(e.target.value)} className={inp} /><input type="password" placeholder="New password" value={n} onChange={e => setN(e.target.value)} className={inp} /><input type="password" placeholder="Confirm new password" value={n2} onChange={e => setN2(e.target.value)} className={inp} />
      <button onClick={change} className="rounded bg-ksa px-4 py-2 text-sm text-white">Update password</button>{msg && <p className="text-sm">{msg}</p>}</div></Box>
    <Box title="Theme colour"><div className="flex items-center gap-3"><input type="color" value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#006C35'} onChange={e => setColor(e.target.value)} className="h-10 w-14 cursor-pointer" aria-label="Pick colour" />
      <input value={hex} onChange={e => setColor(e.target.value)} placeholder="#006C35" maxLength={7} className="w-32 rounded border px-3 py-2 font-mono text-sm" /></div>
      <div className="mt-3 flex gap-2">{PRESETS.map(c => <button key={c} onClick={() => setColor(c)} aria-label={c} style={{ background: c }} className="h-7 w-7 rounded-full border" />)}</div><p className="mt-2 text-xs text-slate-500">Applies to the whole site, the dashboard and PDF exports.</p></Box>
    <Box title="Branding for PDF exports">
      <Img k="logo" label="Logo" hint="Shown top-left of the site and on every export (PNG/JPG/SVG, max 400 KB)." />
      <Img k="signature" label="Signature" hint="Printed bottom-left of exported reports." /><Img k="seal" label="Seal / stamp" hint="Printed bottom-right of exported reports." /></Box>
    <Box title="Backup & data"><p className="mb-3 text-xs text-slate-500">All progress is stored in this browser only. Download a backup regularly, and use it to move to another PC.</p>
      <div className="flex flex-wrap items-center gap-2"><button onClick={backup} className="rounded bg-ksa px-3 py-2 text-sm text-white">Download backup</button><label className="cursor-pointer rounded border border-ksa px-3 py-2 text-sm text-ksa">Restore backup<input type="file" accept=".json" onChange={restore} className="hidden" /></label>
        <button onClick={() => confirm('Clear ALL completion data?') && resetProgress()} className="rounded border border-red-600 px-3 py-2 text-sm text-red-600">Reset progress</button></div></Box>
  </div>)
}
