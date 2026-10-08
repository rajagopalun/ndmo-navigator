import { controls, specifications, maturityQuestions, oeMetrics } from '../ndmoData.js'
let cache
const build = () => {
  const out = [], ctl = Object.fromEntries(controls.map(c => [c.id, c]))
  specifications.forEach(s => out.push({ key: 'S:' + s.id, kind: 'NDMO', domain: s.id.split('.')[0], group: `${s.control} ${ctl[s.control]?.name || ''}`, title: `${s.id} ${s.name}`, detail: '', tag: s.priority || '—', nav: { mode: 'ndmo', id: s.id } }))
  Object.values(maturityQuestions).forEach(q => Object.entries(q.levels).forEach(([l, lv]) => {
    const group = `${q.code} (Level ${l} – ${lv.name}): ${q.question}`, base = { kind: 'NDI', domain: q.code.split('.')[0], group, tag: 'L' + l, nav: { mode: 'ndi', id: `${q.code}|${l}` } }
    lv.items.forEach((it, i) => out.push({ ...base, key: `E:${q.code}|${l}|${i}`, title: it.evidence, detail: it.criteria ? [it.criteria.text, ...it.criteria.points].join(' ') : '' }))
    lv.loose.forEach((c, j) => out.push({ ...base, key: `C:${q.code}|${l}|${j}`, title: 'Acceptance criteria: ' + c.text, detail: c.points.join(' ') }))
  }))
  oeMetrics.forEach(m => out.push({ key: 'M:' + m.code, kind: 'OE', domain: m.domain, group: m.platform, title: `${m.code} ${m.name}`, detail: `Threshold ${m.threshold}`, tag: m.platform, nav: { mode: 'oe', id: m.code } }))
  return out
}
let extra = []
export const setExtra = n => { extra = n || [] }
const KINDS = { ndmo: 'NDMO', ndi: 'NDI', oe: 'OE' }
const custom = () => { const by = Object.fromEntries(extra.map(n => [n.id, n])), root = n => n.parent_id && by[n.parent_id] ? root(by[n.parent_id]) : n, path = n => (n.parent_id && by[n.parent_id] ? path(by[n.parent_id]) + ' › ' : '') + n.title
  return extra.map(n => ({ key: 'X:' + n.id, kind: KINDS[n.mode], domain: root(n).title, group: path(n), title: n.title, detail: (n.body || '').slice(0, 200), tag: 'Custom', nav: { mode: n.mode, id: 'X:' + n.id } })) }
export const universe = () => [...(cache ||= build()), ...custom()]
