import { useState } from 'react'
import { FileText, ListChecks, Target, ClipboardCheck, Info } from 'lucide-react'
import { maturityQuestions, oeMetrics } from '../ndmoData.js'
const Card = ({ icon: I, title, badge, children }) => (<section className="rounded-lg border bg-white p-4"><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ksa"><I size={18} aria-hidden />{title}
  {badge && <span className="ml-auto rounded bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-800">{badge}</span>}</h3>{children}</section>)
const split = t => t.split(/\s(?=\d+\.\s)/g)
export default function SpecDetail({ spec, control }) {
  const [checked, setChecked] = useState({})
  if (!spec) return <div className="rounded-lg border border-dashed bg-white p-10 text-center text-slate-500">Select a control, then a specification, to see its details.</div>
  const refs = [...new Map(spec.ndi.map(n => [n.mq, n])).values()]
  const metrics = oeMetrics.filter(m => spec.oe.includes(m.code))
  const [first, ...items] = split(spec.text)
  return (<div className="space-y-4">
    <div><p className="font-mono text-sm text-slate-500">{spec.id} · {control?.name}</p><h2 className="text-xl font-semibold">{spec.name}</h2>
      <span className="mt-1 inline-block rounded bg-slate-200 px-2 py-0.5 text-xs">Priority {spec.priority}</span></div>
    <Card icon={FileText} title="Official specification text"><p className="text-sm leading-relaxed">{first}</p>
      {items.length > 0 && <ol className="mt-2 list-inside space-y-1 text-sm">{items.map((i, k) => <li key={k}>{i}</li>)}</ol>}</Card>
    <Card icon={ListChecks} title="Implementation methodology" badge="Recommended practice – not official NDMO content">
      <ol className="list-decimal space-y-1.5 pl-5 text-sm">{spec.methodology.map((m, i) => <li key={i}>{m}</li>)}</ol></Card>
    <Card icon={Target} title="Related NDI metrics">
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Maturity questions evidenced by this specification</p>
      <ul className="space-y-2 text-sm">{refs.map(r => (<li key={r.mq}><span className="rounded bg-ksa-light px-1.5 font-mono text-xs text-ksa-dark">{r.mq}</span> {maturityQuestions[r.mq]?.question}
        <span className="block text-xs text-slate-500">Evidence required from {spec.ndi.filter(n => n.mq === r.mq).map(n => `Level ${n.level} (${n.levelName})`).join(', ')}</span></li>))}</ul>
      {metrics.length > 0 && <><p className="mb-2 mt-4 text-xs font-semibold uppercase text-slate-500">Operational Excellence metrics in this domain (domain-level, not spec-level)</p>
        <ul className="space-y-1 text-sm">{metrics.map(m => <li key={m.code}><span className="rounded bg-sky-100 px-1.5 font-mono text-xs text-sky-900">{m.code}</span> {m.name} <span className="text-xs text-slate-500">· {m.platform} · threshold {m.threshold}{m.round3Weight ? ` · 2026 weight ${m.round3Weight}` : ''}</span></li>)}</ul></>}</Card>
    <Card icon={ClipboardCheck} title="Evidence submission checklist (NDI Appendix II)">
      {refs.map(r => (<div key={r.mq} className="mb-4 last:mb-0">{spec.ndi.filter(n => n.mq === r.mq).map(n => { const lv = maturityQuestions[r.mq]?.levels[n.level]; return (
        <div key={n.level} className="mb-3"><p className="text-xs font-semibold"><span className="font-mono">{r.mq}</span> · Level {n.level} – {n.levelName}</p>
          <ul className="mt-1 space-y-1">{(lv?.evidence || []).map((e, i) => { const k = `${spec.id}|${r.mq}|${n.level}|${i}`; return (
            <li key={k}><label className="flex cursor-pointer gap-2 text-sm"><input type="checkbox" checked={!!checked[k]} onChange={() => setChecked(c => ({ ...c, [k]: !c[k] }))} className="mt-1 accent-[#006C35]" />
              <span className={checked[k] ? 'text-slate-400 line-through' : ''}>{e}</span></label></li>) })}</ul>
          {lv?.criteria?.length > 0 && <details className="mt-1 text-xs text-slate-600"><summary className="cursor-pointer text-ksa">Acceptance criteria</summary><ul className="mt-1 list-disc space-y-0.5 pl-5">{lv.criteria.map((c, i) => <li key={i}>{c}</li>)}</ul></details>}
        </div>) })}</div>))}
      <p className="mt-3 flex gap-1 text-xs text-slate-500"><Info size={14} className="mt-0.5 shrink-0" />The checklist lists all evidence for the maturity level; the spec is one of the inputs to it. Ticks are session-only.</p></Card>
  </div>)
}
