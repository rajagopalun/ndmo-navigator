import { useState, useEffect, useMemo } from 'react'
import { PanelLeftClose, PanelLeftOpen, ChevronRight, ChevronDown, CheckCircle2, Circle, Plus } from 'lucide-react'
import { Badge } from '../lib/ui.jsx'
import { SectionHome, BranchOverview } from './Overview.jsx'
import { specifications, controls, maturityQuestions, oeMetrics } from '../ndmoData.js'
import { useApp } from '../lib/store.jsx'
import { buildTree, ancestors, levelKeys, specsForLevel, dn, first, firstLevel, menuFor, specsOfControl, keysOf, leafKeys, siblingIds, branchIds, findNode, pathTo } from '../lib/nav.js'
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
const Tree = ({ nodes, depth, ctx }) => nodes.map(n => {
  const { t, d } = ctx.stat(n), pct = t ? Math.round(d * 100 / t) : 0, active = ctx.sel === n.id, ind = { marginLeft: depth * 10, width: `calc(100% - ${depth * 10}px)` }
  if (n.leaf) return <button key={n.id} onClick={() => ctx.pick(n.id)} style={ind} className={`mb-0.5 flex items-start gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition ${active ? 'bg-ksa text-white shadow' : 'hover:bg-ksa-light'}`}>
    {ctx.doneOf(n.id) ? <CheckCircle2 size={14} className={`mt-0.5 shrink-0 ${active ? '' : 'text-emerald-600'}`} /> : <Circle size={14} className="mt-0.5 shrink-0 opacity-40" />}<span className="min-w-0 flex-1 break-words">{n.label}</span></button>
  const open = ctx.open.has(n.id)
  return <div key={n.id} className="mb-1"><button onClick={() => { ctx.toggle(n.id); ctx.pick(n.id) }} style={ind} className={`flex items-start gap-2 rounded-lg px-2 py-2 text-left text-xs font-medium transition ${depth === 0 ? 'border-l-4 border-ksa bg-slate-50' : ''} ${active ? 'bg-ksa-light text-ksa-dark' : 'hover:bg-slate-100'}`}>
    {open ? <ChevronDown size={14} className="mt-0.5 shrink-0 text-ksa" /> : <ChevronRight size={14} className="mt-0.5 shrink-0 text-slate-400" />}
    <span className="min-w-0 flex-1"><span className="block break-words">{n.label}</span><span className="mt-1 block h-1 rounded bg-slate-200"><span className="block h-1 rounded bg-ksa" style={{ width: pct + '%' }} /></span></span>
    <span className={`shrink-0 rounded-full px-1.5 text-[10px] ${t && d === t ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{d}/{t}</span></button>
    {open && <Tree nodes={n.children} depth={depth + 1} ctx={ctx} />}</div>
})
const Rich = ({ text, go }) => text.split('\n').map((l, i) => l.startsWith('# ') ? <h4 key={i} className="mt-3 font-semibold text-ksa">{l.slice(2)}</h4> : l.startsWith('- ') ? <li key={i} className="ml-5 list-disc text-sm"><Linked text={l.slice(2)} go={go} /></li> : l.trim() ? <p key={i} className="mt-1 text-sm"><Linked text={l} go={go} /></p> : null)
function CustomView({ id, go }) {
  const { nodes, isAdmin, call, refresh } = useApp(), n = nodes.find(x => 'X:' + x.id === id), [edit, setEdit] = useState(false), [t, setT] = useState(''), [b, setB] = useState('')
  useEffect(() => { if (n) { setT(n.title); setB(n.body || '') } setEdit(false) }, [id])
  if (!n) return <p className="text-sm text-slate-500">This page no longer exists.</p>
  const kids = nodes.filter(x => x.parent_id === n.id), A = 'rounded-lg border border-ksa px-3 py-1.5 text-xs text-ksa hover:bg-ksa-light'
  const save = async () => { await call('app_save_node', { p_id: n.id, p_parent: n.parent_id, p_mode: n.mode, p_title: t, p_body: b, p_sort: n.sort }); await refresh(); setEdit(false) }
  const add = async () => { const title = prompt('Name of the new sub-menu'); if (!title) return; const nid = await call('app_save_node', { p_id: null, p_parent: n.id, p_mode: n.mode, p_title: title, p_body: '', p_sort: kids.length }); await refresh(); go({ mode: n.mode, id: 'X:' + nid }) }
  const del = async () => { if (!confirm('Delete this page and all its sub-menus?')) return; await call('app_delete_node', { p_id: n.id }); await refresh(); go({ mode: n.mode, id: first(n.mode) }) }
  return (<div className="space-y-4"><Head code="Custom section" title={n.title} scope={{ title: n.title, filter: i => i.key === 'X:' + n.id, explain: n.body }} />
    {isAdmin && <div className="flex flex-wrap gap-2"><button className={A} onClick={() => setEdit(!edit)}>{edit ? 'Cancel edit' : 'Edit title & content'}</button><button className={A} onClick={add}>+ Add sub-menu</button><button className="rounded-lg border border-red-600 px-3 py-1.5 text-xs text-red-600" onClick={del}>Delete</button></div>}
    <Track k={'X:' + n.id}>Mark this item as completed</Track>
    <Card title="Content">{edit ? <div className="space-y-2"><input value={t} onChange={e => setT(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" /><textarea value={b} onChange={e => setB(e.target.value)} rows={12} className="w-full rounded border p-2 font-mono text-xs" /><p className="text-xs text-slate-500">Use “# Heading”, “- bullet”. Codes like DG.1.1 become links.</p><button onClick={save} className="rounded-lg bg-ksa px-4 py-1.5 text-sm text-white">Save</button></div> : <Rich text={n.body || '(No content yet – an admin can edit this page.)'} go={go} />}</Card>
    {kids.length > 0 && <Card title="Sub-menus">{kids.map(k => <Chip key={k.id} onClick={() => go({ mode: n.mode, id: 'X:' + k.id })}>{k.title}</Chip>)}</Card>}</div>)
}
const mod = t => t.split(/\b(shall|must|should)\b/gi).map((x, i) => i % 2 ? <b key={i} className="text-ksa-dark">{x}</b> : x)
function NdmoView({ id, go }) {
  const { progress } = useApp(), s = specifications.find(x => x.id === id); if (!s) return null
  const dom = id.split('.')[0], c = controls.find(x => x.id === s.control), g = guide(s), wf = progress['S:' + s.id]?.wf || 'Not Started'
  const [lead, ...items] = s.text.split(/\s(?=\d+\.\s)/), points = s.text.split(/\s(?=\d+\.\s)/).flatMap(p => p.split(/(?<=\.)\s+(?=[A-Z])/)).map(x => x.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
  const groups = [...new Map(s.ndi.map(n => [n.mq + '|' + n.level, n])).values()]
  return (<div className="space-y-4">
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-start gap-3"><div className="min-w-0 flex-1"><p className="font-mono text-xs text-slate-500">{s.id} · {dn(dom)} · Control {c?.id} {c?.name}</p><h2 className="mt-1 text-2xl font-semibold leading-snug">{s.name}</h2>
      <div className="mt-2 flex flex-wrap items-center gap-2"><Badge s={wf} /><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">Priority {s.priority}</span></div></div>
      <div className="flex flex-wrap gap-2"><ScopeButtons scope={{ title: `${s.id} ${s.name}`, filter: i => i.key === 'S:' + s.id, explain: s.text, steps: g.steps, evidence: g.evidence.map(e => `[${e.mq} L${e.level}] ${e.text}`) }} /></div></div></div>
    <div className="grid gap-4 xl:grid-cols-3"><div className="space-y-4 xl:col-span-2">
      <Card title="Official regulatory text"><blockquote className="border-l-4 border-ksa bg-slate-50 px-4 py-3 font-serif text-[15px] leading-7 text-slate-800"><p><Linked text={lead} go={go} /></p>{items.length > 0 && <ol className="mt-2 list-decimal space-y-1.5 pl-6">{items.map((x, i) => <li key={i}><Linked text={x.replace(/^\d+\.\s*/, '')} go={go} /></li>)}</ol>}</blockquote>
        <p className="mt-2 text-[11px] text-slate-400">Source: NDMO Data Management and Personal Data Protection Standards v1.5 – specification {s.id}, priority {s.priority}. Wording is reproduced from the document.</p></Card>
      <Card title="Reading aid – key points"><ul className="list-disc space-y-1.5 pl-5 text-sm leading-6">{points.map((p, i) => <li key={i}>{mod(p)}</li>)}</ul><p className="mt-2 text-[11px] text-slate-400">Each point is taken from the official text above (obligation words highlighted). No requirements are added.</p></Card>
      <Card title="Implementation steps"><p className="text-sm">Goal: produce <b>{g.deliverable}</b> that satisfies this specification.</p><ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6">{g.steps.map((x, i) => <li key={i}>{x}</li>)}</ol>
        {g.roles.length > 0 && <p className="mt-3 text-sm"><b>Roles named in the text:</b> {g.roles.join(', ')}.</p>}{g.frequency && <p className="mt-1 text-sm"><b>Frequency stated:</b> {g.frequency}.</p>}
        <p className="mt-2 rounded bg-amber-50 p-2 text-[11px] text-amber-800">Suggested practice only – these steps are not official NDMO text.</p></Card>
      <Card title="Evidence checklist (acceptance evidence from the NDI document)">{!groups.length && <p className="text-sm text-slate-500">No NDI evidence item references this specification.</p>}
        {groups.map(n => { const lv = maturityQuestions[n.mq]?.levels[n.level]; return <div key={n.mq + n.level} className="mb-3"><button onClick={() => go({ mode: 'ndi', id: `${n.mq}|${n.level}` })} className="text-xs font-semibold text-ksa underline">{n.mq} · Level {n.level} {n.levelName}</button>
          <ul className="mt-1 space-y-1">{lv?.items.map((it, i) => <li key={i} className="flex gap-2 text-sm">{progress[`E:${n.mq}|${n.level}|${i}`]?.done ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" /> : <Circle size={16} className="mt-0.5 shrink-0 text-slate-300" />}<span>{it.evidence}</span></li>)}</ul></div> })}</Card></div>
      <div className="space-y-4"><Card title="Status, ownership & review history"><Track k={'S:' + s.id} defaultOpen>Evidence submitted for this specification</Track></Card>
        <Card title="Cross-references"><Sub>NDI maturity questions</Sub>{s.ndi.map(n => <Chip key={n.mq + n.level} onClick={() => go({ mode: 'ndi', id: `${n.mq}|${n.level}` })}>{n.mq} · Level {n.level}</Chip>)}
          <Sub>NDI OE metrics in this domain</Sub>{s.oe.length ? oeMetrics.filter(m => s.oe.includes(m.code)).map(m => <Chip key={m.code} onClick={() => go({ mode: 'oe', id: m.code })}>{m.code}</Chip>) : <p className="text-xs text-slate-500">None for this domain.</p>}</Card></div></div></div>)
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
  const app = useApp(), { progress, nodes, isAdmin, call, refresh } = app, tree = useMemo(() => buildTree(mode, nodes), [mode, nodes]), [open, setOpen] = useState(new Set()), [side, setSide] = useState(true)
  useEffect(() => setOpen(new Set(selId ? ancestors(mode, selId, nodes) : [])), [mode, selId])
  const toggle = id => setOpen(o => { const n = new Set(o); if (n.has(id)) n.delete(id); else { (siblingIds(tree, id) || []).forEach(s => n.delete(s)); n.add(id) } return n })
  const stat = n => { const ks = keysOf(mode, n); return { t: ks.length, d: ks.filter(k => progress[k]?.done).length } }
  const doneOf = id => { const ks = leafKeys(mode, id); return ks.length > 0 && ks.every(k => progress[k]?.done) }
  const ctx = { open, toggle, sel: selId, pick: id => go({ mode, id }), doneOf, stat }, label = { ndmo: 'NDMO', ndi: 'NDI', oe: 'NDI OE' }[mode]
  const node = selId ? findNode(tree, selId) : null, path = selId ? pathTo(tree, selId) || [] : []
  const crumbs = [{ t: label, nav: selId ? { mode, id: '' } : null }, ...path.map((n, i) => ({ t: n.label, nav: i < path.length - 1 ? { mode, id: n.id } : null }))]
  let view
  if (!selId) view = <SectionHome mode={mode} tree={tree} go={go} />
  else if (!node) view = <p className="text-sm text-slate-500">Page not found.</p>
  else if (node.custom) view = <CustomView id={selId} go={go} />
  else if (!node.leaf) view = <BranchOverview mode={mode} node={node} go={go} />
  else view = mode === 'ndmo' ? <NdmoView id={selId} go={go} /> : mode === 'ndi' ? <NdiView id={selId} go={go} /> : <OeView id={selId} go={go} />
  const addSection = async () => { const title = prompt('Name of the new section'); if (!title) return; const nid = await call('app_save_node', { p_id: null, p_parent: null, p_mode: mode, p_title: title, p_body: '', p_sort: nodes.length }); await refresh(); go({ mode, id: 'X:' + nid }) }
  return (<div className={`mx-auto grid max-w-[1500px] gap-4 px-4 py-4 ${side ? 'lg:grid-cols-[24rem_minmax(0,1fr)]' : 'lg:grid-cols-[2.75rem_minmax(0,1fr)]'}`}>
    {side ? <aside aria-label="Side menu" className="max-h-[calc(100vh-9rem)] overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-4">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-ksa to-ksa-dark px-3 py-2 text-white"><button onClick={() => go({ mode, id: '' })} className="text-sm font-semibold hover:underline">{label} overview</button>
        <span className="flex items-center gap-2 text-[11px]"><button onClick={() => setOpen(new Set(branchIds(tree)))} className="underline opacity-90">Expand all</button><button onClick={() => setOpen(new Set())} className="underline opacity-90">Collapse</button><button onClick={() => setSide(false)} aria-label="Hide menu" title="Hide menu" className="rounded p-1 hover:bg-white/20"><PanelLeftClose size={18} /></button></span></div>
      <div className="p-2"><Tree nodes={tree} depth={0} ctx={ctx} />{isAdmin && <button onClick={addSection} className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-ksa py-2 text-xs font-medium text-ksa hover:bg-ksa-light"><Plus size={14} />Add section</button>}</div></aside>
      : <button onClick={() => setSide(true)} aria-label="Show menu" title="Show menu" className="h-10 rounded-lg border bg-white p-2 text-ksa shadow-sm lg:self-start"><PanelLeftOpen size={18} /></button>}
    <div className="min-w-0 space-y-4"><nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm">{crumbs.map((c, i) => <span key={i} className="flex min-w-0 items-center gap-1">{i > 0 && <ChevronRight size={14} className="shrink-0 text-slate-400" />}
      {c.nav ? <button onClick={() => go(c.nav)} title={c.t} className="max-w-[16rem] truncate text-ksa hover:underline">{c.t}</button> : <span title={c.t} className={`max-w-[22rem] truncate ${i === crumbs.length - 1 ? 'font-semibold' : ''}`}>{c.t}</span>}</span>)}</nav>{view}</div></div>)
}
