import { useState, useEffect, useMemo } from 'react'
import { PanelLeftClose, PanelLeftOpen, ChevronRight, ChevronDown, CheckCircle2 } from 'lucide-react'
import { specifications, controls, maturityQuestions, oeMetrics } from '../ndmoData.js'
import { useApp } from '../lib/store.jsx'
import { buildTree, ancestors, levelKeys, specsForLevel, dn, first, firstLevel, menuFor, specsOfControl } from '../lib/nav.js'
import { guide } from '../lib/guide.js'
import { exportReport } from '../lib/exporter.js'
import { universe } from '../lib/items.js'
import ScopeButtons from './ScopeButtons.jsx'
import Track from './Track.jsx'; import Linked from './Linked.jsx'
const Card = ({ title, children }) => <section className="rounded-lg border bg-white p-4"><h3 className="mb-2 text-sm font-semibold text-ksa">{title}</h3>{children}</section>
const Chip = ({ onClick, children }) => <button onClick={onClick} className="mb-1.5 mr-1.5 rounded border border-ksa px-2 py-0.5 text-left text-xs text-ksa hover:bg-ksa-light">{children}</button>
const Sub = ({ children }) => <p className="mb-1 mt-3 text-xs font-semibold uppercase text-slate-500">{children}</p>
const Head = ({ code, title, sub, scope }) => (<div className="flex flex-wrap items-start gap-2"><div className="min-w-0 flex-1"><p className="font-mono text-xs text-slate-500">{code}</p><h2 className="text-xl font-semibold">{title}</h2>{sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}</div>
  <div className="flex flex-wrap gap-2"><ScopeButtons scope={scope} /></div></div>)
const Tree = ({ nodes, depth, ctx }) => nodes.map(n => n.leaf
  ? <button key={n.id} onClick={() => ctx.pick(n.id)} style={{ paddingLeft: depth * 12 + 8 }} className={`flex w-full items-start gap-1 rounded py-1 pr-1 text-left text-xs ${ctx.sel === n.id ? 'bg-ksa text-white' : 'hover:bg-slate-100'}`}>{ctx.doneOf(n.id) && <CheckCircle2 size={13} className="mt-0.5 shrink-0" />}<span>{n.label}</span></button>
  : <div key={n.id}><button onClick={() => ctx.toggle(n.id)} style={{ paddingLeft: depth * 12 + 2 }} className="flex w-full items-start gap-1 py-1 text-left text-xs font-medium hover:bg-slate-50">{ctx.open.has(n.id) ? <ChevronDown size={14} className="mt-0.5 shrink-0" /> : <ChevronRight size={14} className="mt-0.5 shrink-0" />}<span>{n.label}</span></button>
    {ctx.open.has(n.id) && <Tree nodes={n.children} depth={depth + 1} ctx={ctx} />}</div>)

