import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts'
import { FileDown } from 'lucide-react'
import { Kpi, WF, WFH } from '../lib/ui.jsx'
import { useApp } from '../lib/store.jsx'
import { universe } from '../lib/items.js'
import { exportReport } from '../lib/exporter.js'
import { MetricsTable, PowerBi } from './DashboardExtras.jsx'
export const SUBS = [['all', 'Overview'], ['NDMO', 'NDMO'], ['NDI', 'NDI maturity'], ['OE', 'NDI OE'], ['table', 'Metrics table'], ['pbi', 'Power BI export & guide']]
const Box = ({ title, empty, children }) => <div className="rounded-lg border bg-white p-3"><p className="mb-2 text-sm font-semibold">{title}</p><div className="h-64">{empty ? <p className="pt-20 text-center text-sm text-slate-400">No data yet – tick items or set due dates.</p> : <ResponsiveContainer>{children}</ResponsiveContainer>}</div></div>
const grp = (arr, fn) => { const m = {}; arr.forEach(i => { const k = fn(i); (m[k] ||= { name: k, Completed: 0, Pending: 0, Overdue: 0 })[i.status]++ }); return Object.values(m).sort((a, b) => a.name.localeCompare(b.name)) }
export default function Dashboard({ go, sub, setSub }) {
  const app = useApp(), { progress, profile, nodes } = app, [f, setF] = useState({ kind: '', wf: '', domain: '', status: '', tag: '', owner: '', from: '', to: '', q: '' })
  const t = new Date().toISOString().slice(0, 10), soon = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10)
  const all = useMemo(() => universe().map(i => { const p = progress[i.key] || {}; return { ...i, p, status: p.done ? 'Completed' : p.due && p.due < t ? 'Overdue' : 'Pending' } }), [progress, t, nodes])
  const base = all.filter(i => ['all', 'table', 'pbi'].includes(sub) || i.kind === sub), uniq = fn => [...new Set(base.map(fn).filter(Boolean))].sort()
  const items = base.filter(i => (!f.kind || i.kind === f.kind) && (!f.wf || (i.p.wf || 'Not Started') === f.wf) && (!f.domain || i.domain === f.domain) && (!f.status || i.status === f.status) && (!f.tag || i.tag === f.tag) && (!f.owner || i.p.owner === f.owner) && (!f.from || (i.p.due || '') >= f.from) && (!f.to || (i.p.due && i.p.due <= f.to)) && (!f.q || i.title.toLowerCase().includes(f.q.toLowerCase())))
  const n = s => items.filter(i => i.status === s).length, total = items.length, pct = total ? Math.round(n('Completed') * 100 / total) : 0, wfc = s => items.filter(i => (i.p.wf || 'Not Started') === s).length, verified = wfc('Verified Compliant'), review = wfc('Evidence Submitted') + wfc('Under Review'), overall = total ? Math.round(verified * 100 / total) : 0, wfData = WF.map(name => ({ name, value: wfc(name) }))
  const C = { Completed: profile.color || '#006C35', Pending: '#94a3b8', Overdue: '#dc2626' }
  const pie = ['Completed', 'Pending', 'Overdue'].map(name => ({ name, value: n(name) })).filter(x => x.value)
  const byDomain = grp(items, i => i.domain), byTag = grp(items, i => i.tag), dueM = grp(items.filter(i => !i.p.done && i.p.due), i => i.p.due.slice(0, 7))
  let cum = 0; const doneM = Object.entries(items.filter(i => i.p.done && i.p.date).reduce((m, i) => { const k = i.p.date.slice(0, 7); m[k] = (m[k] || 0) + 1; return m }, {})).sort().map(([name, v]) => ({ name, Completed: v, Cumulative: cum += v }))
  const upcoming = items.filter(i => !i.p.done && i.p.due && i.p.due <= soon).sort((a, b) => a.p.due.localeCompare(b.p.due)).slice(0, 25)
  const set = (k, v) => setF(x => ({ ...x, [k]: v })), pickDomain = d => set('domain', f.domain === d.name ? '' : d.name)
  const csv = () => { const q = s => `"${String(s ?? '').replace(/"/g, '""')}"`, rows = [['Type', 'Domain', 'Group', 'Item', 'Status', 'Submitted', 'Due', 'Owner', 'Evidence ref', 'Notes'], ...items.map(i => [i.kind, i.domain, i.group, i.title, i.status, i.p.date?.slice(0, 10), i.p.due, i.p.owner, i.p.ref, i.p.note])]
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + rows.map(r => r.map(q).join(',')).join('\n')], { type: 'text/csv' })); a.download = 'compliance-tracker.csv'; a.click() }
  const sel = 'rounded border px-2 py-1.5 text-sm'
  return (<div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-4 lg:grid-cols-[12rem_minmax(0,1fr)]">
    <aside className="rounded-lg border bg-white p-2 lg:self-start">{SUBS.map(([k, l]) => <button key={k} onClick={() => { setSub(k); setF({ kind: '', wf: '', domain: '', status: '', tag: '', owner: '', from: '', to: '', q: '' }) }} className={`block w-full rounded px-3 py-2 text-left text-sm ${sub === k ? 'bg-ksa text-white' : 'hover:bg-slate-100'}`}>{l}</button>)}</aside>
    <div className="min-w-0 space-y-4">
      <p className="text-sm text-slate-500">Dashboard <span aria-hidden>›</span> <b className="text-slate-800">{SUBS.find(s => s[0] === sub)[1]}</b></p>
      {sub === 'pbi' ? <PowerBi all={all} profile={profile} /> : <>
      <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-white p-3">
        <input placeholder="Search items…" value={f.q} onChange={e => set('q', e.target.value)} className={sel + ' w-44'} />
        {['all', 'table'].includes(sub) && <select aria-label="Type" value={f.kind} onChange={e => set('kind', e.target.value)} className={sel}><option value="">NDMO + NDI + NDI OE</option><option value="NDMO">NDMO</option><option value="NDI">NDI maturity</option><option value="OE">NDI OE</option></select>}
        <select aria-label="Domain" value={f.domain} onChange={e => set('domain', e.target.value)} className={sel}><option value="">All domains</option>{uniq(i => i.domain).map(x => <option key={x}>{x}</option>)}</select>
        <select aria-label="Workflow status" value={f.wf} onChange={e => set('wf', e.target.value)} className={sel}><option value="">All workflow statuses</option>{WF.map(x => <option key={x}>{x}</option>)}</select>
        <select aria-label="Status" value={f.status} onChange={e => set('status', e.target.value)} className={sel}><option value="">All status</option><option value="Completed">Evidence submitted or later</option><option value="Pending">Not submitted</option><option value="Overdue">Overdue</option></select>
        <select aria-label="Priority / level / platform" value={f.tag} onChange={e => set('tag', e.target.value)} className={sel}><option value="">Priority / level / platform</option>{uniq(i => i.tag).map(x => <option key={x}>{x}</option>)}</select>
        <select aria-label="Owner" value={f.owner} onChange={e => set('owner', e.target.value)} className={sel}><option value="">All owners</option>{uniq(i => i.p.owner).map(x => <option key={x}>{x}</option>)}</select>
        <label className="text-xs">Due from<input type="date" value={f.from} onChange={e => set('from', e.target.value)} className={sel + ' block'} /></label>
        <label className="text-xs">Due to<input type="date" value={f.to} onChange={e => set('to', e.target.value)} className={sel + ' block'} /></label>
        <button onClick={() => setF({ kind: '', wf: '', domain: '', status: '', tag: '', owner: '', from: '', to: '', q: '' })} className="text-sm text-ksa underline">Clear</button>
        <span className="ml-auto flex gap-2"><button onClick={csv} className="rounded border border-ksa px-3 py-1.5 text-sm text-ksa">CSV</button>
          <button onClick={() => exportReport({ title: `Compliance status – ${SUBS.find(s => s[0] === sub)[1]}`, items, ...app })} className="flex items-center gap-1 rounded bg-ksa px-3 py-1.5 text-sm text-white"><FileDown size={15} />PDF</button></span></div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"><Kpi l="Overall compliance" v={overall + '%'} c="text-ksa" sub="verified compliant ÷ total" /><Kpi l="Completed (verified)" v={verified} c="text-emerald-600" /><Kpi l="Awaiting review" v={review} c="text-violet-600" /><Kpi l="Pending evidence" v={items.filter(i => !i.p.done).length} sub="not yet submitted" /><Kpi l="Overdue tasks" v={n('Overdue')} c="text-red-600" /><Kpi l="Upcoming deadlines" v={items.filter(i => !i.p.done && i.p.due >= t && i.p.due <= soon).length} sub="next 14 days" c="text-amber-600" /></div>
      <div className="h-3 overflow-hidden rounded bg-slate-200"><div className="h-full bg-ksa" style={{ width: overall + '%' }} /></div>
      {sub === 'table' ? <MetricsTable items={items} csv={csv} app={app} title={`Compliance metrics – ${SUBS.find(s => s[0] === sub)[1]}`} go={go} /> : <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Box title="Compliance workflow status (click a bar to filter)" empty={!total}><BarChart data={wfData} layout="vertical" margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={130} fontSize={11} /><Tooltip /><Bar dataKey="value" cursor="pointer" onClick={d => set('wf', f.wf === d.name ? '' : d.name)}>{wfData.map(x => <Cell key={x.name} fill={WFH[x.name]} />)}</Bar></BarChart></Box>
        <Box title="Status split (click a slice to filter)" empty={!pie.length}><PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} label onClick={d => set('status', f.status === d.name ? '' : d.name)}>{pie.map(x => <Cell key={x.name} fill={C[x.name]} />)}</Pie><Tooltip /><Legend /></PieChart></Box>
        <Box title="Progress by domain (click a bar to filter)" empty={!byDomain.length}><BarChart data={byDomain}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} /><Tooltip /><Legend />{['Completed', 'Pending', 'Overdue'].map(k => <Bar key={k} dataKey={k} stackId="a" fill={C[k]} onClick={pickDomain} cursor="pointer" />)}</BarChart></Box>
        <Box title="By priority / level / platform" empty={!byTag.length}><BarChart data={byTag}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} /><Tooltip /><Legend />{['Completed', 'Pending', 'Overdue'].map(k => <Bar key={k} dataKey={k} stackId="a" fill={C[k]} />)}</BarChart></Box>
        <Box title="Completions over time" empty={!doneM.length}><AreaChart data={doneM}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Area dataKey="Cumulative" stroke={C.Completed} fill={C.Completed} fillOpacity={.2} /><Area dataKey="Completed" stroke="#f59e0b" fill="#f59e0b" fillOpacity={.2} /></AreaChart></Box>
        <Box title="Items due by month (not yet completed)" empty={!dueM.length}><BarChart data={dueM}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="Pending" stackId="a" fill={C.Pending} /><Bar dataKey="Overdue" stackId="a" fill={C.Overdue} /></BarChart></Box></div>
      <div className="overflow-auto rounded-lg border bg-white p-3"><p className="mb-2 text-sm font-semibold">Overdue and due within 14 days</p>
        {!upcoming.length ? <p className="text-sm text-slate-400">Nothing due. Set due dates on items (Details link) to see them here.</p> : <table className="w-full text-left text-sm"><thead><tr className="border-b text-xs text-slate-500"><th className="py-1">Due</th><th>Status</th><th>Item</th><th>Owner</th><th /></tr></thead><tbody>{upcoming.map(i => <tr key={i.key} className="border-b"><td className="py-1">{i.p.due}</td><td className={i.status === 'Overdue' ? 'text-red-600' : ''}>{i.status}</td><td className="max-w-md truncate" title={i.title}>{i.kind} · {i.title}</td><td>{i.p.owner}</td><td><button onClick={() => go(i.nav)} className="text-ksa underline">Open</button></td></tr>)}</tbody></table>}</div></>}
      {['NDMO', 'NDI', 'OE'].includes(sub) && <MetricsTable items={items} csv={csv} app={app} title={`Compliance metrics – ${SUBS.find(s => s[0] === sub)[1]}`} go={go} />}
    </>}</div></div>)
}
