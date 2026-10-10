import { useState, useEffect, useMemo } from 'react'
import { Download, FileText, Trash2, Pencil, Plus, BookOpen, Paperclip } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { universe } from '../lib/items.js'
const P = 'flex items-center gap-1 rounded-lg bg-ksa px-3 py-1.5 text-xs font-medium text-white', B = 'rounded-lg border border-ksa px-3 py-1.5 text-xs font-medium text-ksa hover:bg-ksa-light', S = 'rounded-lg border px-2 py-1.5 text-sm'
const save = (a, name, mime, data) => { const x = document.createElement('a'); x.href = `data:${mime || 'application/octet-stream'};base64,${data}`; x.download = name; x.click() }
export function DocCard({ d, onEdit, onDelete }) {
  const { call, isAdmin } = useApp()
  const dl = async () => { const x = await call('app_get_doc', { p_id: d.id }).catch(e => alert(e.message)); x && save(0, d.filename || d.title + '.pdf', x.mime, x.data) }
  return <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><FileText className="mt-1 shrink-0 text-ksa" size={28} /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{d.title}</p><p className="text-xs text-slate-500">{d.version} · {d.publisher}</p><p className="mt-1 text-xs text-slate-600">{d.descr}</p>
    <div className="mt-2 flex flex-wrap gap-2">{d.has_data ? <button onClick={dl} className={P}><Download size={13} />Download PDF</button> : d.url ? <a href={d.url} download={d.filename} className={P}><Download size={13} />Download PDF</a> : <span className="text-xs text-red-600">No file attached</span>}
      {isAdmin && onEdit && <><button onClick={() => onEdit(d)} className={B}><Pencil size={12} className="mr-1 inline" />Edit / replace file</button><button onClick={() => onDelete(d)} className="rounded-lg border border-red-600 px-3 py-1.5 text-xs text-red-600"><Trash2 size={12} className="mr-1 inline" />Delete</button></>}</div></div></div>
}
export function RegLibrary() {
  const { docs, isAdmin, call, refresh } = useApp(), [f, setF] = useState(null), [busy, setBusy] = useState(false)
  const pick = e => { const file = e.target.files[0]; if (!file) return; if (file.size > 6 * 1024 * 1024) { e.target.value = ''; return alert('File must be 6 MB or smaller') } const r = new FileReader(); r.onload = () => setF(x => ({ ...x, data: r.result.split(',')[1], filename: file.name, mime: file.type || 'application/pdf' })); r.readAsDataURL(file) }
  const submit = async () => { if (!f.title?.trim()) return alert('Enter a title'); if (!f.id && !f.data) return alert('Choose a file'); setBusy(true)
    try { await call('app_save_doc', { p_id: f.id || null, p_tag: f.tag, p_title: f.title, p_version: f.version || '', p_publisher: f.publisher || '', p_descr: f.descr || '', p_filename: f.filename || null, p_mime: f.mime || null, p_data: f.data || null, p_sort: f.sort || docs.length + 1 }); setF(null); await refresh() } catch (e) { alert(e.message) } setBusy(false) }
  const del = async d => { if (confirm(`Delete "${d.title}" from the library?`)) { await call('app_delete_doc', { p_id: d.id }).catch(e => alert(e.message)); refresh() } }
  const inp = (l, k, ph) => <label className="text-xs text-slate-600">{l}<input value={f[k] || ''} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={ph} className={S + ' mt-0.5 w-full'} /></label>
  return (<div className="space-y-4"><div className="flex flex-wrap items-center gap-3"><div className="min-w-0 flex-1"><h2 className="text-xl font-semibold">Regulatory Library</h2><p className="text-sm text-slate-500">Official documents used by this tracker. Always check SDAIA for the latest published version.</p></div>
    {isAdmin && <button className={P} onClick={() => setF({ tag: 'NDMO' })}><Plus size={14} />Add document</button>}</div>
    {f && <div className="space-y-3 rounded-xl border border-ksa bg-white p-4 shadow-sm"><p className="text-sm font-semibold text-ksa">{f.id ? 'Edit document' : 'Add document'}</p><div className="grid gap-2 sm:grid-cols-2">{inp('Title', 'title')}{inp('Version', 'version', 'Version 1.0')}{inp('Publisher', 'publisher')}
      <label className="text-xs text-slate-600">Section<select value={f.tag} onChange={e => setF({ ...f, tag: e.target.value })} className={S + ' mt-0.5 w-full'}><option>NDMO</option><option>NDI</option><option>NDI OE</option></select></label></div>{inp('Description', 'descr')}
      <label className="block text-xs text-slate-600">{f.id ? 'Replace file (optional, max 6 MB)' : 'File (PDF, max 6 MB)'}<input type="file" accept=".pdf,.doc,.docx,.xlsx,.pptx" onChange={pick} className="mt-1 block text-xs" /></label>{f.filename && f.data && <p className="text-xs text-emerald-700">Selected: {f.filename}</p>}
      <div className="flex gap-2"><button disabled={busy} onClick={submit} className={P}>{busy ? 'Saving…' : 'Save'}</button><button onClick={() => setF(null)} className={B}>Cancel</button></div></div>}
    {['NDMO', 'NDI', 'NDI OE'].map(t => { const l = docs.filter(d => d.tag === t); return l.length ? <section key={t}><h3 className="mb-2 text-sm font-semibold text-ksa">{t}</h3><div className="grid gap-3 md:grid-cols-2">{l.map(d => <DocCard key={d.id} d={d} onEdit={d => setF({ ...d, id: d.id, version: d.version, publisher: d.publisher, descr: d.descr, data: null })} onDelete={del} />)}</div></section> : null })}
    {!docs.length && <p className="text-sm text-slate-400">No documents yet.</p>}</div>)
}
export function EvidenceLibrary({ go }) {
  const { call, nodes, isAdmin } = useApp(), [rows, setRows] = useState(null), [q, setQ] = useState(''), [by, setBy] = useState(''), [kind, setKind] = useState('')
  const load = () => call('app_list_all_files').then(setRows).catch(() => setRows([])); useEffect(() => { load() }, [])
  const U = useMemo(() => Object.fromEntries(universe().map(i => [i.key, i])), [nodes]), get = async id => { const d = await call('app_get_file', { p_id: id }); save(0, d.filename, d.mime, d.data) }
  const del = async r => { if (confirm(`Delete ${r.filename}?`)) { await call('app_delete_file', { p_id: r.id }).catch(e => alert(e.message)); load() } }
  if (!rows) return <p className="p-10 text-center text-sm text-slate-500">Loading…</p>
  const users = [...new Set(rows.map(r => r.uploaded_by))], list = rows.filter(r => { const i = U[r.item_key]; return (!by || r.uploaded_by === by) && (!kind || i?.kind === kind) && (!q || `${r.filename} ${i?.title || ''}`.toLowerCase().includes(q.toLowerCase())) })
  return (<div className="space-y-3"><h2 className="text-xl font-semibold">Evidence Library</h2>
    <div className="flex flex-wrap gap-2"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search file or requirement" className={S + ' w-64'} /><select value={kind} onChange={e => setKind(e.target.value)} className={S}><option value="">All regulations</option><option value="NDMO">NDMO</option><option value="NDI">NDI</option><option value="OE">NDI OE</option></select><select value={by} onChange={e => setBy(e.target.value)} className={S}><option value="">All uploaders</option>{users.map(u => <option key={u}>{u}</option>)}</select><span className="self-center text-sm text-slate-500">{list.length} file(s)</span></div>
    <div className="overflow-auto rounded-xl border bg-white shadow-sm"><table className="w-full text-left text-sm"><thead><tr className="border-b bg-slate-50 text-xs text-slate-500"><th className="p-2">File</th><th>Requirement</th><th>Uploaded by</th><th>Date</th><th>Size</th><th /></tr></thead>
      <tbody>{list.map(r => { const i = U[r.item_key]; return <tr key={r.id} className="border-b align-top"><td className="p-2 break-all">{r.filename}</td><td className="min-w-[14rem]">{i ? <button onClick={() => go(i.nav)} className="text-left text-ksa hover:underline">{i.title}</button> : r.item_key}</td><td>{r.uploaded_by}</td><td className="whitespace-nowrap">{new Date(r.uploaded_at).toLocaleDateString('en-GB')}</td><td>{Math.round(r.size / 1024)} KB</td>
        <td className="space-x-2 whitespace-nowrap"><button onClick={() => get(r.id)} className="text-ksa" aria-label="Download"><Download size={16} /></button>{isAdmin && <button onClick={() => del(r)} className="text-red-600" aria-label="Delete"><Trash2 size={16} /></button>}</td></tr> })}
        {!list.length && <tr><td colSpan="6" className="p-6 text-center text-slate-400">No evidence files yet. Attach evidence on any requirement page.</td></tr>}</tbody></table></div></div>)
}
export default function Library({ go }) {
  const [sec, setSec] = useState('reg'), M = [['reg', 'Regulatory Library', BookOpen], ['evidence', 'Evidence Library', Paperclip]]
  return (<div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-4 lg:grid-cols-[15rem_minmax(0,1fr)]"><nav aria-label="Library" className="flex gap-2 overflow-x-auto rounded-xl border bg-white p-2 shadow-sm lg:flex-col lg:self-start">
    <p className="hidden px-2 pt-1 text-[11px] font-semibold uppercase text-slate-400 lg:block">Library</p>{M.map(([k, l, I]) => <button key={k} onClick={() => setSec(k)} className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm ${sec === k ? 'bg-ksa text-white' : 'hover:bg-ksa-light'}`}><I size={16} />{l}</button>)}</nav>
    <div className="min-w-0">{sec === 'reg' ? <RegLibrary /> : <EvidenceLibrary go={go} />}</div></div>)
}
