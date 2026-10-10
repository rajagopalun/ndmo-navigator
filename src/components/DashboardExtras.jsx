import { useState } from 'react'
import { FileDown, Download } from 'lucide-react'
import { dn } from '../lib/nav.js'
import { exportReport, download } from '../lib/exporter.js'
import { HEAD, SECTIONS, KB_TITLE, toMarkdown } from '../lib/kb.js'
const q = s => `"${String(s ?? '').replace(/"/g, '""')}"`
const cls = { Completed: 'text-ksa', Overdue: 'text-red-600', Pending: 'text-slate-600' }
export function MetricsTable({ items, csv, app, title, go }) {
  const [pg, setPg] = useState(0), size = 40, pages = Math.max(1, Math.ceil(items.length / size)), page = Math.min(pg, pages - 1), rows = items.slice(page * size, page * size + size)
  return (<div className="rounded-lg border bg-white p-3">
    <div className="mb-2 flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">Metrics table – {items.length} items (follows the filters above)</p>
      <span className="ml-auto flex gap-2"><button onClick={csv} className="rounded border border-ksa px-3 py-1.5 text-xs text-ksa">Export CSV</button><button onClick={() => exportReport({ title, items, ...app })} className="flex items-center gap-1 rounded bg-ksa px-3 py-1.5 text-xs text-white"><FileDown size={14} />Export PDF</button></span></div>
    <div className="overflow-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b text-slate-500">{['Type', 'Domain', 'Metric / item name', 'Group', 'Priority / level', 'Status', 'Submitted', 'Due', 'Owner', 'Workflow', 'Reviewer', 'Files'].map(h => <th key={h} className="px-2 py-1">{h}</th>)}</tr></thead>
      <tbody>{rows.map(i => <tr key={i.key} className="border-b align-top"><td className="px-2 py-1">{i.kind}</td><td className="px-2 py-1">{i.domain}</td>
        <td className="min-w-[18rem] px-2 py-1"><button onClick={() => go(i.nav)} className="text-left text-ksa hover:underline">{i.title}</button></td><td className="min-w-[10rem] px-2 py-1">{i.group}</td><td className="px-2 py-1">{i.tag}</td>
        <td className={`px-2 py-1 font-medium ${cls[i.status]}`}>{i.status}</td><td className="px-2 py-1">{i.p.date?.slice(0, 10)}</td><td className="px-2 py-1">{i.p.due}</td><td className="px-2 py-1">{i.p.owner}</td><td className="px-2 py-1">{i.p.wf}</td><td className="px-2 py-1">{i.p.reviewer}</td><td className="px-2 py-1">{i.p.files || ''}</td></tr>)}</tbody></table></div>
    <div className="mt-2 flex items-center gap-3 text-xs"><button disabled={page === 0} onClick={() => setPg(page - 1)} className="rounded border px-2 py-1 disabled:opacity-40">Previous</button>Page {page + 1} of {pages}<button disabled={page >= pages - 1} onClick={() => setPg(page + 1)} className="rounded border px-2 py-1 disabled:opacity-40">Next</button></div></div>)
}
export function PowerBi({ all, profile }) {
  const csv = () => download('compliance-tracker-powerbi.csv', '\ufeff' + [HEAD, ...all.map(i => [i.kind, i.domain, dn(i.domain), i.group, i.title, i.tag, i.status, i.p.date?.slice(0, 10) || '', i.p.due || '', i.p.owner, i.p.ref, i.p.note, i.p.date?.slice(0, 7) || '', i.p.due?.slice(0, 7) || '', i.key, i.p.wf || '', i.p.reviewer || '', i.p.files || 0, i.p.pct || 0, i.p.dept || ''])].map(r => r.map(q).join(',')).join('\n'))
  const c = profile.color || '#006C35'
  const theme = () => download('compliance-tracker-theme.json', JSON.stringify({ name: 'Compliance Tracker', dataColors: [c, '#94a3b8', '#dc2626', '#f59e0b', '#0ea5e9', '#7c3aed', '#14b8a6', '#64748b'], background: '#FFFFFF', foreground: '#1e293b', tableAccent: c }, null, 2), 'application/json')
  return (<div className="space-y-4">
    <div className="rounded-lg border bg-white p-4"><h2 className="text-lg font-semibold">Export to Power BI</h2><p className="mt-1 text-sm text-slate-600">{all.length} items are ready to export. Follow the guide below to rebuild this exact dashboard in Power BI Desktop.</p>
      <div className="mt-3 flex flex-wrap gap-2"><button onClick={csv} className="flex items-center gap-1 rounded bg-ksa px-3 py-2 text-sm text-white"><Download size={15} />Download data (CSV)</button>
        <button onClick={theme} className="rounded border border-ksa px-3 py-2 text-sm text-ksa">Download Power BI theme</button>
        <button onClick={() => download('KB-PowerBI-Dashboard.md', toMarkdown(), 'text/markdown')} className="rounded border border-ksa px-3 py-2 text-sm text-ksa">Download KB article (.md)</button></div></div>
    <div className="rounded-lg border bg-white p-4"><h2 className="text-lg font-semibold text-ksa">{KB_TITLE}</h2>
      {SECTIONS.map(s => <section key={s.h} className="mt-4"><h3 className="font-semibold">{s.h}</h3>
        {s.list && <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">{s.list.map((x, i) => <li key={i}>{x}</li>)}</ol>}
        {s.code && <div className="mt-2"><pre className="overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{s.code}</pre><button onClick={() => navigator.clipboard?.writeText(s.code)} className="mt-1 text-xs text-ksa underline">Copy</button></div>}
        {s.table && <div className="mt-2 overflow-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b">{s.table[0].map(h => <th key={h} className="px-2 py-1">{h}</th>)}</tr></thead><tbody>{s.table.slice(1).map((r, i) => <tr key={i} className="border-b align-top">{r.map((x, j) => <td key={j} className="px-2 py-1">{x}</td>)}</tr>)}</tbody></table></div>}</section>)}
      <h3 className="mt-4 font-semibold">Data dictionary (CSV columns)</h3><p className="mt-1 text-sm text-slate-600">{HEAD.join(' · ')}</p></div></div>)
}
