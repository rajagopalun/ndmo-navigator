import { useState, useEffect } from 'react'
import { Paperclip, Trash2, Download, Upload } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
const WF = ['Not started', 'In progress', 'In review', 'Blocked', 'Completed'], today = () => new Date().toISOString().slice(0, 10)
const WFC = { Completed: 'bg-emerald-100 text-emerald-700', 'In progress': 'bg-sky-100 text-sky-700', 'In review': 'bg-violet-100 text-violet-700', Blocked: 'bg-red-100 text-red-700', 'Not started': 'bg-slate-100 text-slate-600' }
function Field({ l, v, onSave, type = 'text', disabled }) {
  const [x, setX] = useState(v ?? ''); useEffect(() => setX(v ?? ''), [v])
  return <label className="text-xs text-slate-600">{l}<input type={type} value={x} disabled={disabled} onChange={e => setX(e.target.value)} onBlur={() => x !== (v ?? '') && onSave(x)} className="mt-0.5 w-full rounded border px-2 py-1 text-sm disabled:bg-slate-50" /></label>
}
export default function Track({ k, children, extra }) {
  const { progress, setItem, canEdit, call, refresh, user, isAdmin } = useApp(), p = progress[k] || {}, [open, setOpen] = useState(false), [files, setFiles] = useState([]), [busy, setBusy] = useState(false)
  const over = !p.done && p.due && p.due < today(), wf = p.done ? 'Completed' : p.wf || 'Not started'
  const load = () => call('app_list_files', { k }).then(setFiles).catch(() => {})
  useEffect(() => { if (open) load() }, [open])
  const save = async patch => { try { await setItem(k, patch) } catch (e) { alert(/evidence_required/.test(e.message) ? 'Attach at least one evidence file (or enter an evidence reference) before marking this as completed.' : e.message) } }
  const tick = e => { if (e.target.checked && !p.files && !p.ref) { setOpen(true); return alert('Attach your evidence file in the details panel (or enter an evidence reference), then tick Completed.') } save({ done: e.target.checked }) }
  const upload = async e => {
    setBusy(true)
    for (const f of [...e.target.files]) {
      if (f.size > 3 * 1024 * 1024) { alert(`${f.name} is larger than 3 MB`); continue }
      const b64 = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result.split(',')[1]); fr.readAsDataURL(f) })
      try { await call('app_add_file', { k, fname: f.name, mime: f.type, b64 }) } catch (er) { alert(er.message) }
    }
    e.target.value = ''; await load(); await refresh(); setBusy(false)
  }
  const get = async id => { const d = await call('app_get_file', { p_id: id }); const a = document.createElement('a'); a.href = `data:${d.mime || 'application/octet-stream'};base64,${d.data}`; a.download = d.filename; a.click() }
  const del = async id => { if (confirm('Delete this attachment?')) { await call('app_delete_file', { p_id: id }).catch(e => alert(e.message)); await load(); refresh() } }
  return (<div className={`rounded-lg border bg-white p-2.5 shadow-sm ${p.done ? 'border-emerald-300' : ''}`}>
    <label className="flex cursor-pointer gap-2 text-sm"><input type="checkbox" checked={!!p.done} disabled={!canEdit} onChange={tick} className="mt-1" /><span className="flex-1">{children}</span></label>
    {extra && <div className="ml-6 mt-1">{extra}</div>}
    <div className="ml-6 mt-1.5 flex flex-wrap items-center gap-2 text-xs">
      <span className={`rounded-full px-2 py-0.5 ${WFC[wf]}`}>{wf}</span>{p.files > 0 && <span className="flex items-center gap-0.5 text-slate-600"><Paperclip size={12} />{p.files}</span>}
      {p.done && <span className="font-medium text-emerald-700">✔ Submitted {new Date(p.date).toLocaleDateString('en-GB')}{p.by ? ` by ${p.by}` : ''}</span>}
      {over && <span className="font-medium text-red-600">Overdue (due {p.due})</span>}{!p.done && p.due && !over && <span className="text-slate-500">Due {p.due}</span>}
      {p.owner && <span className="text-slate-500">Owner: {p.owner}</span>}
      <button onClick={() => setOpen(!open)} className="text-ksa underline">{open ? 'Hide' : 'Details & evidence'}</button></div>
    {open && <div className="ml-6 mt-2 space-y-3 rounded-md bg-slate-50 p-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="text-xs text-slate-600">Workflow status<select value={wf} disabled={!canEdit || p.done} onChange={e => save({ wf: e.target.value })} className="mt-0.5 w-full rounded border bg-white px-2 py-1 text-sm">{WF.filter(w => w !== 'Completed' || p.done).map(w => <option key={w}>{w}</option>)}</select></label>
        <Field l="Owner / assignee" v={p.owner} disabled={!canEdit} onSave={v => save({ owner: v })} /><Field l="Reviewer" v={p.reviewer} disabled={!canEdit} onSave={v => save({ reviewer: v })} />
        <Field l="Start date" type="date" v={p.start} disabled={!canEdit} onSave={v => save({ start: v })} /><Field l="Due date" type="date" v={p.due} disabled={!canEdit} onSave={v => save({ due: v })} />
        <Field l="% complete" type="number" v={p.pct} disabled={!canEdit || p.done} onSave={v => save({ pct: Math.min(100, Math.max(0, +v || 0)) })} />
        {p.done && isAdmin && <Field l="Submitted date" type="date" v={(p.date || '').slice(0, 10)} onSave={v => v && save({ date: new Date(v).toISOString() })} />}
        <Field l="Evidence reference (doc no. / link)" v={p.ref} disabled={!canEdit} onSave={v => save({ ref: v })} /><Field l="Notes" v={p.note} disabled={!canEdit} onSave={v => save({ note: v })} /></div>
      <div><p className="mb-1 text-xs font-semibold text-slate-600">Evidence attachments</p>
        {!files.length && <p className="text-xs text-slate-400">No files attached yet.</p>}
        <ul className="space-y-1">{files.map(f => <li key={f.id} className="flex items-center gap-2 rounded border bg-white px-2 py-1 text-xs"><Paperclip size={12} /><span className="flex-1 break-all">{f.filename}</span><span className="text-slate-400">{Math.round(f.size / 1024)} KB · {f.uploaded_by}</span>
          <button onClick={() => get(f.id)} aria-label="Download" className="text-ksa"><Download size={14} /></button>{canEdit && (isAdmin || f.uploaded_by === user) && <button onClick={() => del(f.id)} aria-label="Delete" className="text-red-600"><Trash2 size={14} /></button>}</li>)}</ul>
        {canEdit && <label className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded bg-ksa px-3 py-1.5 text-xs text-white"><Upload size={13} />{busy ? 'Uploading…' : 'Attach evidence files'}<input type="file" multiple disabled={busy} onChange={upload} className="hidden" /></label>}
        <p className="mt-1 text-[11px] text-slate-400">Max 3 MB per file. Attach evidence first, then tick Completed.</p></div></div>}
  </div>)
}
