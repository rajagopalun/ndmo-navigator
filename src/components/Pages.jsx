import { useState, useEffect, useMemo } from 'react'
import { Download, FileText } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { universe } from '../lib/items.js'
import { exportReport, download } from '../lib/exporter.js'
import { bulkCsv } from '../lib/bulk.js'
import { isMine } from '../lib/search.js'
import { DOCS } from '../lib/docs.js'
import { Card, today } from '../lib/ui.jsx'
import ScopeButtons from './ScopeButtons.jsx'
const P = 'flex items-center gap-1 rounded-lg bg-ksa px-3 py-1.5 text-xs font-medium text-white', B = 'rounded-lg border border-ksa px-3 py-1.5 text-xs font-medium text-ksa hover:bg-ksa-light'
export function DocCard({ d }) { return <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><FileText className="mt-1 shrink-0 text-ksa" size={28} /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{d.title}</p><p className="text-xs text-slate-500">{d.ver} · {d.by}</p><p className="mt-1 text-xs text-slate-600">{d.desc}</p>
  <a href={`/docs/${d.file}`} download className={P + ' mt-2 inline-flex'}><Download size={13} />Download PDF</a></div></div> }
export function RegLibrary() {
  return (<div className="mx-auto max-w-4xl space-y-4 px-4 py-5"><h2 className="text-xl font-semibold">Regulatory Library</h2><p className="text-sm text-slate-500">Official documents used by this tracker. Copies are provided for convenience – always check SDAIA for the latest published version.</p>
    {['NDMO', 'NDI', 'NDI OE'].map(t => <Card key={t} title={t}><div className="grid gap-3 md:grid-cols-2">{DOCS.filter(d => d.tag === t).map(d => <DocCard key={d.file} d={d} />)}</div></Card>)}</div>)
}
export function EvidenceLibrary({ go }) {
  const { call, nodes } = useApp(), [rows, setRows] = useState(null), [q, setQ] = useState(''), [by, setBy] = useState(''), [kind, setKind] = useState('')
  useEffect(() => { call('app_list_all_files').then(setRows).catch(() => setRows([])) }, [])
  const U = useMemo(() => Object.fromEntries(universe().map(i => [i.key, i])), [nodes]), get = async id => { const d = await call('app_get_file', { p_id: id }); const a = document.createElement('a'); a.href = `data:${d.mime || 'application/octet-stream'};base64,${d.data}`; a.download = d.filename; a.click() }
  if (!rows) return <p className="p-10 text-center text-sm text-slate-500">Loading…</p>
  const users = [...new Set(rows.map(r => r.uploaded_by))], list = rows.filter(r => { const i = U[r.item_key]; return (!by || r.uploaded_by === by) && (!kind || i?.kind === kind) && (!q || `${r.filename} ${i?.title || ''}`.toLowerCase().includes(q.toLowerCase())) })
  const S = 'rounded-lg border px-2 py-1.5 text-sm'
  return (<div className="mx-auto max-w-6xl space-y-3 px-4 py-5"><h2 className="text-xl font-semibold">Evidence Library</h2>
    <div className="flex flex-wrap gap-2"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search file or requirement" className={S + ' w-64'} /><select value={kind} onChange={e => setKind(e.target.value)} className={S}><option value="">All regulations</option><option value="NDMO">NDMO</option><option value="NDI">NDI</option><option value="OE">NDI OE</option></select><select value={by} onChange={e => setBy(e.target.value)} className={S}><option value="">All uploaders</option>{users.map(u => <option key={u}>{u}</option>)}</select><span className="self-center text-sm text-slate-500">{list.length} file(s)</span></div>
    <div className="overflow-auto rounded-xl border bg-white shadow-sm"><table className="w-full text-left text-sm"><thead><tr className="border-b bg-slate-50 text-xs text-slate-500"><th className="p-2">File</th><th>Requirement</th><th>Uploaded by</th><th>Date</th><th>Size</th><th /></tr></thead>
      <tbody>{list.map(r => { const i = U[r.item_key]; return <tr key={r.id} className="border-b align-top"><td className="p-2 break-all">{r.filename}</td><td className="min-w-[14rem]">{i ? <button onClick={() => go(i.nav)} className="text-left text-ksa hover:underline">{i.title}</button> : r.item_key}</td><td>{r.uploaded_by}</td><td className="whitespace-nowrap">{new Date(r.uploaded_at).toLocaleDateString('en-GB')}</td><td>{Math.round(r.size / 1024)} KB</td><td><button onClick={() => get(r.id)} className="text-ksa" aria-label="Download"><Download size={16} /></button></td></tr> })}
        {!list.length && <tr><td colSpan="6" className="p-6 text-center text-slate-400">No evidence files yet. Attach evidence on any requirement page.</td></tr>}</tbody></table></div></div>)
}
export function Reports({ openDash }) {
  const app = useApp(), { progress, me, isAdmin } = app, t = today(), all = universe()
  const R = [['Overall compliance report', 'Every requirement with status, owner and evidence', all], ['NDMO report', '', all.filter(i => i.kind === 'NDMO')], ['NDI report', '', all.filter(i => i.kind === 'NDI')], ['NDI OE report', '', all.filter(i => i.kind === 'OE')],
    ['Overdue tasks', 'Not submitted and past the deadline', all.filter(i => { const p = progress[i.key] || {}; return !p.done && p.due && p.due < t })],
    ['Missing evidence', 'No attachment and no evidence reference', all.filter(i => { const p = progress[i.key] || {}; return !p.files && !p.ref })],
    ['Awaiting review', 'Evidence Submitted or Under Review', all.filter(i => ['Evidence Submitted', 'Under Review'].includes(progress[i.key]?.wf))],
    ['Verified compliant', '', all.filter(i => progress[i.key]?.wf === 'Verified Compliant')], ['My tasks', 'Items where you are the owner', all.filter(i => isMine(progress[i.key] || {}, me))]]
  return (<div className="mx-auto max-w-5xl space-y-4 px-4 py-5"><h2 className="text-xl font-semibold">Reports</h2>
    <div className="grid gap-3 md:grid-cols-2">{R.map(([t1, d, items]) => <div key={t1} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{t1}</p><p className="text-xs text-slate-500">{d || 'PDF with your logo, colour, seal and signature'} · {items.length} item(s)</p></div>
      <button className={P} onClick={() => exportReport({ title: t1, items, ...app })}><Download size={13} />PDF</button></div>)}</div>
    <Card title="Email templates (whole portfolio)"><p className="mb-2 text-xs text-slate-500">Rich emails for all requirements. For one area, open its NDMO / NDI / NDI OE section or domain page.</p><div className="flex flex-wrap gap-2"><ScopeButtons scope={{ title: 'All requirements', filter: () => true, explain: 'Overall NDMO, NDI and NDI OE compliance portfolio.' }} prefix="portfolio" /></div></Card>
    <Card title="Data exports"><div className="flex flex-wrap gap-2"><button className={B} onClick={() => openDash('pbi')}>Power BI export & guide</button>
      {isAdmin && ['NDMO', 'NDI', 'OE'].map(k => <button key={k} className={B} onClick={() => download(`bulk-${k}.csv`, bulkCsv(k, progress))}>Bulk CSV – {k === 'OE' ? 'NDI OE' : k} (admin)</button>)}</div></Card></div>)
}
