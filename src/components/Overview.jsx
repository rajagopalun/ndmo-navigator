import { useState, useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { controls, specifications, maturityQuestions, oeMetrics } from '../ndmoData.js'
import { keysOf, dn } from '../lib/nav.js'
import { bulkCsv, rowsFromCsv } from '../lib/bulk.js'
import { download } from '../lib/exporter.js'
import { INTRO } from '../lib/docs.js'
import { Card, Kpi, Bar, Badge, pctOf, today } from '../lib/ui.jsx'
import { DocCard } from './Library.jsx'
import ScopeButtons from './ScopeButtons.jsx'
const P = 'rounded-lg bg-ksa px-3 py-1.5 text-xs font-medium text-white', B = 'rounded-lg border border-ksa px-3 py-1.5 text-xs font-medium text-ksa hover:bg-ksa-light'
const stats = (mode, node, progress) => { const ks = keysOf(mode, node), t = today(); return { t: ks.length, sub: ks.filter(k => progress[k]?.done).length, ok: ks.filter(k => progress[k]?.wf === 'Verified Compliant').length, over: ks.filter(k => !progress[k]?.done && progress[k]?.due && progress[k].due < t).length, ks: new Set(ks) } }
const Stats = ({ s }) => <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Kpi l="Requirements" v={s.t} /><Kpi l="Evidence submitted" v={`${s.sub}`} sub={`${pctOf(s.sub, s.t)}%`} /><Kpi l="Verified compliant" v={s.ok} c="text-emerald-600" sub={`${pctOf(s.ok, s.t)}%`} /><Kpi l="Overdue" v={s.over} c={s.over ? 'text-red-600' : ''} /></div>
export function SectionHome({ mode, tree, go }) {
  const { progress, isAdmin, call, refresh, docs } = useApp(), kind = { ndmo: 'NDMO', ndi: 'NDI', oe: 'OE' }[mode], label = { ndmo: 'NDMO', ndi: 'NDI', oe: 'NDI OE' }[mode], intro = INTRO[mode]
  const s = stats(mode, { leaf: false, children: tree }, progress), [res, setRes] = useState(null)
  const imp = async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; const { rows, errors } = rowsFromCsv(await f.text()); if (!rows.length) return setRes({ updated: 0, skipped: errors }); if (!confirm(`Apply ${rows.length} row(s) from ${f.name}? Blank cells are left unchanged.`)) return
    try { const r = await call('app_import_rows', { p_rows: rows }); setRes({ updated: r.updated, skipped: [...errors, ...r.skipped] }); refresh() } catch (x) { alert(x.message) } }
  return (<div className="space-y-4">
    <Card><h2 className="text-xl font-semibold text-slate-800">{intro.title}</h2>{intro.paras.map((p, i) => <p key={i} className="mt-2 text-sm leading-6 text-slate-600">{p}</p>)}<p className="mt-3 rounded-lg bg-ksa-light p-2 text-xs text-ksa-dark">{intro.note}</p></Card>
    <Stats s={s} />
    <Card title="Regulatory documents"><div className="grid gap-3 md:grid-cols-2">{docs.filter(d => d.tag === label || (mode === 'ndi' && d.tag === 'NDMO')).map(d => <DocCard key={d.id} d={d} />)}</div></Card>
    <Card title="Domains and sections"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{tree.map(n => { const x = stats(mode, n, progress); return <button key={n.id} onClick={() => go({ mode, id: n.id })} className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-ksa hover:bg-ksa-light/40"><p className="text-sm font-medium">{n.label}</p><div className="mt-2"><Bar pct={pctOf(x.sub, x.t)} /></div><p className="mt-1 text-[11px] text-slate-500">{x.sub}/{x.t} submitted · {x.ok} verified{x.over ? ` · ${x.over} overdue` : ''}</p></button> })}</div></Card>
    <Card title={`${label} reports, exports and email templates`}><div className="flex flex-wrap gap-2"><ScopeButtons scope={{ title: `${label} – full report`, filter: i => i.kind === kind, explain: intro.paras[0] }} prefix={label} /></div></Card>
    {isAdmin && <Card title="Bulk update (admin only)"><p className="mb-2 text-xs text-slate-500">Export the current completion and evidence status as CSV, fill in the missing information (status, owner, reviewer, department, dates, evidence reference, notes) and import it back. Blank cells are ignored; the Key column must not be changed. Files cannot be attached via CSV. Statuses beyond “In Progress” need an evidence reference or an attached file.</p>
      <div className="flex flex-wrap items-center gap-2"><button className={P} onClick={() => download(`bulk-${kind}-${today()}.csv`, bulkCsv(kind, progress))}>Bulk export CSV</button><label className={B + ' cursor-pointer'}>Bulk import CSV<input type="file" accept=".csv" onChange={imp} className="hidden" /></label></div>
      {res && <div className="mt-3 rounded-lg bg-slate-50 p-2 text-xs"><p className="font-medium">{res.updated} item(s) updated, {res.skipped.length} skipped</p>{res.skipped.length > 0 && <ul className="mt-1 max-h-40 list-disc overflow-auto pl-5 text-red-700">{res.skipped.slice(0, 100).map((x, i) => <li key={i}>{x}</li>)}</ul>}</div>}</Card>}</div>)
}
const describe = (mode, c) => { if (mode === 'ndmo' && c.id.split('.').length === 2) return controls.find(x => x.id === c.id)?.description || ''; if (mode === 'ndi' && c.id.includes('|')) { const [mq, l] = c.id.split('|'); return `${maturityQuestions[mq].levels[l].items.length + maturityQuestions[mq].levels[l].loose.length} evidence / criteria items` } if (mode === 'oe') return (oeMetrics.find(m => m.code === c.id)?.desc || '').slice(0, 170); return '' }
export function BranchOverview({ mode, node, go }) {
  const { progress } = useApp(), s = stats(mode, node, progress), id = node.id, dom = id.split('.')[0]
  let info = ''
  if (!node.custom) { if (mode === 'ndmo' && !id.includes('.')) { const ss = specifications.filter(x => x.id.startsWith(id + '.')); info = `${dn(id)} – ${node.children.length} controls and ${ss.length} specifications (P1: ${ss.filter(x => x.priority === 'P1').length}, P2: ${ss.filter(x => x.priority === 'P2').length}, P3: ${ss.filter(x => x.priority === 'P3').length}).` }
    else if (mode === 'ndmo') info = controls.find(x => x.id === id)?.description || ''
    else if (mode === 'ndi' && !id.includes('MQ')) info = `${dn(id)} – ${node.children.length} maturity question(s), each assessed at several maturity levels with acceptance evidence.`
    else if (mode === 'ndi') info = maturityQuestions[id]?.question
    else info = `${dn(id)} – ${node.children.length} operational excellence metric(s) measured from the national data platforms.` }
  return (<div className="space-y-4"><Card><p className="font-mono text-xs text-slate-500">{node.custom ? 'Custom section' : id}</p><h2 className="text-xl font-semibold">{node.label}</h2>{info && <p className="mt-2 text-sm leading-6 text-slate-600">{info}</p>}
    <div className="mt-3 flex flex-wrap gap-2"><ScopeButtons scope={{ title: node.label, filter: i => s.ks.has(i.key), explain: info }} prefix="section" /></div></Card>
    <Stats s={s} />
    <Card title="Sub-sections"><div className="grid gap-3 md:grid-cols-2">{node.children.map(c => { const x = stats(mode, c, progress), d = describe(mode, c), wf = c.leaf && mode === 'ndmo' ? progress['S:' + c.id]?.wf : null; return (
      <button key={c.id} onClick={() => go({ mode, id: c.id })} className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-ksa hover:bg-ksa-light/40"><div className="flex items-start gap-2"><p className="flex-1 text-sm font-medium">{c.label}</p>{wf && <Badge s={wf} />}<ChevronRight size={16} className="mt-0.5 shrink-0 text-slate-300" /></div>
        {d && <p className="mt-1 line-clamp-3 text-xs text-slate-500">{d}</p>}<div className="mt-2"><Bar pct={pctOf(x.sub, x.t)} /></div><p className="mt-1 text-[11px] text-slate-500">{x.sub}/{x.t} submitted{x.ok ? ` · ${x.ok} verified` : ''}</p></button>) })}</div></Card></div>)
}
