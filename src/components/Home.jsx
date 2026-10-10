import { useState, useMemo } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { buildIndex, searchItems } from '../lib/search.js'
import { WF, Card, Bar, pctOf } from '../lib/ui.jsx'
const CHIPS = [['My tasks', { mine: true }], ['Overdue', { overdue: true }], ['Missing evidence', { noevidence: true }], ['Due in 14 days', { soon: true }], ['Under review', { wf: 'Under Review' }]]
export default function Home({ onSearch, go }) {
  const { me, progress, nodes } = useApp(), [q, setQ] = useState(''), [f, setF] = useState({ domain: '', wf: '', owner: '', dept: '', from: '', to: '' }), [adv, setAdv] = useState(false)
  const all = useMemo(buildIndex, [nodes]), uniq = fn => [...new Set(Object.values(progress).map(fn).filter(Boolean))].sort(), domains = [...new Set(all.map(i => i.domain))]
  const cnt = p => searchItems(all, progress, p, me).length
  const sec = k => { const it = all.filter(i => i.kind === k); return { t: it.length, d: it.filter(i => progress[i.key]?.wf === 'Verified Compliant').length } }
  const S = 'rounded-lg border px-2 py-2 text-sm'
  return (<div className="mx-auto max-w-5xl px-4 py-10">
    <div className="text-center"><h2 className="text-2xl font-semibold text-slate-800 sm:text-3xl">Find any requirement</h2><p className="mt-1 text-sm text-slate-500">Search by requirement ID, keyword, domain, owner, department, status or deadline</p></div>
    <form onSubmit={e => { e.preventDefault(); onSearch({ q, ...f }) }} className="mx-auto mt-6 max-w-3xl"><div className="relative"><Search className="absolute left-4 top-3.5 text-slate-400" size={20} /><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. DG.1.1, data quality plan, DSI.OE.01 …" className="w-full rounded-full border border-slate-300 bg-white py-3 pl-12 pr-28 text-base shadow-sm focus:border-ksa" aria-label="Search requirements" /><button className="absolute right-1.5 top-1.5 rounded-full bg-ksa px-5 py-2 text-sm font-medium text-white">Search</button></div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">{CHIPS.map(([l, p]) => <button type="button" key={l} onClick={() => onSearch({ q: '', ...p })} className="rounded-full border border-ksa bg-white px-3 py-1 text-xs text-ksa hover:bg-ksa-light">{l} <b>{cnt(p)}</b></button>)}<button type="button" onClick={() => setAdv(!adv)} className="rounded-full px-3 py-1 text-xs text-slate-500 underline">{adv ? 'Hide filters' : 'More filters'}</button></div>
      {adv && <div className="mt-3 grid gap-2 rounded-xl border bg-white p-3 sm:grid-cols-3"><select value={f.domain} onChange={e => setF({ ...f, domain: e.target.value })} className={S} aria-label="Domain"><option value="">Any domain</option>{domains.map(x => <option key={x}>{x}</option>)}</select>
        <select value={f.wf} onChange={e => setF({ ...f, wf: e.target.value })} className={S} aria-label="Status"><option value="">Any status</option>{WF.map(x => <option key={x}>{x}</option>)}</select>
        <select value={f.owner} onChange={e => setF({ ...f, owner: e.target.value })} className={S} aria-label="Owner"><option value="">Any owner</option>{uniq(p => p.owner).map(x => <option key={x}>{x}</option>)}</select>
        <select value={f.dept} onChange={e => setF({ ...f, dept: e.target.value })} className={S} aria-label="Department"><option value="">Any department</option>{uniq(p => p.dept).map(x => <option key={x}>{x}</option>)}</select>
        <label className="text-xs text-slate-500">Deadline from<input type="date" value={f.from} onChange={e => setF({ ...f, from: e.target.value })} className={S + ' block w-full'} /></label><label className="text-xs text-slate-500">Deadline to<input type="date" value={f.to} onChange={e => setF({ ...f, to: e.target.value })} className={S + ' block w-full'} /></label></div>}</form>
    <div className="mt-10 grid gap-4 sm:grid-cols-3">{[['ndmo', 'NDMO', 'NDMO', 'Data Management and Personal Data Protection Standards'], ['ndi', 'NDI', 'NDI', 'National Data Index – maturity and evidence'], ['oe', 'NDI OE', 'OE', 'Operational Excellence metrics']].map(([m, l, k, d]) => { const s = sec(k); return (
      <button key={m} onClick={() => go({ mode: m, id: '' })} className="group rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-ksa hover:shadow-md"><div className="flex items-center justify-between"><span className="text-lg font-semibold text-ksa">{l}</span><ArrowRight size={18} className="text-slate-300 group-hover:text-ksa" /></div>
        <p className="mt-1 min-h-[2.5rem] text-xs text-slate-500">{d}</p><div className="mt-3"><Bar pct={pctOf(s.d, s.t)} /></div><p className="mt-1 text-[11px] text-slate-500">{s.d} of {s.t} verified compliant</p></button>) })}</div></div>)
}
