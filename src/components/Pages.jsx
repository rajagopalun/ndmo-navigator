import { Download } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { universe } from '../lib/items.js'
import { exportReport, download } from '../lib/exporter.js'
import { bulkCsv } from '../lib/bulk.js'
import { isMine } from '../lib/search.js'
import { Card, today } from '../lib/ui.jsx'
import ScopeButtons from './ScopeButtons.jsx'
const P = 'flex items-center gap-1 rounded-lg bg-ksa px-3 py-1.5 text-xs font-medium text-white', B = 'rounded-lg border border-ksa px-3 py-1.5 text-xs font-medium text-ksa hover:bg-ksa-light'
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
