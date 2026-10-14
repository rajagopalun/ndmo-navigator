import { useState, useEffect } from 'react'
import { Paperclip, Trash2, Download, Upload, X } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { WF, Badge, today } from '../lib/ui.jsx'
const VERDICT = ['Verified Compliant', 'Partially Compliant', 'Non-Compliant'], SUB = w => !['Not Started', 'In Progress'].includes(w)
const ERR = { evidence_required: 'Attach at least one evidence file (or enter an evidence reference) before submitting evidence.', reviewer_only: 'Only the named reviewer or an admin can set a compliance verdict. Enter the reviewer’s username in “Reviewer” first.', bad_status: 'Unknown status' }
const Fld = ({ l, v, set, type = 'text', disabled }) => <label className="text-xs text-slate-600">{l}<input type={type} value={v ?? ''} disabled={disabled} onChange={e => set(e.target.value)} className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm disabled:bg-slate-50" /></label>
function History({ k, tick }) {
  const { call } = useApp(), [rows, setRows] = useState(null); useEffect(() => { call('app_item_history', { k }).then(setRows).catch(() => setRows([])) }, [tick])
  if (!rows) return <p className="text-xs text-slate-400">Loading history…</p>
  return rows.length ? <ul className="max-h-48 space-y-1 overflow-auto text-xs">{rows.map((r, i) => <li key={i} className="rounded border bg-white px-2 py-1"><span className="text-slate-400">{new Date(r.at).toLocaleString('en-GB')}</span> · <b>{r.username}</b> · <span className="uppercase text-ksa">{r.event}</span><br />{r.detail}</li>)}</ul> : <p className="text-xs text-slate-400">No review history yet.</p>
}
export default function Track({ k, children, extra, defaultOpen = false }) {
  const { progress, canEdit, call, refresh, user, isAdmin, setItem } = useApp(), p = progress[k] || {}
  const [open, setOpen] = useState(defaultOpen), [files, setFiles] = useState([]), [busy, setBusy] = useState(false), [d, setD] = useState({}), [staged, setStaged] = useState([]), [tick, setTick] = useState(0)
  const wf = d.wf ?? p.wf ?? 'Not Started', v = f => d[f] ?? p[f] ?? '', dirty = Object.keys(d).length > 0 || staged.length > 0
  const set = (f, val) => setD(x => { const n = { ...x, [f]: val }; if (String(val) === String(p[f] ?? (f === 'wf' ? 'Not Started' : ''))) delete n[f]; return n })
  const over = !p.done && p.due && p.due < today(), canVerdict = isAdmin || (p.reviewer || '').toLowerCase() === (user || '').toLowerCase()
  const load = () => call('app_list_files', { k }).then(setFiles).catch(() => {}); useEffect(() => { if (open) load() }, [open])
  const stage = e => { const ok = [...e.target.files].filter(f => f.size <= 3 * 1024 * 1024 || (alert(`${f.name} is larger than 3 MB`), false)); setStaged(s => [...s, ...ok]); e.target.value = '' }
  const save = async () => {
    if (SUB(wf) && !p.done && !p.files && !staged.length && !v('ref')) { setOpen(true); return alert(ERR.evidence_required) }
    setBusy(true)
    try {
      for (const f of staged) { const b64 = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result.split(',')[1]); fr.readAsDataURL(f) }); await call('app_add_file', { k, fname: f.name, mime: f.type, b64 }) }
      const patch = { ...d }; if ('pct' in patch) patch.pct = Math.min(100, Math.max(0, +patch.pct || 0))
      Object.keys(patch).length ? await setItem(k, patch) : await refresh()
      setD({}); setStaged([]); setTick(t => t + 1); load()
    } catch (e) { alert(ERR[e.message] || e.message); await refresh() }
    setBusy(false)
  }
  const get = async id => { const x = await call('app_get_file', { p_id: id }); const a = document.createElement('a'); a.href = `data:${x.mime || 'application/octet-stream'};base64,${x.data}`; a.download = x.filename; a.click() }
  const del = async id => { if (confirm('Delete this attachment?')) { await call('app_delete_file', { p_id: id }).catch(e => alert(e.message)); await load(); refresh() } }
  const bar = dirty && <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs sm:ml-6"><span className="flex-1 text-amber-800">Unsaved changes – press Save to record them and log the review history.</span>
    <button disabled={busy} onClick={save} className="rounded-lg bg-ksa px-3 py-1.5 font-medium text-white">{busy ? 'Saving…' : 'Save changes'}</button><button disabled={busy} onClick={() => { setD({}); setStaged([]) }} className="rounded-lg border px-3 py-1.5">Discard changes</button></div>
  return (<div className={`rounded-xl border bg-white p-3 shadow-sm ${p.done ? 'border-emerald-300' : 'border-slate-200'}`}>
    <label className="flex cursor-pointer gap-2 text-sm"><input type="checkbox" checked={SUB(wf)} disabled={!canEdit} onChange={e => set('wf', e.target.checked ? (SUB(wf) ? wf : 'Evidence Submitted') : 'In Progress')} className="mt-1 h-4 w-4" aria-label="Evidence submitted" /><span className="flex-1">{children}</span></label>
    {extra && <div className="ml-6 mt-1">{extra}</div>}
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:ml-6"><Badge s={p.wf || 'Not Started'} />{p.files > 0 && <span className="flex items-center gap-0.5 text-slate-600"><Paperclip size={12} />{p.files}</span>}
      {p.done && <span className="text-slate-500">Submitted {new Date(p.date).toLocaleDateString('en-GB')}{p.by ? ` by ${p.by}` : ''}</span>}
      {over && <span className="font-medium text-red-600">Overdue · {p.due}</span>}{!p.done && p.due && !over && <span className="text-slate-500">Due {p.due}</span>}
      {p.owner && <span className="text-slate-500">Owner: {p.owner}</span>}{p.dept && <span className="text-slate-500">· {p.dept}</span>}
      <button onClick={() => setOpen(!open)} className="ml-auto text-ksa underline">{open ? 'Hide details' : 'Details, evidence & history'}</button></div>
    {bar}
    {open && <div className="mt-3 space-y-4 rounded-lg bg-slate-50 p-3 sm:ml-6">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-slate-600">Workflow status<select value={wf} disabled={!canEdit} onChange={e => set('wf', e.target.value)} className="mt-0.5 w-full rounded-lg border bg-white px-2 py-1.5 text-sm">{WF.map(w => <option key={w} disabled={VERDICT.includes(w) && !canVerdict && w !== wf}>{w}</option>)}</select></label>
        <Fld l="Review comment (saved with the next status change)" v={d.comment} set={x => setD(o => ({ ...o, comment: x }))} disabled={!canEdit} />
        <Fld l="Owner (username or name)" v={v('owner')} set={x => set('owner', x)} disabled={!canEdit} /><Fld l="Reviewer (username)" v={v('reviewer')} set={x => set('reviewer', x)} disabled={!canEdit} />
        <Fld l="Department" v={v('dept')} set={x => set('dept', x)} disabled={!canEdit} /><Fld l="Evidence reference (doc no. / link)" v={v('ref')} set={x => set('ref', x)} disabled={!canEdit} />
        <Fld l="Start date" type="date" v={v('start')} set={x => set('start', x)} disabled={!canEdit} /><Fld l="Deadline" type="date" v={v('due')} set={x => set('due', x)} disabled={!canEdit} />
        <Fld l="% complete" type="number" v={v('pct')} set={x => set('pct', x)} disabled={!canEdit || SUB(wf)} /><Fld l="Notes" v={v('note')} set={x => set('note', x)} disabled={!canEdit} /></div>
      <div><p className="mb-1 text-xs font-semibold text-slate-600">Evidence attachments</p>{!files.length && !staged.length && <p className="text-xs text-slate-400">No files attached yet.</p>}
        <ul className="space-y-1">{files.map(f => <li key={f.id} className="flex items-center gap-2 rounded-lg border bg-white px-2 py-1 text-xs"><Paperclip size={12} /><span className="flex-1 break-all">{f.filename}</span><span className="text-slate-400">{Math.round(f.size / 1024)} KB · {f.uploaded_by}</span>
          <button onClick={() => get(f.id)} aria-label="Download" className="text-ksa"><Download size={14} /></button>{canEdit && (isAdmin || f.uploaded_by === user) && <button onClick={() => del(f.id)} aria-label="Delete" className="text-red-600"><Trash2 size={14} /></button>}</li>)}
          {staged.map((f, i) => <li key={i} className="flex items-center gap-2 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-2 py-1 text-xs"><Paperclip size={12} /><span className="flex-1 break-all">{f.name}</span><span className="text-amber-700">not saved</span><button onClick={() => setStaged(s => s.filter((_, j) => j !== i))} aria-label="Remove"><X size={14} /></button></li>)}</ul>
        {canEdit && <label className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded-lg bg-ksa px-3 py-1.5 text-xs text-white"><Upload size={13} />Attach evidence files<input type="file" multiple onChange={stage} className="hidden" /></label>}
        <p className="mt-1 text-[11px] text-slate-400">Max 3 MB per file. Selected files are uploaded when you press Save.</p></div>
      <div><p className="mb-1 text-xs font-semibold text-slate-600">Review history</p><History k={k} tick={tick} /></div></div>}
  </div>)
}
