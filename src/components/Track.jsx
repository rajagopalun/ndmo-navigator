import { useState, useEffect } from 'react'
import { Paperclip, Trash2, Download, Upload } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { WF, Badge, today } from '../lib/ui.jsx'
const VERDICT = ['Verified Compliant', 'Partially Compliant', 'Non-Compliant'], ERR = { evidence_required: 'Attach at least one evidence file (or enter an evidence reference) before submitting evidence.', reviewer_only: 'Only the named reviewer or an admin can set a compliance verdict. Enter the reviewer’s username in “Reviewer” first.', bad_status: 'Unknown status' }
function Field({ l, v, onSave, type = 'text', disabled }) {
  const [x, setX] = useState(v ?? ''); useEffect(() => setX(v ?? ''), [v])
  return <label className="text-xs text-slate-600">{l}<input type={type} value={x} disabled={disabled} onChange={e => setX(e.target.value)} onBlur={() => x !== (v ?? '') && onSave(x)} className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm disabled:bg-slate-50" /></label>
}
function History({ k, tick }) {
  const { call } = useApp(), [rows, setRows] = useState(null); useEffect(() => { call('app_item_history', { k }).then(setRows).catch(() => setRows([])) }, [tick])
  if (!rows) return <p className="text-xs text-slate-400">Loading history…</p>
  return rows.length ? <ul className="max-h-48 space-y-1 overflow-auto text-xs">{rows.map((r, i) => <li key={i} className="rounded border bg-white px-2 py-1"><span className="text-slate-400">{new Date(r.at).toLocaleString('en-GB')}</span> · <b>{r.username}</b> · <span className="uppercase text-ksa">{r.event}</span><br />{r.detail}</li>)}</ul> : <p className="text-xs text-slate-400">No review history yet.</p>
}
export default function Track({ k, children, extra, defaultOpen = false }) {
  const { progress, setItem, canEdit, call, refresh, user, isAdmin } = useApp(), p = progress[k] || {}, [open, setOpen] = useState(defaultOpen), [files, setFiles] = useState([]), [busy, setBusy] = useState(false), [cm, setCm] = useState(''), [tick, setTick] = useState(0)
  const over = !p.done && p.due && p.due < today(), wf = p.wf || 'Not Started', canVerdict = isAdmin || (p.reviewer || '').toLowerCase() === (user || '').toLowerCase()
  const load = () => call('app_list_files', { k }).then(setFiles).catch(() => {})
  useEffect(() => { if (open) load() }, [open])
  const save = async patch => { try { await setItem(k, patch); setTick(t => t + 1) } catch (e) { alert(ERR[e.message] || e.message) } }
  const tickBox = e => { if (e.target.checked && !p.files && !p.ref) { setOpen(true); return alert('Attach your evidence file in the details panel (or enter an evidence reference), then submit.') } save({ done: e.target.checked }) }
  const upload = async e => {
    setBusy(true)
    for (const f of [...e.target.files]) { if (f.size > 3 * 1024 * 1024) { alert(`${f.name} is larger than 3 MB`); continue }
      const b64 = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result.split(',')[1]); fr.readAsDataURL(f) })
      try { await call('app_add_file', { k, fname: f.name, mime: f.type, b64 }) } catch (er) { alert(er.message) } }
    e.target.value = ''; await load(); await refresh(); setTick(t => t + 1); setBusy(false)
  }
  const get = async id => { const d = await call('app_get_file', { p_id: id }); const a = document.createElement('a'); a.href = `data:${d.mime || 'application/octet-stream'};base64,${d.data}`; a.download = d.filename; a.click() }
  const del = async id => { if (confirm('Delete this attachment?')) { await call('app_delete_file', { p_id: id }).catch(e => alert(e.message)); await load(); refresh() } }
  return (<div className={`rounded-xl border bg-white p-3 shadow-sm ${p.done ? 'border-emerald-300' : 'border-slate-200'}`}>
    <label className="flex cursor-pointer gap-2 text-sm"><input type="checkbox" checked={!!p.done} disabled={!canEdit} onChange={tickBox} className="mt-1 h-4 w-4" aria-label="Evidence submitted" /><span className="flex-1">{children}</span></label>
    {extra && <div className="ml-6 mt-1">{extra}</div>}
    <div className="ml-6 mt-2 flex flex-wrap items-center gap-2 text-xs"><Badge s={wf} />{p.files > 0 && <span className="flex items-center gap-0.5 text-slate-600"><Paperclip size={12} />{p.files}</span>}
      {p.done && <span className="text-slate-500">Submitted {new Date(p.date).toLocaleDateString('en-GB')}{p.by ? ` by ${p.by}` : ''}</span>}
      {over && <span className="font-medium text-red-600">Overdue · {p.due}</span>}{!p.done && p.due && !over && <span className="text-slate-500">Due {p.due}</span>}
      {p.owner && <span className="text-slate-500">Owner: {p.owner}</span>}{p.dept && <span className="text-slate-500">· {p.dept}</span>}
      <button onClick={() => setOpen(!open)} className="ml-auto text-ksa underline">{open ? 'Hide details' : 'Details, evidence & history'}</button></div>
    {open && <div className="ml-0 mt-3 space-y-4 rounded-lg bg-slate-50 p-3 sm:ml-6">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-slate-600">Workflow status<select value={wf} disabled={!canEdit} onChange={e => save({ wf: e.target.value, comment: cm }).then(() => setCm(''))} className="mt-0.5 w-full rounded-lg border bg-white px-2 py-1.5 text-sm">{WF.map(w => <option key={w} disabled={VERDICT.includes(w) && !canVerdict && w !== wf}>{w}</option>)}</select></label>
        <Field l="Review comment (saved with the next status change)" v={cm} disabled={!canEdit} onSave={setCm} />
        <Field l="Owner (username or name)" v={p.owner} disabled={!canEdit} onSave={v => save({ owner: v })} /><Field l="Reviewer (username)" v={p.reviewer} disabled={!canEdit} onSave={v => save({ reviewer: v })} />
        <Field l="Department" v={p.dept} disabled={!canEdit} onSave={v => save({ dept: v })} /><Field l="Evidence reference (doc no. / link)" v={p.ref} disabled={!canEdit} onSave={v => save({ ref: v })} />
        <Field l="Start date" type="date" v={p.start} disabled={!canEdit} onSave={v => save({ start: v })} /><Field l="Deadline" type="date" v={p.due} disabled={!canEdit} onSave={v => save({ due: v })} />
        <Field l="% complete" type="number" v={p.pct} disabled={!canEdit || p.done} onSave={v => save({ pct: Math.min(100, Math.max(0, +v || 0)) })} /><Field l="Notes" v={p.note} disabled={!canEdit} onSave={v => save({ note: v })} /></div>
      <div><p className="mb-1 text-xs font-semibold text-slate-600">Evidence attachments</p>{!files.length && <p className="text-xs text-slate-400">No files attached yet.</p>}
        <ul className="space-y-1">{files.map(f => <li key={f.id} className="flex items-center gap-2 rounded-lg border bg-white px-2 py-1 text-xs"><Paperclip size={12} /><span className="flex-1 break-all">{f.filename}</span><span className="text-slate-400">{Math.round(f.size / 1024)} KB · {f.uploaded_by}</span>
          <button onClick={() => get(f.id)} aria-label="Download" className="text-ksa"><Download size={14} /></button>{canEdit && (isAdmin || f.uploaded_by === user) && <button onClick={() => del(f.id)} aria-label="Delete" className="text-red-600"><Trash2 size={14} /></button>}</li>)}</ul>
        {canEdit && <label className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded-lg bg-ksa px-3 py-1.5 text-xs text-white"><Upload size={13} />{busy ? 'Uploading…' : 'Attach evidence files'}<input type="file" multiple disabled={busy} onChange={upload} className="hidden" /></label>}
        <p className="mt-1 text-[11px] text-slate-400">Max 3 MB per file. Attach evidence, then tick “Evidence submitted” or choose a status.</p></div>
      <div><p className="mb-1 text-xs font-semibold text-slate-600">Review history</p><History k={k} tick={tick} /></div></div>}
  </div>)
}
