import { controls, specifications, maturityQuestions, oeMetrics } from '../ndmoData.js'
let cache
export const universe = () => cache ||= (() => {
  const out = [], ctl = Object.fromEntries(controls.map(c => [c.id, c]))
  specifications.forEach(s => out.push({ key: 'S:' + s.id, kind: 'NDMO', domain: s.id.split('.')[0], group: `${s.control} ${ctl[s.control]?.name || ''}`, title: `${s.id} ${s.name}`, detail: '', tag: s.priority || '—', nav: { mode: 'ndmo', id: s.id } }))
  Object.values(maturityQuestions).forEach(q => Object.entries(q.levels).forEach(([l, lv]) => {
    const group = `${q.code} (Level ${l} – ${lv.name}): ${q.question}`, base = { kind: 'NDI', domain: q.code.split('.')[0], group, tag: 'L' + l, nav: { mode: 'ndi', id: `${q.code}|${l}` } }
    lv.items.forEach((it, i) => out.push({ ...base, key: `E:${q.code}|${l}|${i}`, title: it.evidence, detail: it.criteria ? [it.criteria.text, ...it.criteria.points].join(' ') : '' }))
    lv.loose.forEach((c, j) => out.push({ ...base, key: `C:${q.code}|${l}|${j}`, title: 'Acceptance criteria: ' + c.text, detail: c.points.join(' ') }))
  }))
  oeMetrics.forEach(m => out.push({ key: 'M:' + m.code, kind: 'OE', domain: m.domain, group: m.platform, title: `${m.code} ${m.name}`, detail: `Threshold ${m.threshold}`, tag: m.platform, nav: { mode: 'oe', id: m.code } }))
  return out
})()
