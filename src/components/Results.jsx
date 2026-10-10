import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { buildIndex, searchItems } from '../lib/search.js'
import { WF, Badge, today } from '../lib/ui.jsx'
export default function Results({ title, init = {}, go }) {
  const { me, progress, nodes } = useApp(), [f, setF] = useState({ q: '', kind: '', domain: '', wf: '', owner: '', dept: '', from: '', to: '', ...init }), [lim, setLim] = useState(50), [show, setShow] = useState(false)
  const all = useMemo(buildIndex, [nodes]), res = useMemo(() => searchItems(all, progress, f, me), [all, progress, f, me])
  const uniq = fn => [...new Set(Object.values(progress).map(fn).filter(Boolean))].sort(), domains = [...new Set(all.filter(i => !f.kind || i.kind === f.kind).map(i => i.domain))], set = (k, v) => { setF(x => ({ ...x, [k]: v })); setLim(50) }, S = 'mt-1 w-full rounded-lg border px-2 py-1.5 text-sm', t = today()
  const T = ({ k, l }) => <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f[k]} onChange={e => set(k, e.target.checked)} />{l}</label>
  return (<div className="mx-auto max-w-[1500px] px-4 py-4"><h2 className="mb-3 text-xl font-semibold">{title}</h2>
    <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="h-fit rounded-xl border bg-white p-3 shadow-sm"><button onClick={() => setShow(!show)} className="flex w-full items-center justify-between text-sm font-semibold text-ksa lg:cursor-default" aria-expanded={show}>Filters <SlidersHorizontal size={16} className="lg:hidden" /></button>
        <div className={`${show ? 'block' : 'hidden'} space-y-3 pt-3 lg:block`}>
          <label className="block text-xs text-slate-500">Regulation<select value={f.kind} onChange={e => { set('kind', e.target.value); set('domain', '') }} className={S}><option value="">All</option><option value="NDMO">NDMO</option><option value="NDI">NDI</option><option value="OE">NDI OE</option></select></label>
          <label className="block text-xs text-slate-500">Domain<select value={f.domain} onChange={e => set('domain', e.target.value)} className={S}><option value="">All</option>{domains.map(x => <option key={x}>{x}</option>)}</select></label>
          <label className="block text-xs text-slate-500">Workflow status<select value={f.wf} onChange={e => set('wf', e.target.value)} className={S}><option value="">All</option>{WF.map(x => <option key={x}>{x}</option>)}</select></label>
          <label className="block text-xs text-slate-500">Owner<select value={f.owner} onChange={e => set('owner', e.target.value)} className={S}><option value="">All</option>{uniq(p => p.owner).map(x => <option key={x}>{x}</option>)}</select></label>
          <label className="block text-xs text-slate-500">Department<select value={f.dept} onChange={e => set('dept', e.target.value)} className={S}><option value="">All</option>{uniq(p => p.dept).map(x => <option key={x}>{x}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-2"><label className="text-xs text-slate-500">Deadline from<input type="date" value={f.from} onChange={e => set('from', e.target.value)} className={S} /></label><label className="text-xs text-slate-500">to<input type="date" value={f.to} onChange={e => set('to', e.target.value)} className={S} /></label></div>
          <div className="space-y-1 border-t pt-3"><T k="mine" l="My tasks" /><T k="overdue" l="Overdue" /><T k="soon" l="Due in 14 days" /><T k="noevidence" l="Missing evidence" /></div>
          <button onClick={() => { setF({ q: '', kind: '', domain: '', wf: '', owner: '', dept: '', from: '', to: '' }); setLim(50) }} className="text-xs text-ksa underline">Clear all filters</button></div></aside>
      <div className="min-w-0"><div className="relative mb-3"><Search className="absolute left-3 top-2.5 text-slate-400" size={18} /><input value={f.q} onChange={e => set('q', e.target.value)} placeholder="Requirement ID or keyword" aria-label="Search" className="w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm" /></div>
        <p className="mb-2 text-sm text-slate-500">{res.length} result{res.length !== 1 && 's'}</p>
        <ul className="space-y-2">{res.slice(0, lim).map(i => { const p = progress[i.key] || {}, over = !p.done && p.due && p.due < t; return (
          <li key={i.key}><button onClick={() => go(i.nav)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-ksa">
            <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-ksa-light px-1.5 font-mono text-xs text-ksa-dark">{i.code}</span><span className="text-[11px] uppercase text-slate-400">{i.kind === 'OE' ? 'NDI OE' : i.kind}</span><Badge s={p.wf} /><span className="ml-auto flex gap-3 text-xs text-slate-500">{p.owner && <span>{p.owner}</span>}{p.dept && <span>{p.dept}</span>}{p.due && <span className={over ? 'font-medium text-red-600' : ''}>{over ? 'Overdue · ' : 'Due '}{p.due}</span>}{!p.files && !p.ref && <span className="text-amber-600">No evidence</span>}</span></div>
            <p className="mt-1 text-sm font-medium">{i.title}</p><p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{i.group}</p></button></li>) })}</ul>
        {res.length > lim && <button onClick={() => setLim(lim + 50)} className="mt-3 rounded-lg border border-ksa px-4 py-2 text-sm text-ksa">Show more</button>}</div></div></div>)
}
