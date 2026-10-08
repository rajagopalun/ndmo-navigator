import { domains, controls, specifications, maturityQuestions, oeMetrics } from '../ndmoData.js'
import { firstLevel, specsOfControl } from './nav.js'
const sp = s => ({ mode: 'ndmo', id: s.id })
export const TYPES = ['Domain', 'Control', 'NDMO Specification', 'NDI Question', 'NDI Evidence', 'NDI OE Metric', 'Custom']
export const DOMAINS = [...domains.map(d => d.id), 'Custom']
const base = [
  ...domains.map(d => ({ type: 'Domain', domain: d.id, sub: d.id, title: d.name, hay: `${d.id} ${d.name}`, nav: (s => s && sp(s))(specifications.find(x => x.id.startsWith(d.id + '.'))) })),
  ...controls.map(c => ({ type: 'Control', domain: c.domain, sub: c.id, title: c.name, hay: `${c.id} ${c.name} ${c.description}`, nav: (s => s && sp(s))(specsOfControl(c.id)[0]) })),
  ...specifications.map(s => ({ type: 'NDMO Specification', domain: s.id.split('.')[0], key: 'S:' + s.id, sub: s.id, title: s.name, hay: `${s.id} ${s.name} ${s.text}`, nav: sp(s) })),
  ...Object.values(maturityQuestions).map(q => ({ type: 'NDI Question', domain: q.code.split('.')[0], sub: q.code, title: q.question, hay: `${q.code} ${q.question}`, nav: { mode: 'ndi', id: `${q.code}|${firstLevel(q.code)}` } })),
  ...Object.values(maturityQuestions).flatMap(q => Object.entries(q.levels).flatMap(([l, lv]) => lv.items.map((it, i) => ({ type: 'NDI Evidence', domain: q.code.split('.')[0], key: `E:${q.code}|${l}|${i}`, sub: `${q.code} · L${l}`, title: it.evidence, hay: `${q.code} ${it.evidence} ${it.criteria?.text || ''}`, nav: { mode: 'ndi', id: `${q.code}|${l}` } })))),
  ...oeMetrics.map(m => ({ type: 'NDI OE Metric', domain: m.domain, key: 'M:' + m.code, sub: `${m.code} · ${m.platform}`, title: m.name, hay: `${m.code} ${m.name} ${m.platform}`, nav: { mode: 'oe', id: m.code } })),
].filter(i => i.nav)
export function search(q, f = {}, progress = {}, nodes = []) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean), out = {}, t = new Date().toISOString().slice(0, 10)
  if (!terms.length && !f.type && !f.domain && !f.status) return out
  const list = [...base, ...nodes.map(n => ({ type: 'Custom', domain: 'Custom', key: 'X:' + n.id, sub: n.mode.toUpperCase() + ' · custom', title: n.title, hay: `${n.title} ${n.body || ''}`, nav: { mode: n.mode, id: 'X:' + n.id } }))]
  for (const it of list) {
    if (f.type && it.type !== f.type) continue
    if (f.domain && it.domain !== f.domain) continue
    if (f.status) { if (!it.key) continue; const p = progress[it.key] || {}; if ((p.done ? 'Completed' : p.due && p.due < t ? 'Overdue' : 'Pending') !== f.status) continue }
    const h = it.hay.toLowerCase(); if (terms.every(x => h.includes(x))) { const a = (out[it.type] ||= []); if (a.length < 8) a.push(it) }
  }
  return out
}