function NdmoView({ id, go }) {
  const app = useApp(), s = specifications.find(x => x.id === id); if (!s) return null
  const dom = id.split('.')[0], c = controls.find(x => x.id === s.control), g = guide(s)
  return (<div className="space-y-4">
    <Head code={`${s.id} · Priority ${s.priority} · ${dn(dom)}`} title={s.name} sub={`Control ${c?.id} – ${c?.name}. ${c?.description}`} scope={{ title: `${s.id} ${s.name}`, filter: i => i.key === 'S:' + s.id, explain: s.text, steps: g.steps, evidence: g.evidence.map(e => `[${e.mq} L${e.level}] ${e.text}`) }} />
    <Track k={'S:' + s.id}>Mark this specification as completed (the date is logged)</Track>
    <Card title="Official specification text"><p className="text-sm leading-relaxed"><Linked text={s.text} go={go} /></p></Card>
    <Card title="How to implement – step by step">
      <p className="text-sm">Goal: produce <b>{g.deliverable}</b> that satisfies this specification.</p>
      {g.requirements.length > 0 && <><Sub>It must cover</Sub><ul className="list-disc space-y-1 pl-5 text-sm">{g.requirements.map((r, i) => <li key={i}><Linked text={r} go={go} /></li>)}</ul></>}
      <Sub>Steps</Sub><ol className="list-decimal space-y-1 pl-5 text-sm">{g.steps.map((x, i) => <li key={i}>{x}</li>)}</ol>
      {g.roles.length > 0 && <p className="mt-3 text-sm"><b>Who is involved:</b> {g.roles.join(', ')}.</p>}
      {g.frequency && <p className="mt-1 text-sm"><b>How often:</b> {g.frequency}.</p>}
      {g.evidence.length > 0 && <><Sub>You are done when you can show (NDI evidence)</Sub><ul className="list-disc space-y-1 pl-5 text-sm">{g.evidence.map((e, i) => <li key={i}><button onClick={() => go({ mode: 'ndi', id: `${e.mq}|${e.level}` })} className="font-mono text-xs text-ksa underline">{e.mq} L{e.level}</button> {e.text}</li>)}</ul></>}
      <p className="mt-3 text-xs text-amber-700">Steps are practical guidance built from this specification’s wording – not official NDMO text.</p></Card>
    <Card title="Cross-references">
      <Sub>NDI maturity questions that need evidence from this specification</Sub>{s.ndi.map(n => <Chip key={n.mq + n.level} onClick={() => go({ mode: 'ndi', id: `${n.mq}|${n.level}` })}>{n.mq} · Level {n.level} {n.levelName}</Chip>)}
      <Sub>NDI OE metrics in this domain</Sub>{s.oe.length ? oeMetrics.filter(m => s.oe.includes(m.code)).map(m => <Chip key={m.code} onClick={() => go({ mode: 'oe', id: m.code })}>{m.code} {m.name}</Chip>) : <p className="text-xs text-slate-500">None for this domain.</p>}</Card>
  </div>)
}
function NdiView({ id, go }) {
  const app = useApp(), { progress } = app, [mq, l] = id.split('|'), q = maturityQuestions[mq], lv = q?.levels[l]; if (!lv) return null
  const dom = mq.split('.')[0], keys = levelKeys(mq, l), done = keys.filter(k => progress[k]?.done).length
  const Crit = ({ c }) => c ? <div className="rounded bg-slate-50 p-2 text-xs text-slate-700"><p className="font-semibold">Acceptance criteria</p><p><Linked text={c.text} go={go} /></p>{c.points.length > 0 && <ul className="mt-1 list-disc space-y-0.5 pl-5">{c.points.map((p, i) => <li key={i}><Linked text={p} go={go} /></li>)}</ul>}</div> : null
  return (<div className="space-y-4">
    <Head code={`${mq} · Level ${l} – ${lv.name}`} title={q.question} sub={`${dn(dom)} · ${done} of ${keys.length} items submitted`} scope={{ title: `${mq} Level ${l} – ${lv.name}`, filter: i => i.kind === 'NDI' && i.nav.id === id, explain: q.question }} />
    <div>{Object.entries(q.levels).map(([k, v]) => <button key={k} onClick={() => go({ mode: 'ndi', id: `${mq}|${k}` })} className={`mr-1.5 rounded-full border px-3 py-1 text-xs ${k === l ? 'bg-ksa text-white' : 'border-ksa text-ksa hover:bg-ksa-light'}`}>Level {k} · {v.name}</button>)}</div>
    <Card title="Evidence checklist – tick each item when submitted">
      <div className="space-y-2">{lv.items.map((it, i) => <Track key={i} k={`E:${mq}|${l}|${i}`} extra={<Crit c={it.criteria} />}><b>Evidence:</b> <Linked text={it.evidence} go={go} /></Track>)}
        {lv.loose.map((c, j) => <Track key={'c' + j} k={`C:${mq}|${l}|${j}`} extra={c.points.length ? <ul className="list-disc space-y-0.5 pl-5 text-xs text-slate-700">{c.points.map((p, i) => <li key={i}><Linked text={p} go={go} /></li>)}</ul> : null}><b>Acceptance criterion:</b> <Linked text={c.text} go={go} /></Track>)}
        {!keys.length && <p className="text-sm text-slate-500">No evidence items listed for this level.</p>}</div></Card>
    <Card title="Cross-references">
      <Sub>NDMO specifications evidenced at this level</Sub>{specsForLevel(mq, l).map(s => <Chip key={s.id} onClick={() => go({ mode: 'ndmo', id: s.id })}>{s.id} {s.name}</Chip>)}
      {!specsForLevel(mq, l).length && <p className="text-xs text-slate-500">None mapped at this level.</p>}
      <Sub>All NDMO specifications for this question</Sub>{specifications.filter(s => s.ndi.some(n => n.mq === mq)).map(s => <Chip key={s.id} onClick={() => go({ mode: 'ndmo', id: s.id })}>{s.id}</Chip>)}
      <Sub>NDI OE metrics in this domain</Sub>{oeMetrics.filter(m => m.domain === dom).map(m => <Chip key={m.code} onClick={() => go({ mode: 'oe', id: m.code })}>{m.code} {m.name}</Chip>)}</Card>
  </div>)
}
function OeView({ id, go }) {
  const app = useApp(), m = oeMetrics.find(x => x.code === id); if (!m) return null
  return (<div className="space-y-4">
    <Head code={`${m.code} · ${dn(m.domain)}`} title={m.name} sub={`Platform: ${m.platform} · Acceptable threshold: ${m.threshold}${m.round3Weight ? ` · 2026 weight: ${m.round3Weight}` : ' · not weighted in the 2026 round'}`} scope={{ title: `${m.code} ${m.name}`, filter: i => i.key === 'M:' + m.code, explain: m.desc, evidence: ['Screenshot or export of the national platform report showing the metric result', `Action plan or proof that the ${m.threshold} threshold is met`] }} />
    <Track k={'M:' + m.code}>Mark this metric target as achieved / completed</Track>
    <Card title="Metric description"><p className="text-sm leading-relaxed"><Linked text={m.desc} go={go} /></p>
      <p className="mt-2 text-xs text-slate-500">OE results are measured automatically from the national platforms; no evidence is submitted to SDAIA. Use this item to track your internal action status.</p></Card>
    <Card title="Cross-references">
      <Sub>NDMO specifications in this domain</Sub>{specifications.filter(s => s.id.startsWith(m.domain + '.')).map(s => <Chip key={s.id} onClick={() => go({ mode: 'ndmo', id: s.id })}>{s.id}</Chip>)}
      <Sub>NDI maturity questions in this domain</Sub>{Object.values(maturityQuestions).filter(q => q.code.startsWith(m.domain + '.')).map(q => <Chip key={q.code} onClick={() => go({ mode: 'ndi', id: `${q.code}|${Object.keys(q.levels)[0]}` })}>{q.code}</Chip>)}</Card>
  </div>)
}
export default function Workspace({ mode, selId, go }) {
  const app = useApp(), { progress } = app, tree = useMemo(() => buildTree(mode), [mode]), [open, setOpen] = useState(new Set()), [side, setSide] = useState(true)
  useEffect(() => setOpen(o => new Set([...o, ...ancestors(mode, selId)])), [mode, selId])
  const toggle = id => setOpen(o => { const n = new Set(o); n.has(id) ? n.delete(id) : n.add(id); return n })
  const doneOf = id => mode === 'ndmo' ? !!progress['S:' + id]?.done : mode === 'oe' ? !!progress['M:' + id]?.done : (([mq, l]) => { const ks = levelKeys(mq, l); return ks.length > 0 && ks.every(k => progress[k]?.done) })(id.split('|'))
  const ctx = { open, toggle, sel: selId, pick: id => go({ mode, id }), doneOf }
  const dom = selId.split('.')[0], label = { ndmo: 'NDMO', ndi: 'NDI', oe: 'NDI OE' }[mode], kind = { ndmo: 'NDMO', ndi: 'NDI', oe: 'OE' }[mode]
  const crumbs = [{ t: label, nav: { mode, id: first(mode) } }, { t: `${dom} · ${dn(dom)}`, nav: menuFor(mode).find(m => m.id === dom)?.nav }]
  if (mode === 'ndmo') { const c = selId.split('.').slice(0, 2).join('.'); crumbs.push({ t: `Control ${c}`, nav: { mode, id: specsOfControl(c)[0]?.id || selId } }, { t: selId }) }
  if (mode === 'ndi') { const [mq, l] = selId.split('|'); crumbs.push({ t: mq, nav: { mode, id: `${mq}|${firstLevel(mq)}` } }, { t: `Level ${l}` }) }
  if (mode === 'oe') crumbs.push({ t: selId })
  const dscope = { title: `${label} – ${dn(dom)}`, filter: i => i.kind === kind && i.domain === dom, explain: `All ${label} items of the ${dn(dom)} domain.` }
  return (<div className={`mx-auto grid max-w-[1500px] gap-4 px-4 py-4 ${side ? 'lg:grid-cols-[24rem_minmax(0,1fr)]' : 'lg:grid-cols-[2.75rem_minmax(0,1fr)]'}`}>
    {side ? <aside aria-label="Side menu" className="max-h-[calc(100vh-9rem)] overflow-auto rounded-lg border bg-white p-2 lg:sticky lg:top-4">
      <div className="mb-1 flex items-center justify-between border-b pb-1"><span className="text-xs font-semibold text-ksa">{label} menu</span><button onClick={() => setSide(false)} aria-label="Hide menu" title="Hide menu" className="rounded p-1 text-ksa hover:bg-ksa-light"><PanelLeftClose size={18} /></button></div>
      <Tree nodes={tree} depth={0} ctx={ctx} /></aside>
      : <button onClick={() => setSide(true)} aria-label="Show menu" title="Show menu" className="h-10 rounded border bg-white p-2 text-ksa lg:self-start"><PanelLeftOpen size={18} /></button>}
    <div className="min-w-0 space-y-4">
      <div className="rounded-lg border bg-white p-3">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">{crumbs.map((c, i) => <span key={i} className="flex items-center gap-1">{i > 0 && <ChevronRight size={14} className="text-slate-400" />}
          {c.nav && i < crumbs.length - 1 ? <button onClick={() => go(c.nav)} className="text-ksa hover:underline">{c.t}</button> : <span className={i === crumbs.length - 1 ? 'font-semibold' : ''}>{c.t}</span>}</span>)}</nav>
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t pt-2"><span className="text-xs text-slate-500">Header reports:</span><ScopeButtons scope={dscope} prefix="domain" />
          <button onClick={() => exportReport({ title: `${label} – full report`, items: universe().filter(i => i.kind === kind), ...app })} className="rounded border border-ksa px-2.5 py-1.5 text-xs font-medium text-ksa hover:bg-ksa-light">Export all {label}</button></div></div>
      {mode === 'ndmo' && <NdmoView id={selId} go={go} />}{mode === 'ndi' && <NdiView id={selId} go={go} />}{mode === 'oe' && <OeView id={selId} go={go} />}</div></div>)
}
